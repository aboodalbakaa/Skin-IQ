'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  calculateOrderBreakdown,
  calculatePromoDiscount,
  resolveProductUnitPrice,
  toIqd,
  type PricingTier,
} from '@/lib/order-pricing';
import { buildArabicOrderNotification } from '@/lib/order-notification';

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

interface CheckoutProduct {
  id: string;
  name: string;
  retail_price: number | string;
  wholesale_price: number | string;
  discount_retail_price: number | string | null;
  discount_wholesale_price: number | string | null;
  is_active: boolean;
  is_out_of_stock: boolean;
}

interface CheckoutBundle {
  id: string;
  title_ar: string | null;
  bundle_price: number | string;
  is_active: boolean;
}

interface PendingOrderItem {
  order_id: string;
  product_id: string | null;
  bundle_offer_id: string | null;
  quantity: number;
  unit_price: number;
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
  let pricingTier: PricingTier = 'RETAIL';

  if (userId) {
    const { data: profile, error: profileError } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .single();
    if (profileError || !profile) {
      console.error('Pricing role lookup failed:', profileError);
      return { error: 'Unable to verify your account pricing. Please try again.' };
    }
    if (profile?.role === 'WHOLESALE') pricingTier = 'WHOLESALE';
  }

  // ── STEP 1: Fetch ACTUAL prices from DB (ignore client-sent prices) ──
  const productIds = items.filter(i => !i.id.startsWith('bundle-')).map(i => i.id);
  const bundleIds = items.filter(i => i.id.startsWith('bundle-')).map(i => i.id.replace('bundle-', ''));

  const [productsResult, bundlesResult] = await Promise.all([
    productIds.length > 0
      ? supabase.from('products').select('id, name, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active, is_out_of_stock').in('id', productIds)
      : { data: [] as CheckoutProduct[], error: null },
    bundleIds.length > 0
      ? supabase.from('bundle_offers').select('id, title_ar, bundle_price, is_active').in('id', bundleIds)
      : { data: [] as CheckoutBundle[], error: null },
  ]);

  if (productsResult.error || bundlesResult.error) {
    console.error('Checkout catalog lookup failed:', productsResult.error || bundlesResult.error);
    return { error: 'Unable to verify current product prices. Please try again.' };
  }

  const products = (productsResult.data || []) as CheckoutProduct[];
  const bundles = (bundlesResult.data || []) as CheckoutBundle[];

  const productMap = new Map(products.map(p => [p.id, p]));
  const bundleMap = new Map(bundles.map(b => [b.id, b]));

  // ── STEP 2: Validate items exist, are active, and in stock ──
  let itemsSubtotal = 0;
  const orderItemsData: PendingOrderItem[] = [];

  for (const item of items) {
    const isBundle = item.id.startsWith('bundle-');
    const actualId = isBundle ? item.id.replace('bundle-', '') : item.id;
    const requestedQuantity = Number(item.quantity);
    const qty = Number.isFinite(requestedQuantity)
      ? Math.max(1, Math.min(99, Math.floor(requestedQuantity)))
      : 1;

    if (isBundle) {
      const bundle = bundleMap.get(actualId);
      if (!bundle || !bundle.is_active) {
        return { error: `Bundle offer not found or inactive.` };
      }
      const unitPrice = toIqd(bundle.bundle_price);
      orderItemsData.push({
        order_id: '', // set after order creation
        product_id: null,
        bundle_offer_id: actualId,
        quantity: qty,
        unit_price: unitPrice,
      });
      itemsSubtotal += unitPrice * qty;
    } else {
      const product = productMap.get(actualId);
      if (!product) {
        return { error: `Product not found.` };
      }
      if (!product.is_active || product.is_out_of_stock) {
        return { error: `Product is unavailable or out of stock.` };
      }
      const unitPrice = resolveProductUnitPrice(product, pricingTier);
      orderItemsData.push({
        order_id: '',
        product_id: actualId,
        bundle_offer_id: null,
        quantity: qty,
        unit_price: unitPrice,
      });
      itemsSubtotal += unitPrice * qty;
    }
  }

  if (orderItemsData.length === 0) {
    return { error: 'No valid items in order.' };
  }

  // ── STEP 3: Validate promo code server-side ──
  let discountAmount = 0;
  let validatedPromoCode: string | null = null;

  const normalizedPromoCode = promo_code?.trim().toUpperCase() || '';
  if (normalizedPromoCode) {
    const { data: promoData, error: promoError } = await supabase
      .from('promo_codes')
      .select('discount_type, discount_value, is_active')
      .eq('code', normalizedPromoCode)
      .maybeSingle();

    if (promoError) {
      console.error('Promo verification failed:', promoError);
      return { error: 'Unable to verify the promo code. Please try again.' };
    }

    if (promoData && promoData.is_active) {
      validatedPromoCode = normalizedPromoCode;
      discountAmount = calculatePromoDiscount(itemsSubtotal, promoData);
    }
  }

  const breakdown = calculateOrderBreakdown(itemsSubtotal, discountAmount);

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
      discount_amount: breakdown.discountAmount,
      total_amount: breakdown.grandTotal,
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
    await supabase.from('orders').delete().eq('id', order.id);
    return { error: "Failed to add items to order." };
  }

  // ── STEP 6: Telegram notification (non-blocking) ──
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const notificationItems = orderItemsData.map((pricedItem) => {
        const name = pricedItem.bundle_offer_id
          ? bundleMap.get(pricedItem.bundle_offer_id)?.title_ar || 'عرض'
          : pricedItem.product_id
            ? productMap.get(pricedItem.product_id)?.name || 'منتج'
            : 'منتج';

        return {
          name,
          quantity: pricedItem.quantity,
          unitPrice: pricedItem.unit_price,
        };
      });

      const message = buildArabicOrderNotification({
        orderId: order.id,
        contactName: contact_name,
        contactPhone: contact_phone,
        address,
        googleMapsLink: google_maps_link,
        items: notificationItems,
        breakdown,
        promoCode: validatedPromoCode,
      });

      const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
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
    total: breakdown.grandTotal,
    productsTotal: breakdown.productsTotal,
    deliveryFee: breakdown.deliveryFee,
  };
}
