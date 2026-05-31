import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/admin';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Verify the request is from Supabase
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const order = body.record;

  if (!order) {
    return NextResponse.json({ error: 'No record' }, { status: 400 });
  }

  const orderId = order.id?.slice(0, 8).toUpperCase() ?? 'N/A';
  const total = Number(order.total_amount ?? 0).toLocaleString();
  const discount = Number(order.discount_amount ?? 0);

  // Fetch order items with product/bundle details
  const supabase = createClient();
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      products ( id, name, name_en, price ),
      bundle_offers ( id, title_ar, bundle_price )
    `)
    .eq('order_id', order.id);

  const productLines = (orderItems || []).map((item: any) => {
    if (item.bundle_offers) {
      const b = item.bundle_offers;
      const name = b.title_ar || 'عرض';
      const lineTotal = Number(item.unit_price * item.quantity).toLocaleString();
      return `  • ${name} ×${item.quantity} — ${lineTotal} IQD`;
    }
    if (item.products) {
      const p = item.products;
      const name = p.name || 'منتج';
      const unitPrice = Number(item.unit_price).toLocaleString();
      const lineTotal = Number(item.unit_price * item.quantity).toLocaleString();
      return `  • ${name} — ${unitPrice} IQD ×${item.quantity} = ${lineTotal} IQD`;
    }
    return `  • منتج — ${Number(item.unit_price).toLocaleString()} IQD ×${item.quantity}`;
  });

  const message = [
    `🛍️ *طلب جديد — Skin-IQ*`,
    ``,
    `🆔 رقم الطلب: \\`${orderId}\\``,
    `👤 الاسم: ${order.contact_name ?? '—'}`,
    `📞 الهاتف: ${order.contact_phone ?? '—'}`,
    `📍 العنوان: ${order.address ?? '—'}`,
    order.google_maps_link ? `🗺️ الموقع: ${order.google_maps_link}` : null,
    ``,
    `*المنتجات:*`,
    ...productLines,
    order.promo_code ? `🎟️ كود الخصم: ${order.promo_code} (${discount.toLocaleString()} IQD)` : null,
    `💰 المجموع: *${total} IQD*`,
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram error:', err);
    return NextResponse.json({ error: 'Telegram failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
