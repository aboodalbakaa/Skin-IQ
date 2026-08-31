import type { OrderBreakdown } from './order-pricing';

export interface OrderNotificationItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderNotificationPayload {
  orderId: string;
  contactName?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  googleMapsLink?: string | null;
  items: OrderNotificationItem[];
  breakdown: OrderBreakdown;
  promoCode?: string | null;
  correction?: boolean;
}

export function escapeTelegramHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatIqd(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function buildArabicOrderNotification(payload: OrderNotificationPayload): string {
  const shortOrderId = payload.orderId.slice(0, 8).toUpperCase();
  const itemLines = payload.items.map((item) => {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Math.round(item.unitPrice);
    const lineTotal = unitPrice * quantity;
    return `  • ${escapeTelegramHtml(item.name)} — ${formatIqd(unitPrice)} د.ع × ${quantity} = ${formatIqd(lineTotal)} د.ع`;
  });

  const title = payload.correction
    ? '<b>تصحيح تفاصيل الطلب — Skin-IQ</b>'
    : '<b>طلب جديد — Skin-IQ</b>';

  return [
    title,
    payload.correction
      ? 'يرجى اعتماد هذه الرسالة بدلاً من تفاصيل السعر السابقة.'
      : null,
    '',
    `رقم الطلب: <code>${escapeTelegramHtml(shortOrderId)}</code>`,
    `الاسم: ${escapeTelegramHtml(payload.contactName || '—')}`,
    `الهاتف: ${escapeTelegramHtml(payload.contactPhone || '—')}`,
    `العنوان: ${escapeTelegramHtml(payload.address || '—')}`,
    payload.googleMapsLink
      ? `الموقع: ${escapeTelegramHtml(payload.googleMapsLink)}`
      : null,
    '',
    '<b>المنتجات:</b>',
    ...itemLines,
    '',
    `مجموع المنتجات قبل كود الخصم: <b>${formatIqd(payload.breakdown.itemsSubtotal)} د.ع</b>`,
    payload.promoCode && payload.breakdown.discountAmount > 0
      ? `كود الخصم ${escapeTelegramHtml(payload.promoCode)}: -${formatIqd(payload.breakdown.discountAmount)} د.ع`
      : null,
    `مجموع المنتجات: <b>${formatIqd(payload.breakdown.productsTotal)} د.ع</b>`,
    `التوصيل: <b>${formatIqd(payload.breakdown.deliveryFee)} د.ع</b>`,
    `المجموع الكلي: <b>${formatIqd(payload.breakdown.grandTotal)} د.ع</b>`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}
