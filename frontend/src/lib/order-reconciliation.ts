import type { SupabaseClient } from '@supabase/supabase-js';

import {
  ALL_ORDER_IDS,
  BATCH_ID,
  EXPECTED_ALL_ORDER_IDS_SHA256,
  EXPECTED_ALL_ORDER_COUNT,
  EXPECTED_ORDER_ITEM_COUNT,
  EXPECTED_PENDING_ORDER_IDS_SHA256,
  EXPECTED_PENDING_ORDER_COUNT,
  PENDING_ORDER_IDS,
} from './reconciliation-batch';
import { buildArabicOrderNotification } from './order-notification';
import {
  calculateOrderBreakdown,
  calculatePromoDiscount,
  resolveProductUnitPrice,
  sumPricedLines,
  toIqd,
  type PricingTier,
} from './order-pricing';

type AdminClient = SupabaseClient<any>;

interface RawOrder {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: number | string;
  discount_amount: number | string | null;
  promo_code: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  google_maps_link: string | null;
  created_at: string;
}

interface RawOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  bundle_offer_id: string | null;
  quantity: number;
  unit_price: number | string;
}

interface RawProduct {
  id: string;
  name: string;
  retail_price: number | string;
  wholesale_price: number | string;
  discount_retail_price: number | string | null;
  discount_wholesale_price: number | string | null;
}

interface RawBundle {
  id: string;
  title_ar: string | null;
  bundle_price: number | string;
}

interface RawPromo {
  code: string;
  discount_type: string;
  discount_value: number | string;
}

interface RawProfile {
  id: string;
  role: string;
}

interface RawPayment {
  id: string;
  order_id: string;
  amount: number | string;
  status: string;
}

export interface ReconciliationItem {
  id: string;
  orderId: string;
  productId: string | null;
  bundleOfferId: string | null;
  quantity: number;
  oldUnitPrice: number;
  newUnitPrice: number;
  source: 'product' | 'bundle' | 'preserved-missing-reference';
}

export interface ReconciliationOrder {
  id: string;
  status: string;
  pricingTier: PricingTier;
  promoCode: string | null;
  oldDiscountAmount: number;
  newDiscountAmount: number;
  oldGrandTotal: number;
  itemsSubtotal: number;
  productsTotal: number;
  deliveryFee: number;
  newGrandTotal: number;
  items: ReconciliationItem[];
}

export interface ReconciliationSummary {
  orderCount: number;
  pendingOrderCount: number;
  itemCount: number;
  productItemCount: number;
  bundleItemCount: number;
  preservedMissingReferenceCount: number;
  wholesaleOrderCount: number;
  paymentRecordCount: number;
  changedItemCount: number;
  changedOrderCount: number;
  oldGrandTotal: number;
  itemsSubtotal: number;
  promoDiscount: number;
  productsTotal: number;
  deliveryTotal: number;
  newGrandTotal: number;
}

export interface ReconciliationManifest {
  batchId: string;
  manifestHash: string;
  summary: ReconciliationSummary;
  warnings: string[];
  orders: ReconciliationOrder[];
}

interface TelegramLedgerEntry {
  batchId: string;
  orderId: string;
  state: 'sending' | 'sent' | 'failed' | 'uncertain';
  messageHash: string;
  grandTotal: number;
  attemptedAt: string;
  sentAt?: string;
  telegramMessageId?: number;
  error?: string;
  actorId: string;
}

interface ReconciliationApplyRecord {
  batchId: string;
  verifiedManifestHash: string;
  summary: ReconciliationSummary;
}

const AUDIT_BUCKET = 'admin-audits';
const TELEGRAM_LEDGER_PREFIX = `${BATCH_ID}/telegram-corrections`;
const orderIdSet = new Set<string>(ALL_ORDER_IDS);
const pendingOrderIdSet = new Set<string>(PENDING_ORDER_IDS);

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function ensureAuditBucket(supabase: AdminClient): Promise<void> {
  const { data, error } = await supabase.storage.getBucket(AUDIT_BUCKET);
  if (data) return;

  const { error: createError } = await supabase.storage.createBucket(AUDIT_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(`Could not create the private reconciliation audit bucket: ${createError.message || error?.message}`);
  }
}

async function uploadJson(
  supabase: AdminClient,
  path: string,
  value: unknown,
  upsert: boolean,
): Promise<void> {
  await ensureAuditBucket(supabase);
  const body = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const { error } = await supabase.storage.from(AUDIT_BUCKET).upload(path, body, {
    contentType: 'application/json',
    upsert,
  });
  if (error) throw new Error(`Could not write audit record ${path}: ${error.message}`);
}

