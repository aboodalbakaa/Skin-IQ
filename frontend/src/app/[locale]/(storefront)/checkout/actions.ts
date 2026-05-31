'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface CheckoutPayload {
  contact_name: string;
  contact_phone: string;
  address: string;
  google_maps_link?: string;
  promo_code?: string | null;
  discount_amount?: number;
  total_amount: number;
  items: { id: string; quantity: number; price: number }[];
}

export async function submitSpotOrder({ 
  contact_name, 
  contact_phone, 
  address,
  google_maps_link,
  promo_code,
  discount_amount,
  total_amount, 
  items 
}: CheckoutPayload) {
  // Use the admin client for guests to ensure we can verify the inserted ID
  // regardless of RLS visibility on the anonymous session
  const supabase = createAdminClient();
  
  // Try to get user_id if they are logged in (using regular client for the auth check)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  
  // CRITICAL: Ensure userId is either a valid UUID or NULL. 
  // Never allow the string "undefined" to reach the database.
  const userId = (user && user.id && user.id !== 'undefined') ? user.id : null;

  // 1. Create the Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      contact_name,
      contact_phone,
      address,
      google_maps_link,
      promo_code,
      discount_amount: discount_amount || 0,
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
  const orderItemsData = items.map(item => {
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
      const total = Number(total_amount).toLocaleString();

      // Fetch product names & bundle titles for line items
      const productIds = items
        .filter(i => !i.id.startsWith('bundle-'))
        .map(i => i.id);
      const bundleIds = items
        .filter(i => i.id.startsWith('bundle-'))
        .map(i => i.id.replace('bundle-', ''));

      const [productsResult, bundlesResult] = await Promise.all([
        productIds.length > 0
          ? supabase.from('products').select('id, name, name_en, price').in('id', productIds)
          : { data: [] },
        bundleIds.length > 0
          ? supabase.from('bundle_offers').select('id, title_ar, bundle_price').in('id', bundleIds)
          : { data: [] },
      ]);

      const productMap = new Map(
        (productsResult.data || []).map(p => [p.id, p])
      );
      const bundleMap = new Map(
        (bundlesResult.data || []).map(b => [b.id, b])
      );

      // Build product lines
      const productLines = items.map((item) => {
        const isBundle = item.id.startsWith('bundle-');
        if (isBundle) {
          const bundle = bundleMap.get(item.id.replace('bundle-', ''));
          const name = bundle?.title_ar || 'عرض';
          return `  • ${name} ×${item.quantity} — ${Number(item.price * item.quantity).toLocaleString()} IQD`;
        }
        const product = productMap.get(item.id);
        const name = product?.name || 'منتج';
        const unitPrice = Number(item.price).toLocaleString();
        const lineTotal = Number(item.price * item.quantity).toLocaleString();
        return `  • ${name} — ${unitPrice} IQD ×${item.quantity} = ${lineTotal} IQD`;
      });

      const lines = [
        `🛍️ *طلب جديد — Skin-IQ*`,
        ``,
        `🆔 رقم الطلب: \\`${orderId}\\``,
        `👤 الاسم: ${contact_name}`,
        `📞 الهاتف: ${contact_phone}`,
        `📍 العنوان: ${address}`,
        google_maps_link ? `🗺️ الموقع: ${google_maps_link}` : null,
        ``,
        `*المنتجات:*`,
        ...productLines,
        promo_code ? `🎟️ كود الخصم: ${promo_code} (${Number(discount_amount).toLocaleString()} IQD)` : null,
        `💰 المجموع: *${total} IQD*`,
      ].filter(Boolean).join('\\n');

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'Markdown' }),
      });
    }
  } catch {
    // Notification failure must never block the order
  }

  return { success: true, orderId: order.id };
}
