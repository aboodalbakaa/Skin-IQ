export const DELIVERY_FEE_IQD = 5_000;

export type PricingTier = 'RETAIL' | 'WHOLESALE';

export interface ProductPriceRecord {
  retail_price: number | string;
  wholesale_price: number | string;
  discount_retail_price?: number | string | null;
  discount_wholesale_price?: number | string | null;
}

export interface PromoDefinition {
  discount_type: 'percentage' | 'fixed' | string;
  discount_value: number | string;
}

export interface PricedLine {
  quantity: number;
  unit_price: number | string;
}

export interface OrderBreakdown {
  itemsSubtotal: number;
  discountAmount: number;
  productsTotal: number;
  deliveryFee: number;
  grandTotal: number;
}

function finiteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toIqd(value: unknown, fallback = 0): number {
  const parsed = finiteNumber(value);
  return parsed === null ? fallback : Math.max(0, Math.round(parsed));
}

/**
 * Resolve the price the authenticated customer is allowed to buy at.
 * A malformed "discount" above its base price is ignored so it can never
 * silently increase what the customer pays.
 */
export function resolveProductUnitPrice(
  product: ProductPriceRecord,
  tier: PricingTier,
): number {
  const baseValue = tier === 'WHOLESALE'
    ? product.wholesale_price
    : product.retail_price;
  const discountValue = tier === 'WHOLESALE'
    ? product.discount_wholesale_price
    : product.discount_retail_price;

  const base = finiteNumber(baseValue);
  if (base === null || base < 0) {
    throw new Error(`Invalid ${tier.toLowerCase()} base price.`);
  }

  const discount = finiteNumber(discountValue);
  const resolved = discount !== null && discount > 0 && discount <= base
    ? discount
    : base;

  return toIqd(resolved);
}

export function calculatePromoDiscount(
  productsSubtotal: number,
  promo?: PromoDefinition | null,
): number {
  const subtotal = toIqd(productsSubtotal);
  if (!promo || subtotal === 0) return 0;

  const rawValue = finiteNumber(promo.discount_value);
  if (rawValue === null || rawValue <= 0) return 0;

  const rawDiscount = promo.discount_type === 'percentage'
    ? subtotal * (Math.min(rawValue, 100) / 100)
    : rawValue;

  return Math.min(subtotal, toIqd(rawDiscount));
}

export function calculateOrderBreakdown(
  itemsSubtotal: number,
  discountAmount = 0,
  deliveryFee = DELIVERY_FEE_IQD,
): OrderBreakdown {
  const normalizedSubtotal = toIqd(itemsSubtotal);
  const normalizedDiscount = Math.min(normalizedSubtotal, toIqd(discountAmount));
  const normalizedDelivery = toIqd(deliveryFee);
  const productsTotal = normalizedSubtotal - normalizedDiscount;

  return {
    itemsSubtotal: normalizedSubtotal,
    discountAmount: normalizedDiscount,
    productsTotal,
    deliveryFee: normalizedDelivery,
    grandTotal: productsTotal + normalizedDelivery,
  };
}

export function sumPricedLines(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => {
    const quantity = Math.max(0, Math.floor(Number(line.quantity) || 0));
    return sum + (toIqd(line.unit_price) * quantity);
  }, 0);
}