async function downloadJson<T>(supabase: AdminClient, path: string): Promise<T | null> {
  const { data, error } = await supabase.storage.from(AUDIT_BUCKET).download(path);
  if (error || !data) return null;
  return JSON.parse(await data.text()) as T;
}

async function runInBatches<T>(
  values: T[],
  size: number,
  worker: (value: T) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < values.length; index += size) {
    const results = await Promise.allSettled(values.slice(index, index + size).map(worker));
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (rejected) throw rejected.reason;
  }
}

async function loadReconciliationRows(supabase: AdminClient) {
  const frozenIds = [...ALL_ORDER_IDS];
  const [ordersResult, itemsResult, productsResult, bundlesResult, promosResult, profilesResult] = await Promise.all([
    supabase.from('orders')
      .select('id, user_id, status, total_amount, discount_amount, promo_code, contact_name, contact_phone, address, google_maps_link, created_at')
      .in('id', frozenIds),
    supabase.from('order_items')
      .select('id, order_id, product_id, bundle_offer_id, quantity, unit_price')
      .in('order_id', frozenIds),
    supabase.from('products')
      .select('id, name, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price'),
    supabase.from('bundle_offers').select('id, title_ar, bundle_price'),
    supabase.from('promo_codes').select('code, discount_type, discount_value'),
    supabase.from('app_users').select('id, role'),
  ]);

  const firstError = [ordersResult, itemsResult, productsResult, bundlesResult, promosResult, profilesResult]
    .find((result) => result.error)?.error;
  if (firstError) throw new Error(`Could not load reconciliation data: ${firstError.message}`);

  const paymentsResult = await supabase.from('payments')
    .select('id, order_id, amount, status')
    .in('order_id', frozenIds);
  const missingPaymentsTable = paymentsResult.error
    && (paymentsResult.error.code === 'PGRST205' || paymentsResult.error.code === '42P01');
  if (paymentsResult.error && !missingPaymentsTable) {
    throw new Error(`Could not audit payment records: ${paymentsResult.error.message}`);
  }

  return {
    orders: (ordersResult.data || []) as RawOrder[],
    items: (itemsResult.data || []) as RawOrderItem[],
    products: (productsResult.data || []) as RawProduct[],
    bundles: (bundlesResult.data || []) as RawBundle[],
    promos: (promosResult.data || []) as RawPromo[],
    profiles: (profilesResult.data || []) as RawProfile[],
    payments: (paymentsResult.data || []) as RawPayment[],
  };
}

