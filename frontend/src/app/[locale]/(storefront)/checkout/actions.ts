'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface CheckoutPayload {
  contact_name: string;
  contact_phone: string;
  address: string;
  google_maps_link?: string;
  promo_code?: string | null;
  items: { id: string; quantity: number }[];
}

export async function submitSpotOrder({
  contact_name,
  contact_phone,
  address,
  google_maps_link,
  promo_code,
  items,
}: CheckoutPayload) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const userId = (user && user.id && user.id !== 'undefined') ? user.id : null;

  // Determine wholesale pricing eligibility
  let isWholesale = false;
  if (userId) {
    const { data: userData } = await supabase.from('app_users').select('role').eq('id', userId).single();
    isWholesale = userData?.role === 'WHOLESALE';
  }

  // Validate items
  if (!items || items.length === 0) return { error: 'Cart is empty.' };
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { error: 'Invalid item quantity.' };
    }
  }

  // Fetch actual prices from DB — never trust client-supplied prices
  const productIds = items.filter(i => !i.id.startsWith('bundle-')).map(i => i.id);
  const bundleIds = items.filter(i => i.id.startsWith('bundle-')).map(i => i.id.replace('bundle-', ''));

  const [productsResult, bundlesResult] = await Promise.all([
    productIds.length > 0
      ? supabase.from('products').select('id, name, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active, is_out_of_stock').in('id', productIds)
      : { data: [] as any[], error: null },
    bundleIds.length > 0
      ? supabase.from('bundle_offers').select('id, title_ar, bundle_price, is_active').in('id', bundleIds)
      : { data: [] as any[], error: null },
  ]);

  const productMap = new Map((productsResult.data || []).map((p: any) => [p.id, p]));
  const bundleMap = new Map((bundlesResult.data || []).map((b: any) => [b.id, b]));

  // Calculate server-authoritative line-item prices
  let cartTotal = 0;
  const pricedItems: { id: string; quantity: number; price: number }[] = [];

  for (const item of items) {
    const isBundle = item.id.startsWith('bundle-');
    if (isBundle) {
      const bundleId = item.id.replace('bundle-', '');
      const bundle = bundleMap.get(bundleId) as any;
      if (!bundle || !bundle.is_active) return { error: 'One or more items are no longer available.' };
      pricedItems.push({ id: item.id, quantity: item.quantity, price: bundle.bundle_price });
      cartTotal += bundle.bundle_price * item.quantity;
    } else {
      const product = productMap.get(item.id) as any;
      if (!product || !product.is_active) return { error: 'One or more items are no longer available.' };
      if (product.is_out_of_stock) return { error: `"${product.name}" is currently out of stock.` };
      const price = isWholesale
        ? (product.discount_wholesale_price || product.wholesale_price)
        : (product.discount_retail_price || product.retail_price);
      pricedItems.push({ id: item.id, quantity: item.quantity, price });
      cartTotal += price * item.quantity;
    }
  }

  // Validate promo code server-side
  let discountAmount = 0;
  let validatedPromoCode: string | null = null;

  if (promo_code) {
    const { data: promoData } = await supabase
      .from('promo_codes')
      .select('discount_type, discount_value')
      .eq('code', promo_code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoData) {
      validatedPromoCode = promo_code.toUpperCase();
      discountAmount = (promoData as any).discount_type === 'percentage'
        ? Math.round((cartTotal * (promoData as any).discount_value) / 100)
        : (promoData as any).discount_value;
    }
  }

  const total_amount = Math.max(0, cartTotal - discountAmount);

  // 1. Create the Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      contact_name,
      contact_phone,
      address,
      google_maps_link,
      promo_code: validatedPromoCode,
      discount_amount: discountAmount,
      total_amount,
      status: 'PENDING'
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { error: "Failed to create order. Please try again." };
  }

  // 2. Create Order Items
  const orderItemsData = pricedItems.map(item => {
    const isBundle = item.id.startsWith('bundle-');
    const actualId = isBundle ? item.id.replace('bundle-', '') : item.id;
    return {
      order_id: order.id,
      product_id: isBundle ? null : actualId,
      bundle_offer_id: isBundle ? actualId : null,
      quantity: item.quantity,
      unit_price: item.price
    };
  });

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { error: "Failed to add items to order." };
  }

  // Fire Telegram notification (non-blocking — never fail the order if this errors)
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const orderId = order.id.slice(0, 8).toUpperCase();
      const total = total_amount.toLocaleString();

      const productLines = pricedItems.map((item) => {
        const isBundle = item.id.startsWith('bundle-');
        if (isBundle) {
          const bundle = bundleMap.get(item.id.replace('bundle-', '')) as any;
          const name = bundle?.title_ar || 'عرض';
          return `  • ${name} ×${item.quantity} — ${Number(item.price * item.quantity).toLocaleString()} IQD`;
        }
        const product = productMap.get(item.id) as any;
        const name = product?.name || 'منتج';
        const unitPrice = Number(item.price).toLocaleString();
        const lineTotal = Number(item.price * item.quantity).toLocaleString();
        return `  • ${name} — ${unitPrice} IQD ×${item.quantity} = ${lineTotal} IQD`;
      });

      const lines = [
        `🛍️ *طلب جديد — Skin-IQ*`,
        ``,
        `🆔 رقم الطلب: \`${orderId}\``,
        `👤 الاسم: ${contact_name}`,
        `📞 الهاتف: ${contact_phone}`,
        `📍 العنوان: ${address}`,
        google_maps_link ? `🗺️ الموقع: ${google_maps_link}` : null,
        ``,
        `*المنتجات:*`,
        ...productLines,
        validatedPromoCode ? `🎟️ كود الخصم: ${validatedPromoCode} (${discountAmount.toLocaleString()} IQD)` : null,
        `💰 المجموع: *${total} IQD*`,
      ].filter(Boolean).join('\n');

      const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'Markdown' }),
      });

      if (!tgResponse.ok) {
        const errText = await tgResponse.text();
        console.error(`Telegram notify failed (${tgResponse.status}): ${errText}`);
      } else {
        console.log(`Telegram notification sent for order ${orderId}`);
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured — skipping notification');
    }
  } catch (err) {
    console.error('Telegram notification error:', err instanceof Error ? err.message : String(err));
  }

  return { success: true, orderId: order.id, totalAmount: total_amount };
}
