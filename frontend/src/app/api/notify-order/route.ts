import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET!;

/**
 * Telegram is sent by checkout only after every order item is persisted.
 * The old database webhook raced item insertion and could also resend orders
 * during historical UPDATE operations, so it is deliberately acknowledgement-only.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const eventType = String(body.type || body.eventType || body.event || 'UNKNOWN').toUpperCase();

  return NextResponse.json({
    ok: true,
    ignored: true,
    eventType,
    reason: 'Checkout sends one authoritative notification after item persistence.',
  });
}