export async function buildReconciliationManifest(
  supabase: AdminClient,
): Promise<ReconciliationManifest> {
  const rows = await loadReconciliationRows(supabase);
  const actualOrderIds = rows.orders.map((order) => order.id).sort();
  const expectedOrderIds = [...ALL_ORDER_IDS].sort();
  const expectedPendingIds = [...PENDING_ORDER_IDS].sort();

  const [allIdsHash, pendingIdsHash] = await Promise.all([
    sha256(expectedOrderIds.join('\n')),
    sha256(expectedPendingIds.join('\n')),
  ]);
  if (allIdsHash !== EXPECTED_ALL_ORDER_IDS_SHA256
    || pendingIdsHash !== EXPECTED_PENDING_ORDER_IDS_SHA256) {
    throw new Error('Frozen reconciliation manifest integrity check failed.');
  }

  if (!arraysEqual(actualOrderIds, expectedOrderIds) || rows.orders.length !== EXPECTED_ALL_ORDER_COUNT) {
    throw new Error(`Frozen order scope mismatch: expected ${EXPECTED_ALL_ORDER_COUNT}, found ${rows.orders.length}.`);
  }
  if (rows.items.length !== EXPECTED_ORDER_ITEM_COUNT) {
    throw new Error(`Frozen item scope mismatch: expected ${EXPECTED_ORDER_ITEM_COUNT}, found ${rows.items.length}.`);
  }

  const currentPendingIds = rows.orders
    .filter((order) => order.status === 'PENDING' && pendingOrderIdSet.has(order.id))
    .map((order) => order.id)
    .sort();
  if (!arraysEqual(currentPendingIds, expectedPendingIds)) {
    throw new Error('One or more frozen pending orders changed status. Re-audit before continuing.');
  }

  const productMap = new Map(rows.products.map((product) => [product.id, product]));
  const bundleMap = new Map(rows.bundles.map((bundle) => [bundle.id, bundle]));
  const promoMap = new Map(rows.promos.map((promo) => [promo.code.toUpperCase(), promo]));
  const roleMap = new Map(rows.profiles.map((profile) => [profile.id, profile.role]));
  const itemsByOrder = new Map<string, RawOrderItem[]>();

  rows.items.forEach((item) => {
    const group = itemsByOrder.get(item.order_id) || [];
    group.push(item);
    itemsByOrder.set(item.order_id, group);
  });

  const warnings: string[] = [];
  const reconciledOrders: ReconciliationOrder[] = rows.orders
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((order) => {
      const pricingTier: PricingTier = order.user_id && roleMap.get(order.user_id) === 'WHOLESALE'
        ? 'WHOLESALE'
        : 'RETAIL';

      const reconciledItems = (itemsByOrder.get(order.id) || [])
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((item): ReconciliationItem => {
          const oldUnitPrice = toIqd(item.unit_price);

          if (item.product_id) {
            const product = productMap.get(item.product_id);
            if (product) {
              return {
                id: item.id,
                orderId: order.id,
                productId: item.product_id,
                bundleOfferId: null,
                quantity: item.quantity,
                oldUnitPrice,
                newUnitPrice: resolveProductUnitPrice(product, pricingTier),
                source: 'product',
              };
            }
          }

          if (item.bundle_offer_id) {
            const bundle = bundleMap.get(item.bundle_offer_id);
            if (bundle) {
              return {
                id: item.id,
                orderId: order.id,
                productId: null,
                bundleOfferId: item.bundle_offer_id,
                quantity: item.quantity,
                oldUnitPrice,
                newUnitPrice: toIqd(bundle.bundle_price),
                source: 'bundle',
              };
            }
          }

          if (order.status !== 'CANCELLED') {
            throw new Error(`Active order ${order.id} contains unresolved item ${item.id}.`);
          }

          warnings.push(`Cancelled order ${order.id} item ${item.id} has no current product or bundle; stored price was preserved.`);
          return {
            id: item.id,
            orderId: order.id,
            productId: item.product_id,
            bundleOfferId: item.bundle_offer_id,
            quantity: item.quantity,
            oldUnitPrice,
            newUnitPrice: oldUnitPrice,
            source: 'preserved-missing-reference',
          };
        });

      if (reconciledItems.length === 0) {
        throw new Error(`Order ${order.id} has no items.`);
      }

      const itemsSubtotal = sumPricedLines(reconciledItems.map((item) => ({
        quantity: item.quantity,
        unit_price: item.newUnitPrice,
      })));
      const promo = order.promo_code ? promoMap.get(order.promo_code.toUpperCase()) : null;

      if (order.promo_code && !promo && toIqd(order.discount_amount) > 0) {
        throw new Error(`Order ${order.id} uses missing promo code ${order.promo_code}.`);
      }

      const newDiscountAmount = calculatePromoDiscount(itemsSubtotal, promo || null);
      const breakdown = calculateOrderBreakdown(itemsSubtotal, newDiscountAmount);

      return {
        id: order.id,
        status: order.status,
        pricingTier,
        promoCode: order.promo_code,
        oldDiscountAmount: Number(order.discount_amount || 0),
        newDiscountAmount: breakdown.discountAmount,
        oldGrandTotal: Number(order.total_amount || 0),
        itemsSubtotal: breakdown.itemsSubtotal,
        productsTotal: breakdown.productsTotal,
        deliveryFee: breakdown.deliveryFee,
        newGrandTotal: breakdown.grandTotal,
        items: reconciledItems,
      };
    });

  const allItems = reconciledOrders.flatMap((order) => order.items);
  const summary: ReconciliationSummary = {
    orderCount: reconciledOrders.length,
    pendingOrderCount: reconciledOrders.filter((order) => order.status === 'PENDING').length,
    itemCount: allItems.length,
    productItemCount: allItems.filter((item) => item.source === 'product').length,
    bundleItemCount: allItems.filter((item) => item.source === 'bundle').length,
    preservedMissingReferenceCount: allItems.filter((item) => item.source === 'preserved-missing-reference').length,
    wholesaleOrderCount: reconciledOrders.filter((order) => order.pricingTier === 'WHOLESALE').length,
    paymentRecordCount: rows.payments.length,
    changedItemCount: allItems.filter((item) => item.oldUnitPrice !== item.newUnitPrice).length,
    changedOrderCount: reconciledOrders.filter((order) => (
      toIqd(order.oldGrandTotal) !== order.newGrandTotal
      || toIqd(order.oldDiscountAmount) !== order.newDiscountAmount
    )).length,
    oldGrandTotal: reconciledOrders.reduce((sum, order) => sum + Number(order.oldGrandTotal), 0),
    itemsSubtotal: reconciledOrders.reduce((sum, order) => sum + order.itemsSubtotal, 0),
    promoDiscount: reconciledOrders.reduce((sum, order) => sum + order.newDiscountAmount, 0),
    productsTotal: reconciledOrders.reduce((sum, order) => sum + order.productsTotal, 0),
    deliveryTotal: reconciledOrders.reduce((sum, order) => sum + order.deliveryFee, 0),
    newGrandTotal: reconciledOrders.reduce((sum, order) => sum + order.newGrandTotal, 0),
  };

  if (summary.orderCount !== EXPECTED_ALL_ORDER_COUNT
    || summary.pendingOrderCount !== EXPECTED_PENDING_ORDER_COUNT
    || summary.itemCount !== EXPECTED_ORDER_ITEM_COUNT) {
    throw new Error('Reconciliation count invariant failed.');
  }
  if (summary.productsTotal + summary.deliveryTotal !== summary.newGrandTotal) {
    throw new Error('Aggregate products + delivery does not equal the aggregate grand total.');
  }

  const hashInput = JSON.stringify({ batchId: BATCH_ID, orders: reconciledOrders });
  return {
    batchId: BATCH_ID,
    manifestHash: await sha256(hashInput),
    summary,
    warnings,
    orders: reconciledOrders,
  };
}

