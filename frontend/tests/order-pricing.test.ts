import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateOrderBreakdown,
  calculatePromoDiscount,
  DELIVERY_FEE_IQD,
  resolveProductUnitPrice,
  sumPricedLines,
} from '../src/lib/order-pricing';
import { buildArabicOrderNotification } from '../src/lib/order-notification';

const product = {
  retail_price: 44_000,
  discount_retail_price: 27_000,
  wholesale_price: 18_000,
  discount_wholesale_price: 16_000,
};

test('retail and wholesale customers receive their authorized discounted tier', () => {
  assert.equal(resolveProductUnitPrice(product, 'RETAIL'), 27_000);
  assert.equal(resolveProductUnitPrice(product, 'WHOLESALE'), 16_000);
});

test('missing or invalid discounts safely fall back to the tier base price', () => {
  assert.equal(resolveProductUnitPrice({ ...product, discount_retail_price: null }, 'RETAIL'), 44_000);
  assert.equal(resolveProductUnitPrice({ ...product, discount_retail_price: 55_000 }, 'RETAIL'), 44_000);
  assert.equal(resolveProductUnitPrice({ ...product, discount_wholesale_price: 0 }, 'WHOLESALE'), 18_000);
});

test('percentage and fixed promos are rounded and capped at the products subtotal', () => {
  assert.equal(calculatePromoDiscount(17_949, { discount_type: 'percentage', discount_value: 4 }), 718);
  assert.equal(calculatePromoDiscount(10_000, { discount_type: 'percentage', discount_value: 250 }), 10_000);
  assert.equal(calculatePromoDiscount(10_000, { discount_type: 'fixed', discount_value: 20_000 }), 10_000);
});

test('products, delivery and grand total reconcile exactly', () => {
  assert.deepEqual(calculateOrderBreakdown(63_000, 2_520), {
    itemsSubtotal: 63_000,
    discountAmount: 2_520,
    productsTotal: 60_480,
    deliveryFee: DELIVERY_FEE_IQD,
    grandTotal: 65_480,
  });
});

test('line totals use sanitized integer quantities and IQD values', () => {
  assert.equal(sumPricedLines([
    { unit_price: 27_000, quantity: 2 },
    { unit_price: '19,000'.replace(',', ''), quantity: 1 },
  ]), 73_000);
});

test('Telegram uses the exact persisted price breakdown and escapes customer text', () => {
  const breakdown = calculateOrderBreakdown(27_000, 0);
  const message = buildArabicOrderNotification({
    orderId: 'abc12345-0000',
    contactName: '<Sara & Co>',
    contactPhone: '0780000000',
    address: 'Erbil',
    items: [{ name: 'Eucerin <500ml>', quantity: 1, unitPrice: 27_000 }],
    breakdown,
    correction: true,
  });

  assert.match(message, /27,000 د\.ع/);
  assert.match(message, /5,000 د\.ع/);
  assert.match(message, /32,000 د\.ع/);
  assert.match(message, /&lt;Sara &amp; Co&gt;/);
  assert.doesNotMatch(message, /<Sara/);
});
