import { NextRequest, NextResponse } from 'next/server';

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

  const message = [
    `🛍️ *طلب جديد — Skin-IQ*`,
    ``,
    `🆔 رقم الطلب: \`${orderId}\``,
    `👤 الاسم: ${order.contact_name ?? '—'}`,
    `📞 الهاتف: ${order.contact_phone ?? '—'}`,
    `📍 العنوان: ${order.address ?? '—'}`,
    order.google_maps_link ? `🗺️ الموقع: ${order.google_maps_link}` : null,
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
