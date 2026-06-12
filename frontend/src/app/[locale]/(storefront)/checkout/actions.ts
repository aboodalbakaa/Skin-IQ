'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface CheckoutItem {
  id: string;
  quantity: number;
}

interface CheckoutPayload {
  contact_name: string;
  contact_phone: string;
  address: string;
  google_maps_link?: string;
  promo_code?: string | null;
  items: CheckoutItem[];
}

export async function submitSpotOrder({ 
  contact_name, 
  contact_phone, 
  address,
  google_maps_link,
  promo_code,
  items 
}: CheckoutPayload) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userId = (user && user.id && user.id !== 'undefined') ? user.id : null;

  // ── STEP 1: Fetch ACTUAL prices from DB (ignore client-sent prices) ──
  const productIds = items.filter(i => !i.id.startsWith('bundle-')).map(i => i.id);
  const bundleIds = items.filter(i => i.id.startsWith('bundle-')).map(i => i.id.replace('bundle-', ''));

  const [productsResult, bundlesResult] = await Promise.all([
    productIds.length > 0
      ? supabase.from('products').select('id, name, retail_price, wholesale_price, is_active, is_out_of_stock').in('id', productIds)
      : { data: [] },
    bundleIds.length > 0
      ? supabase.from('bundle_offers').select('id, title_ar, bundle_price, is_active').in('id', bundleIds)
      : { data: [] },
  ]);

  const products = (productsResult.data || []) as any[];
  const bundles = (bundlesResult.data || []) as any[];

  const productMap = new Map(products.map(p => [p.id, p]));
  const bundleMap = new Map(bundles.map(b => [b.id, b]));

  // ── STEP 2: Validate items exist, are active, and in stock ──
  let computedTotal = 0;
  const orderItemsData: any[] = [];

  for (const item of items) {
    const isBundle = item.id.startsWith('bundle-');
    const actualId = isBundle ? item.id.replace('bundle-', '') : item.id;
    const qty = Math.max(1, Math.min(99, Math.floor(item.quantity))); // sanitize quantity

    if (isBundle) {
      const bundle = bundleMap.get(actualId);
      if (!bundle || !bundle.is_active) {
        return { error: `Bundle offer not found or inactive.` };
      }
      const unitPrice = Number(bundle.bundle_price);
      orderItemsData.push({
        order_id: '', // set after order creation
        product_id: null,
        bundle_offer_id: actualId,
        quantity: qty,
        unit_price: unitPrice,
      });
      computedTotal += unitPrice * qty;
    } else {
      const product = productMap.get(actualId);
      if (!product) {
        return { error: `Product not found.` };
      }
      if (!product.is_active || product.is_out_of_stock) {
        return { error: `Product is unavailable or out of stock.` };
      }
      const unitPrice = Number(product.retail_price);
      orderItemsData.push({
        order_id: '',
        product_id: actualId,
        bundle_offer_id: null,
        quantity: qty,
        unit_price: unitPrice,
      });
      computedTotal += unitPrice * qty;
    }
  }

  if (orderItemsData.length === 0) {
    return { error: 'No valid items in order.' };
  }

  // ── STEP 3: Validate promo code server-side ──
  let discountAmount = 0;
  let validatedPromoCode: string | null = null;

  if (promo_code) {
    const { data: promoData } = await supabase
      .from('promo_codes')
      .select('discount_type, discount_value, is_active')
      .eq('code', promo_code.toUpperCase())
      .single();

    if (promoData && promoData.is_active) {
      validatedPromoCode = promo_code.toUpperCase();
      if (promoData.discount_type === 'percentage') {
        discountAmount = Math.round((computedTotal * Number(promoData.discount_value)) / 100);
      } else {
        discountAmount = Math.min(Number(promoData.discount_value), computedTotal);
      }
    }
  }

  const finalTotal = Math.max(0, computedTotal - discountAmount);

  // ── STEP 4: Create Order ──
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
      total_amount: finalTotal,
      status: 'PENDING'
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { error: "Failed to create order. Please try again." };
  }

  // ── STEP 5: Create Order Items ──
  const itemsWithOrderId = orderItemsData.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { error: "Failed to add items to order." };
  }

  // ── STEP 6: Telegram notification (non-blocking) ──
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const orderId = order.id.slice(0, 8).toUpperCase();
      const total = finalTotal.toLocaleString();

      const productLines = items.map((item) => {
        const isBundle = item.id.startsWith('bundle-');
        const actualId = isBundle ? item.id.replace('bundle-', '') : item.id;
        if (isBundle) {
          const bundle = bundleMap.get(actualId);
          const name = bundle?.title_ar || 'عرض';
          const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
          const unitPrice = Number(bundle?.bundle_price || 0);
          return `  • ${name} ×${qty} — ${(unitPrice * qty).toLocaleString()} IQD`;
        }
        const product = productMap.get(actualId);
        const name = product?.name || 'منتج';
        const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
        const unitPrice = Number(product?.retail_price || 0);
        return `  • ${name} — ${unitPrice.toLocaleString()} IQD ×${qty} = ${(unitPrice * qty).toLocaleString()} IQD`;
      });

      const lines = [
        `<b>طلب جديد — Skin-IQ</b>`,
        ``,
        `رقم الطلب: <code>${orderId}</code>`,
        `الاسم: ${contact_name}`,
        `الهاتف: ${contact_phone}`,
        `العنوان: ${address}`,
        google_maps_link ? `الموقع: ${google_maps_link}` : null,
        ``,
        `<b>المنتجات:</b>`,
        ...productLines,
        validatedPromoCode ? `كود الخصم: ${validatedPromoCode} (${discountAmount.toLocaleString()} IQD)` : null,
        `المجموع: <b>${total} IQD</b>`,
      ].filter(Boolean).join('\n');

      const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'HTML' }),
      });

      if (!tgResponse.ok) {
        const errText = await tgResponse.text();
        console.error(`Telegram notify failed (${tgResponse.status}): ${errText}`);
      }
    }
  } catch (err) {
    console.error('Telegram notification error:', err instanceof Error ? err.message : String(err));
  }

  return { 
    success: true, 
    orderId: order.id.slice(0, 8).toUpperCase(),
    total: finalTotal 
  };
}