export async function applyOrderReconciliation(
  supabase: AdminClient,
  expectedManifestHash: string,
  actorId: string,
) {
  const before = await buildReconciliationManifest(supabase);
  if (before.manifestHash !== expectedManifestHash) {
    throw new Error('Reconciliation data changed after preview. Refresh and review the new manifest.');
  }
  if (before.summary.paymentRecordCount > 0) {
    throw new Error(`Found ${before.summary.paymentRecordCount} payment ledger records. Reconcile those records before changing order balances.`);
  }

  const backupPath = `${BATCH_ID}/backups/${new Date().toISOString().replaceAll(':', '-')}.json`;
  await uploadJson(supabase, backupPath, {
    batchId: BATCH_ID,
    actorId,
    createdAt: new Date().toISOString(),
    manifest: before,
  }, false);

  const changedItems = before.orders.flatMap((order) => order.items)
    .filter((item) => item.oldUnitPrice !== item.newUnitPrice);
  const appliedItems: ReconciliationItem[] = [];
  const appliedOrders: ReconciliationOrder[] = [];

  try {
    await runInBatches(changedItems, 10, async (item) => {
      const { data, error } = await supabase.from('order_items')
        .update({ unit_price: item.newUnitPrice })
        .eq('id', item.id)
        .eq('order_id', item.orderId)
        .select('id')
        .single();
      if (error || !data) throw new Error(`Item ${item.id}: ${error?.message || 'row was not updated'}`);
      appliedItems.push(item);
    });

    await runInBatches(before.orders, 10, async (order) => {
      const { data, error } = await supabase.from('orders')
        .update({
          discount_amount: order.newDiscountAmount,
          total_amount: order.newGrandTotal,
        })
        .eq('id', order.id)
        .select('id')
        .single();
      if (error || !data) throw new Error(`Order ${order.id}: ${error?.message || 'row was not updated'}`);
      appliedOrders.push(order);
    });

    const after = await buildReconciliationManifest(supabase);
    if (after.summary.changedItemCount !== 0 || after.summary.changedOrderCount !== 0) {
      throw new Error('Post-apply verification found unreconciled rows.');
    }

    await uploadJson(supabase, `${BATCH_ID}/apply-result.json`, {
      batchId: BATCH_ID,
      actorId,
      appliedAt: new Date().toISOString(),
      sourceManifestHash: before.manifestHash,
      verifiedManifestHash: after.manifestHash,
      backupPath,
      summary: after.summary,
    }, true);

    return {
      ok: true,
      backupPath,
      sourceManifestHash: before.manifestHash,
      verifiedManifestHash: after.manifestHash,
      summary: after.summary,
      warnings: after.warnings,
    };
  } catch (applyError) {
    const rollbackErrors: string[] = [];

    await runInBatches(appliedOrders, 10, async (order) => {
      const { error } = await supabase.from('orders')
        .update({
          discount_amount: order.oldDiscountAmount,
          total_amount: order.oldGrandTotal,
        })
        .eq('id', order.id);
      if (error) rollbackErrors.push(`order ${order.id}: ${error.message}`);
    });
    await runInBatches(appliedItems, 10, async (item) => {
      const { error } = await supabase.from('order_items')
        .update({ unit_price: item.oldUnitPrice })
        .eq('id', item.id);
      if (error) rollbackErrors.push(`item ${item.id}: ${error.message}`);
    });

    if (rollbackErrors.length > 0) {
      throw new Error(`Apply failed and rollback was incomplete. Backup: ${backupPath}. ${rollbackErrors.join('; ')}`);
    }
    throw new Error(`Apply failed; all completed changes were rolled back. Backup: ${backupPath}. ${applyError instanceof Error ? applyError.message : String(applyError)}`);
  }
}

