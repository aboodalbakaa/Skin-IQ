import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  calculateOrderBreakdown,
  sumPricedLines,
} from '@/lib/order-pricing';

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: FormDataEntryValue | unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: FormDataEntryValue | unknown, fallback: number | null = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: FormDataEntryValue | unknown) {
  return value === true || value === 'true' || value === 'on';
}

function isFile(value: FormDataEntryValue | unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File && value.size > 0;
}

function withOrderBreakdown<T extends Record<string, unknown>>(order: T) {
  const items = Array.isArray(order.order_items)
    ? order.order_items as Array<{ quantity: number; unit_price: number | string }>
    : [];
  const itemsSubtotal = sumPricedLines(items);
  const breakdown = calculateOrderBreakdown(itemsSubtotal, Number(order.discount_amount || 0));
  return {
    ...order,
    products_total: breakdown.productsTotal,
    delivery_fee: breakdown.deliveryFee,
    calculated_grand_total: breakdown.grandTotal,
  };
}

async function parseBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return {
      action: asString(formData.get('action')),
      params: formData,
      isFormData: true,
    };
  }

  const body = await request.json();
  const { action, ...params } = body || {};
  return {
    action: asString(action),
    params,
    isFormData: false,
  };
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { error: jsonError('Unauthorized', 401) };
  }

  const supabase = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: jsonError('Unauthorized', 401) };
  }

  const { data: userData, error: roleError } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || !userData || !ADMIN_ROLES.includes(userData.role)) {
    return { error: jsonError('Forbidden', 403) };
  }

  return { supabase, user, role: userData.role };
}

