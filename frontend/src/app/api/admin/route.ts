import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Admin API — handles all data operations via simple JSON.
 * No RSC streaming, no server actions — just plain fetch() from client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    const supabase = createAdminClient();

    switch (action) {

      // ─── DASHBOARD ───
      case 'getDashboardStats': {
        const days = params.days || 30;
        const now = new Date();
        const currentPeriodStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        const previousPeriodStart = new Date(now.getTime() - (2 * days * 24 * 60 * 60 * 1000));

        // Revenue stats
        const { data: orderStats } = await supabase.from('orders').select('total_amount, status, created_at');

        let clearedRevenue = 0, pendingRevenue = 0, outstandingDebt = 0;
        let currentPeriodOrders = 0, previousPeriodOrders = 0;

        orderStats?.forEach(order => {
          const amount = Number(order.total_amount) || 0;
          const date = new Date(order.created_at);
          if (order.status === 'CANCELLED') return;
          if (order.status === 'PAID' || order.status === 'DELIVERED') clearedRevenue += amount;
          else if (order.status === 'PENDING' || order.status === 'PENDING_DELIVERY') pendingRevenue += amount;
          else if (order.status === 'DEBT') outstandingDebt += amount;
          if (date > currentPeriodStart) currentPeriodOrders++;
          else if (date > previousPeriodStart) previousPeriodOrders++;
        });

        // Pending wholesalers
        const { count: pendingWholesalers } = await supabase.from('app_users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'CUSTOMER')
          .not('business_name', 'is', null);

        // Recent orders
        const { data: recentOrders } = await supabase.from('orders')
          .select('id, total_amount, status, created_at, contact_name, app_users(full_name, business_name)')
          .order('created_at', { ascending: false }).limit(5);

        const formattedOrders = recentOrders?.map(o => ({
          ...o, app_users: Array.isArray(o.app_users) ? o.app_users[0] : o.app_users
        })) || [];

        // Top products
        const { data: topRaw } = await supabase.from('order_items')
          .select('product_id, quantity, products(name, image_url, retail_price)').limit(50);

        const topMap = new Map();
        topRaw?.forEach(item => {
          if (!item.product_id) return;
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const existing = topMap.get(item.product_id) || { name: product?.name || 'Unknown', image: product?.image_url, price: product?.retail_price, totalSold: 0 };
          existing.totalSold += item.quantity || 0;
          topMap.set(item.product_id, existing);
        });

        const topProducts = Array.from(topMap.values()).sort((a: any, b: any) => b.totalSold - a.totalSold).slice(0, 5);

        // Traffic
        const { count: currentViews } = await supabase.from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriodStart.toISOString());
        const { count: previousViews } = await supabase.from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriodStart.toISOString())
          .lt('created_at', currentPeriodStart.toISOString());

        const orderTrend = previousPeriodOrders === 0 ? 0 : Math.round(((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100);
        const trafficTrend = (previousViews || 0) === 0 ? 0 : Math.round((((currentViews || 0) - (previousViews || 0)) / (previousViews || 1)) * 100);

        return NextResponse.json({
          metrics: { clearedRevenue, pendingRevenue, outstandingDebt, pendingWholesalers: pendingWholesalers || 0, orderTrend, orderVolume: currentPeriodOrders, trafficVolume: currentViews || 0, trafficTrend },
          recentOrders: formattedOrders,
          topProducts
        });
      }

      // ─── DEBT REPORT ───
      case 'getDebtReportData': {
        const { data: debtOrders } = await supabase.from('orders')
          .select('id, total_amount, created_at, contact_phone, status, app_users(full_name, business_name, phone_number)')
          .eq('status', 'DEBT').order('created_at', { ascending: false });
        return NextResponse.json((debtOrders || []).map(order => ({
          id: order.id,
          businessName: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.business_name || 'Individual Partner',
          customerName: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.full_name || 'Unknown',
          phone: (Array.isArray(order.app_users) ? order.app_users[0] : order.app_users)?.phone_number || order.contact_phone || 'No Phone',
          lastPaymentDate: new Date(order.created_at).toLocaleDateString(),
          debt: Number(order.total_amount),
          status: 'DELINQUENT'
        })));
      }

      // ─── PRODUCTS ───
      case 'getAllProducts': {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data || []);
      }

      case 'createProduct': {
        const { name, description, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active, is_out_of_stock, category, specs, how_to_use, video_url, image_url } = params;
        if (!name || !retail_price || !wholesale_price) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const payload: Record<string, any> = { name, description: description || '', retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active: !!is_active, is_out_of_stock: !!is_out_of_stock, category: category || '', specs: specs || '', how_to_use: how_to_use || '', video_url: video_url || '' };
        if (image_url) { payload.image_url = image_url; payload.images = [image_url]; }
        const { error } = await supabase.from('products').insert(payload);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'updateProduct': {
        const { id, name, description, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active, is_out_of_stock, category, specs, how_to_use, video_url, image_url } = params;
        if (!id || !name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        const payload: Record<string, any> = { name, description: description || '', retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, is_active: !!is_active, is_out_of_stock: !!is_out_of_stock, category: category || '', specs: specs || '', how_to_use: how_to_use || '', video_url: video_url || '' };
        if (image_url) { payload.image_url = image_url; payload.images = [image_url]; }
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'deleteProduct': {
        const { id } = params;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'toggleProductActive': {
        const { id, is_active } = params;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const { error } = await supabase.from('products').update({ is_active: !!is_active }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}