async function loadPendingOrderNotification(supabase: AdminClient, orderId: string) {
  if (!pendingOrderIdSet.has(orderId) || !orderIdSet.has(orderId)) {
    throw new Error('Order is not in the frozen pending-notification scope.');
  }

  const [{ data: order, error: orderError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('orders')
      .select('id, status, total_amount, discount_amount, promo_code, contact_name, contact_phone, address, google_maps_link')
      .eq('id', orderId)
      .single(),
    supabase.from('order_items')
      .select('id, product_id, bundle_offer_id, quantity, unit_price')
      .eq('order_id', orderId),
  ]);
  if (orderError || !order) throw new Error(`Could not load order ${orderId}: ${orderError?.message}`);
  if (itemsError || !items) throw new Error(`Could not load items for ${orderId}: ${itemsError?.message}`);
  if (order.status !== 'PENDING') throw new Error(`Order ${orderId} is no longer PENDING.`);

  const productIds = items.map((item: RawOrderItem) => item.product_id).filter(Boolean) as string[];
  const bundleIds = items.map((item: RawOrderItem) => item.bundle_offer_id).filter(Boolean) as string[];
  const [productsResult, bundlesResult] = await Promise.all([
    productIds.length
      ? supabase.from('products').select('id, name').in('id', productIds)
      : Promise.resolve({ data: [], error: null }),
    bundleIds.length
      ? supabase.from('bundle_offers').select('id, title_ar').in('id', bundleIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (productsResult.error || bundlesResult.error) {
    throw new Error(`Could not resolve order item names for ${orderId}.`);
  }

  const productNames = new Map((productsResult.data || []).map((product: any) => [product.id, product.name]));
  const bundleNames = new Map((bundlesResult.data || []).map((bundle: any) => [bundle.id, bundle.title_ar]));
  const notificationItems = (items as RawOrderItem[]).map((item) => ({
    name: item.product_id
      ? productNames.get(item.product_id) || 'منتج'
      : bundleNames.get(item.bundle_offer_id || '') || 'عرض',
    quantity: item.quantity,
    unitPrice: toIqd(item.unit_price),
  }));
  const itemsSubtotal = sumPricedLines((items as RawOrderItem[]));
  const breakdown = calculateOrderBreakdown(itemsSubtotal, Number(order.discount_amount || 0));

  if (breakdown.grandTotal !== toIqd(order.total_amount)) {
    throw new Error(`Order ${orderId} does not reconcile before Telegram send.`);
  }

  const message = buildArabicOrderNotification({
    orderId,
    contactName: order.contact_name,
    contactPhone: order.contact_phone,
    address: order.address,
    googleMapsLink: order.google_maps_link,
    items: notificationItems,
    breakdown,
    promoCode: order.promo_code,
    correction: true,
  });

  return { order, breakdown, message, messageHash: await sha256(message) };
}

export async function sendCorrectedPendingOrderNotification(
  supabase: AdminClient,
  orderId: string,
  actorId: string,
) {
  await ensureAuditBucket(supabase);
  const applyRecord = await downloadJson<ReconciliationApplyRecord>(
    supabase,
    `${BATCH_ID}/apply-result.json`,
  );
  if (!applyRecord
    || applyRecord.batchId !== BATCH_ID
    || applyRecord.summary.changedItemCount !== 0
    || applyRecord.summary.changedOrderCount !== 0) {
    throw new Error('Telegram corrections are blocked until the frozen reconciliation is applied and verified.');
  }

  const ledgerPath = `${TELEGRAM_LEDGER_PREFIX}/${orderId}.json`;
  const existing = await downloadJson<TelegramLedgerEntry>(supabase, ledgerPath);
  if (existing?.state === 'sent') {
    return { ok: true, alreadySent: true, orderId, telegramMessageId: existing.telegramMessageId };
  }
  if (existing?.state === 'sending' || existing?.state === 'uncertain') {
    throw new Error(`Order ${orderId} has an uncertain prior Telegram attempt and will not be retried automatically.`);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Telegram configuration is missing.');

  const notification = await loadPendingOrderNotification(supabase, orderId);
  const attemptedAt = new Date().toISOString();
  const baseLedger: TelegramLedgerEntry = {
    batchId: BATCH_ID,
    orderId,
    state: 'sending',
    messageHash: notification.messageHash,
    grandTotal: notification.breakdown.grandTotal,
    attemptedAt,
    actorId,
  };
  await uploadJson(supabase, ledgerPath, baseLedger, true);

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: notification.message,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    await uploadJson(supabase, ledgerPath, {
      ...baseLedger,
      state: 'uncertain',
      error: error instanceof Error ? error.message : String(error),
    }, true);
    throw new Error(`Telegram outcome is uncertain for ${orderId}; it was not retried.`);
  }

  const responseText = await response.text();
  if (!response.ok) {
    await uploadJson(supabase, ledgerPath, {
      ...baseLedger,
      state: 'failed',
      error: `HTTP ${response.status}: ${responseText.slice(0, 500)}`,
    }, true);
    throw new Error(`Telegram rejected order ${orderId} with HTTP ${response.status}.`);
  }

  let telegramBody: any;
  try {
    telegramBody = JSON.parse(responseText);
  } catch {
    telegramBody = null;
  }
  const telegramMessageId = Number(telegramBody?.result?.message_id);
  if (!telegramBody?.ok || !Number.isFinite(telegramMessageId)) {
    await uploadJson(supabase, ledgerPath, {
      ...baseLedger,
      state: 'uncertain',
      error: 'Telegram returned an unexpected success payload.',
    }, true);
    throw new Error(`Telegram response was ambiguous for ${orderId}; it was not retried.`);
  }

  const sentEntry: TelegramLedgerEntry = {
    ...baseLedger,
    state: 'sent',
    sentAt: new Date().toISOString(),
    telegramMessageId,
  };
  await uploadJson(supabase, ledgerPath, sentEntry, true);

  return {
    ok: true,
    alreadySent: false,
    orderId,
    telegramMessageId,
    messageHash: notification.messageHash,
    grandTotal: notification.breakdown.grandTotal,
  };
}

export async function getCorrectionNotificationStatus(supabase: AdminClient) {
  await ensureAuditBucket(supabase);
  const { data, error } = await supabase.storage.from(AUDIT_BUCKET)
    .list(TELEGRAM_LEDGER_PREFIX, { limit: 100, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw new Error(`Could not list Telegram correction ledger: ${error.message}`);

  const ledgerIds = new Set((data || [])
    .map((file) => file.name.replace(/\.json$/, ''))
    .filter((orderId) => pendingOrderIdSet.has(orderId)));
  const sent: string[] = [];
  const uncertain: string[] = [];
  const failed: string[] = [];

  for (const orderId of ledgerIds) {
    const entry = await downloadJson<TelegramLedgerEntry>(supabase, `${TELEGRAM_LEDGER_PREFIX}/${orderId}.json`);
    if (entry?.state === 'sent') sent.push(orderId);
    else if (entry?.state === 'failed') failed.push(orderId);
    else if (entry) uncertain.push(orderId);
  }

  const { data: pendingOrders, error: pendingError } = await supabase.from('orders')
    .select('id, created_at, status')
    .in('id', [...PENDING_ORDER_IDS])
    .order('created_at', { ascending: true });
  if (pendingError) throw new Error(`Could not verify pending Telegram scope: ${pendingError.message}`);
  const orderedPendingIds = (pendingOrders || [])
    .filter((order) => order.status === 'PENDING')
    .map((order) => order.id as string);
  if (orderedPendingIds.length !== EXPECTED_PENDING_ORDER_COUNT) {
    throw new Error('Frozen pending Telegram scope changed status; dispatch is stopped.');
  }

  const remaining = orderedPendingIds.filter((orderId) => !sent.includes(orderId));
  return {
    expected: EXPECTED_PENDING_ORDER_COUNT,
    sent: sent.length,
    remaining: remaining.length,
    failed,
    uncertain,
    nextOrderId: remaining.find((orderId) => !failed.includes(orderId) && !uncertain.includes(orderId)) || null,
  };
}