async function uploadImageToStorage(
  supabase: AdminSupabaseClient,
  bucket: string,
  prefix: string,
  file: File,
) {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${prefix}-${crypto.randomUUID()}.${ext}`;
  const filePath = `${prefix}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

async function deleteImageFromStorage(
  supabase: AdminSupabaseClient,
  bucket: string,
  imageUrl?: string,
) {
  if (!imageUrl) return;
  const match = imageUrl.match(new RegExp(`${bucket}/(.+)$`));
  if (!match) return;
  await supabase.storage.from(bucket).remove([match[1]]);
}

async function getPromoCodeStats(supabase: AdminSupabaseClient) {
  const { data: promoCodes, error: promoError } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (promoError) throw new Error(promoError.message);

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      promo_code,
      total_amount,
      discount_amount,
      id,
      created_at,
      contact_name,
      contact_phone,
      status,
      app_users (
        full_name,
        phone_number,
        business_name
      ),
      order_items (quantity, unit_price)
    `)
    .not('promo_code', 'is', null);

  if (ordersError) throw new Error(ordersError.message);

  return (promoCodes || []).map((promo) => {
    const associatedOrders = (orders || []).filter(
      (order) => order.promo_code?.toUpperCase() === promo.code?.toUpperCase(),
    ).map((order) => withOrderBreakdown(order));

    return {
      ...promo,
      usageCount: associatedOrders.length,
      revenue: associatedOrders.reduce((sum, order) => sum + order.products_total, 0),
      partnerProfit: associatedOrders.reduce(
        (sum, order) => sum + (order.products_total * (Number(promo.commission_rate) || 0) / 100),
        0,
      ),
      orders: associatedOrders,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin.error) return admin.error;

    const { supabase } = admin;
    const { action, params, isFormData } = await parseBody(request);
    const formData = isFormData ? params as FormData : null;
    const data = !isFormData ? params as Record<string, any> : {};

    switch (action) {
      case 'getDashboardStats': {
        const days = data.days || 30;
        const now = new Date();
        const currentPeriodStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        const previousPeriodStart = new Date(now.getTime() - (2 * days * 24 * 60 * 60 * 1000));

        const { data: orderStats } = await supabase.from('orders')
          .select('id, total_amount, discount_amount, status, created_at, order_items(quantity, unit_price)');

        let clearedRevenue = 0;
        let clearedProductsRevenue = 0;
        let clearedDeliveryRevenue = 0;
        let pendingRevenue = 0;
        let pendingProductsRevenue = 0;
        let pendingDeliveryRevenue = 0;
        let outstandingDebt = 0;
        let outstandingProductsRevenue = 0;
        let outstandingDeliveryRevenue = 0;
        let currentPeriodOrders = 0;
        let previousPeriodOrders = 0;

        orderStats?.forEach((order) => {
          const calculated = withOrderBreakdown(order);
          const amount = calculated.calculated_grand_total;
          const date = new Date(order.created_at);
          if (order.status === 'CANCELLED') return;
          if (order.status === 'PAID' || order.status === 'DELIVERED') {
            clearedRevenue += amount;
            clearedProductsRevenue += calculated.products_total;
            clearedDeliveryRevenue += calculated.delivery_fee;
          } else if (order.status === 'PENDING' || order.status === 'PENDING_DELIVERY') {
            pendingRevenue += amount;
            pendingProductsRevenue += calculated.products_total;
            pendingDeliveryRevenue += calculated.delivery_fee;
          } else if (order.status === 'DEBT') {
            outstandingDebt += amount;
            outstandingProductsRevenue += calculated.products_total;
            outstandingDeliveryRevenue += calculated.delivery_fee;
          }
          if (date > currentPeriodStart) currentPeriodOrders++;
          else if (date > previousPeriodStart) previousPeriodOrders++;
        });

        const { count: pendingWholesalers } = await supabase.from('app_users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'CUSTOMER')
          .not('business_name', 'is', null);

        const { data: recentOrders } = await supabase.from('orders')
          .select('id, total_amount, discount_amount, status, created_at, contact_name, app_users(full_name, business_name), order_items(quantity, unit_price)')
          .order('created_at', { ascending: false })
          .limit(5);

        const formattedOrders = recentOrders?.map((order) => ({
          ...withOrderBreakdown(order),
          app_users: Array.isArray(order.app_users) ? order.app_users[0] : order.app_users,
        })) || [];

        const { data: topRaw } = await supabase.from('order_items')
          .select('product_id, quantity, unit_price, products(name, image_url)')
          .limit(50);

        const topMap = new Map();
        topRaw?.forEach((item) => {
          if (!item.product_id) return;
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const existing = topMap.get(item.product_id) || {
            name: product?.name || 'Unknown',
            image: product?.image_url,
            price: Number(item.unit_price) || 0,
            totalSold: 0,
            valueSold: 0,
          };
          existing.totalSold += item.quantity || 0;
          existing.valueSold += (Number(item.unit_price) || 0) * (item.quantity || 0);
          existing.price = existing.totalSold > 0
            ? Math.round(existing.valueSold / existing.totalSold)
            : 0;
          topMap.set(item.product_id, existing);
        });

        const topProducts = Array.from(topMap.values())
          .sort((a: any, b: any) => b.totalSold - a.totalSold)
          .slice(0, 5);

        const { count: currentViews } = await supabase.from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriodStart.toISOString());
        const { count: previousViews } = await supabase.from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriodStart.toISOString())
          .lt('created_at', currentPeriodStart.toISOString());

        const orderTrend = previousPeriodOrders === 0
          ? 0
          : Math.round(((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100);
        const trafficTrend = (previousViews || 0) === 0
          ? 0
          : Math.round((((currentViews || 0) - (previousViews || 0)) / (previousViews || 1)) * 100);

        return NextResponse.json({
          metrics: {
            clearedRevenue,
            clearedProductsRevenue,
            clearedDeliveryRevenue,
            pendingRevenue,
            pendingProductsRevenue,
            pendingDeliveryRevenue,
            outstandingDebt,
            outstandingProductsRevenue,
            outstandingDeliveryRevenue,
            pendingWholesalers: pendingWholesalers || 0,
            orderTrend,
            orderVolume: currentPeriodOrders,
            trafficVolume: currentViews || 0,
            trafficTrend,
          },
          recentOrders: formattedOrders,
          topProducts,
        });
      }

      case 'getDebtReportData': {
        const { data: debtOrders, error } = await supabase.from('orders')
          .select('id, total_amount, created_at, contact_phone, status, app_users(full_name, business_name, phone_number)')
          .eq('status', 'DEBT')
          .order('created_at', { ascending: false });

        if (error) return jsonError(error.message);

        return NextResponse.json((debtOrders || []).map((order) => ({
          id: order.id,
          businessName: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.business_name || 'Individual Partner',
          customerName: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.full_name || 'Unknown',
          phone: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.phone_number || order.contact_phone || 'No Phone',
          lastPaymentDate: new Date(order.created_at).toLocaleDateString(),
          debt: Number(order.total_amount),
          status: 'DELINQUENT',
        })));
      }

      case 'getAllProducts': {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json(products || []);
      }

      case 'createProduct':
      case 'updateProduct': {
        const id = formData ? asString(formData.get('id')) : data.id;
        const name = formData ? asString(formData.get('name')) : data.name;
        const retail_price = asNumber(formData ? formData.get('retail_price') : data.retail_price);
        const wholesale_price = asNumber(formData ? formData.get('wholesale_price') : data.wholesale_price);
        const discount_retail_price = asNumber(formData ? formData.get('discount_retail_price') : data.discount_retail_price);
        const discount_wholesale_price = asNumber(formData ? formData.get('discount_wholesale_price') : data.discount_wholesale_price);

        if ((action === 'updateProduct' && !id) || !name || retail_price === null || wholesale_price === null) {
          return jsonError('Missing required fields', 400);
        }
        if (retail_price < 0 || wholesale_price < 0
          || (discount_retail_price !== null && (discount_retail_price < 0 || discount_retail_price > retail_price))
          || (discount_wholesale_price !== null && (discount_wholesale_price < 0 || discount_wholesale_price > wholesale_price))) {
          return jsonError('Discount prices must be between zero and their corresponding base price', 400);
        }

        let image_url = formData ? asString(formData.get('existing_image_url')) : data.image_url;
        const imageFile = formData?.get('image');

        if (isFile(imageFile)) {
          if (image_url) await deleteImageFromStorage(supabase, 'product-images', image_url);
          image_url = await uploadImageToStorage(supabase, 'product-images', 'products', imageFile);
        }

        const payload: Record<string, unknown> = {
          name,
          description: formData ? asString(formData.get('description')) : data.description || '',
          retail_price,
          wholesale_price,
          discount_retail_price,
          discount_wholesale_price,
          is_active: asBoolean(formData ? formData.get('is_active') : data.is_active),
          is_out_of_stock: asBoolean(formData ? formData.get('is_out_of_stock') : data.is_out_of_stock),
          category: formData ? asString(formData.get('category')) : data.category || '',
          specs: formData ? asString(formData.get('specs')) : data.specs || '',
          how_to_use: formData ? asString(formData.get('how_to_use')) : data.how_to_use || '',
          video_url: formData ? asString(formData.get('video_url')) : data.video_url || '',
        };

        if (image_url) {
          payload.image_url = image_url;
          payload.images = [image_url];
        }

        const query = action === 'createProduct'
          ? supabase.from('products').insert(payload)
          : supabase.from('products').update(payload).eq('id', id);
        const { error } = await query;

        if (error) return jsonError(error.message);
        revalidatePath('/admin/products');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'deleteProduct': {
        const { id, imageUrl } = data;
        if (!id) return jsonError('Missing id', 400);
        await deleteImageFromStorage(supabase, 'product-images', imageUrl);
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/products');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'toggleProductActive': {
        const { id, is_active } = data;
        if (!id) return jsonError('Missing id', 400);
        const { error } = await supabase.from('products').update({ is_active: !!is_active }).eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/products');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'getAllOrders': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            app_users (
              full_name,
              business_name,
              phone_number
            ),
            order_items (
              id,
              product_id,
              bundle_offer_id,
              quantity,
              unit_price,
              products (
                name,
                image_url
              ),
              bundle_offers (
                title_en,
                title_ar,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json((orders || []).map((order) => withOrderBreakdown(order)));
      }

      case 'updateOrderStatus': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { orderId, status } = data;
        if (!orderId || !status) return jsonError('Missing required fields', 400);
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/orders');
        revalidatePath('/admin');
        return NextResponse.json({ success: true });
      }

      case 'getAllUsers': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: users, error } = await supabase
          .from('app_users')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json(users || []);
      }

      case 'updateUserRole': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { userId, role } = data;
        if (!userId || !role) return jsonError('Missing required fields', 400);
        const { error } = await supabase.from('app_users').update({ role }).eq('id', userId);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/users');
        return NextResponse.json({ success: true });
      }

      case 'getBundleOffers': {
        const { data: offers, error } = await supabase
          .from('bundle_offers')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) return jsonError(error.message);
        return NextResponse.json(offers || []);
      }

      case 'createBundleOffer':
      case 'updateBundleOffer': {
        if (!formData) return jsonError('Expected multipart form data', 400);
        const id = asString(formData.get('id'));
        const title_ar = asString(formData.get('title_ar'));
        const title_en = asString(formData.get('title_en'));
        const bundle_price = asNumber(formData.get('bundle_price'));
        const original_price = asNumber(formData.get('original_price'));

        if ((action === 'updateBundleOffer' && !id) || !title_ar || !title_en || bundle_price === null || original_price === null) {
          return jsonError('Missing required fields', 400);
        }

        let image_url = asString(formData.get('existing_image_url'));
        const imageFile = formData.get('image');

        if (isFile(imageFile)) {
          if (image_url.includes('supabase.co')) await deleteImageFromStorage(supabase, 'product-images', image_url);
          image_url = await uploadImageToStorage(supabase, 'product-images', 'products', imageFile);
        }

        const payload = {
          title_ar,
          title_en,
          description_ar: asString(formData.get('description_ar')),
          description_en: asString(formData.get('description_en')),
          image_url,
          bundle_price,
          original_price,
          is_active: asBoolean(formData.get('is_active')),
          sort_order: asNumber(formData.get('sort_order'), 0),
        };

        const query = action === 'createBundleOffer'
          ? supabase.from('bundle_offers').insert(payload)
          : supabase.from('bundle_offers').update(payload).eq('id', id);
        const { error } = await query;

        if (error) return jsonError(error.message);
        revalidatePath('/admin/bundle-offers');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'deleteBundleOffer': {
        const { id, imageUrl } = data;
        if (!id) return jsonError('Missing id', 400);
        if (imageUrl?.includes('supabase.co')) await deleteImageFromStorage(supabase, 'product-images', imageUrl);
        const { error } = await supabase.from('bundle_offers').delete().eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/bundle-offers');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'toggleBundleActive': {
        const { id, is_active } = data;
        if (!id) return jsonError('Missing id', 400);
        const { error } = await supabase.from('bundle_offers').update({ is_active: !!is_active }).eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/bundle-offers');
        revalidatePath('/');
        return NextResponse.json({ success: true });
      }

      case 'getPromoCodeStats':
        return NextResponse.json(await getPromoCodeStats(supabase));

      case 'createPromoCode': {
        const code = asString(formData?.get('code') ?? data.code).toUpperCase();
        const discount = asNumber(formData?.get('discount') ?? data.discount);
        const commission = asNumber(formData?.get('commission') ?? data.commission, 0);
        const discount_type = asString(formData?.get('discount_type') ?? data.discount_type, 'percentage');

        if (!code || discount === null) return jsonError('Missing required fields', 400);
        if (discount <= 0 || (discount_type === 'percentage' && discount > 100)) {
          return jsonError('Promo discount must be positive and percentage discounts cannot exceed 100%', 400);
        }

        const { error } = await supabase.from('promo_codes').insert({
          code,
          discount_type,
          discount_value: discount,
          commission_rate: commission,
          is_active: true,
        });

        if (error) return jsonError(error.message);
        revalidatePath('/admin/promo-codes');
        return NextResponse.json({ success: true });
      }

      case 'togglePromoStatus': {
        const { id, currentStatus } = data;
        if (!id) return jsonError('Missing id', 400);
        const { error } = await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/promo-codes');
        return NextResponse.json({ success: true });
      }

      case 'deletePromoCode': {
        const { id } = data;
        if (!id) return jsonError('Missing id', 400);
        const { error } = await supabase.from('promo_codes').delete().eq('id', id);
        if (error) return jsonError(error.message);
        revalidatePath('/admin/promo-codes');
        return NextResponse.json({ success: true });
      }

      case 'getDebtMatrixData': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: rows, error } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, app_users(full_name, email, phone_number, business_name)')
          .eq('status', 'DEBT')
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json(rows || []);
      }

      case 'getSalesSummaryData': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: rows, error } = await supabase
          .from('orders')
          .select('id, total_amount, discount_amount, status, created_at, app_users(role, business_name), order_items(quantity, unit_price, products(name))')
          .eq('status', 'PAID')
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json((rows || []).map((order) => withOrderBreakdown(order)));
      }

      case 'getPartnerDirectoryData': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: rows, error } = await supabase
          .from('app_users')
          .select('*')
          .neq('role', 'ADMIN')
          .neq('role', 'SUPER_ADMIN')
          .order('created_at', { ascending: false });
        if (error) return jsonError(error.message);
        return NextResponse.json(rows || []);
      }

      case 'getInventoryAuditData': {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) return jsonError('Forbidden', 403);
        const { data: rows, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });
        if (error) return jsonError(error.message);
        return NextResponse.json(rows || []);
      }

      case 'getTrafficInsights': {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [totalResult, recentResult, latestResult] = await Promise.all([
          supabase.from('page_views').select('*', { count: 'exact', head: true }),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', twentyFourHoursAgo),
          supabase.from('page_views').select('path, device_type')
            .order('created_at', { ascending: false })
            .limit(1000),
        ]);

        const queryError = totalResult.error || recentResult.error || latestResult.error;
        if (queryError) return jsonError(queryError.message);

        const pageMap: Record<string, number> = {};
        const deviceMap: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };

        (latestResult.data || []).forEach((view) => {
          const path = view.path || '/';
          const deviceType = view.device_type || 'Desktop';
          pageMap[path] = (pageMap[path] || 0) + 1;
          deviceMap[deviceType] = (deviceMap[deviceType] || 0) + 1;
        });

        const sortedPages = Object.entries(pageMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        return NextResponse.json({
          totalVisits: totalResult.count || 0,
          recentVisits: recentResult.count || 0,
          sortedPages,
          deviceMap,
          sampledViewCount: latestResult.data?.length || 0,
        });
      }

      case 'getHeroConfig': {
        const { data: row, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_config')
          .single();
        if (error && error.code !== 'PGRST116') return jsonError(error.message);
        return NextResponse.json(row?.value || {});
      }

      case 'updateHeroConfig': {
        const config = data.config;
        if (!config) return jsonError('Missing config', 400);
        const { error } = await supabase.from('site_settings').upsert({
          key: 'hero_config',
          value: config,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
        if (error) return jsonError(error.message);
        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
      }

      case 'uploadHeroImage': {
        if (!formData) return jsonError('Expected multipart form data', 400);
        const file = formData.get('file');
        if (!isFile(file)) return jsonError('No file provided', 400);
        const url = await uploadImageToStorage(supabase, 'site-assets', 'hero', file);
        return NextResponse.json({ success: true, url });
      }

      default:
        return jsonError(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return jsonError(err instanceof Error ? err.message : 'Internal server error');
  }
}
