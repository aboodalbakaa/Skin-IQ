'use server';

import { createClient } from '@/utils/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. Calculate Revenue & Debt by Status
  const { data: orderStats } = await supabase
    .from('orders')
    .select('total_amount, status, created_at');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

  let clearedRevenue = 0;
  let pendingRevenue = 0;
  let outstandingDebt = 0;
  
  let currentMonthOrders = 0;
  let previousMonthOrders = 0;

  orderStats?.forEach(order => {
    const amount = Number(order.total_amount) || 0;
    const date = new Date(order.created_at);

    if (order.status === 'PAID') clearedRevenue += amount;
    if (order.status === 'PENDING') pendingRevenue += amount;
    if (order.status === 'DEBT') outstandingDebt += amount;

    if (date > thirtyDaysAgo) {
      currentMonthOrders++;
    } else if (date > sixtyDaysAgo) {
      previousMonthOrders++;
    }
  });

  // 2. Pending Wholesalers (Customers with a business name)
  const { count: pendingWholesalers } = await supabase
    .from('app_users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER')
    .not('business_name', 'is', null);

  // 3. Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      contact_name,
      app_users (
        full_name,
        business_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const formattedRecentOrders = recentOrders?.map(order => {
    const user = Array.isArray(order.app_users) ? order.app_users[0] : order.app_users;
    return {
      ...order,
      app_users: user
    };
  }) || [];

  // 4. Top Selling Products
  const { data: topProductsRaw } = await supabase
    .from('order_items')
    .select(`
      product_id,
      quantity,
      products (
        name,
        image_url,
        retail_price
      )
    `)
    .limit(50); // Get a batch to aggregate manually if needed, or use SQL if complex

  const topProductsMap = new Map();
  topProductsRaw?.forEach(item => {
    const pid = item.product_id;
    if (!pid) return;
    
    // Handle Supabase joining returning an array or single object
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    
    const existing = topProductsMap.get(pid) || { 
      name: product?.name || 'Unknown', 
      image: product?.image_url, 
      price: product?.retail_price,
      totalSold: 0 
    };
    existing.totalSold += item.quantity || 0;
    topProductsMap.set(pid, existing);
  });

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Calculate trends
  const orderTrend = previousMonthOrders === 0 ? 0 : Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100);

  return {
    metrics: {
      clearedRevenue,
      pendingRevenue,
      outstandingDebt,
      pendingWholesalers: pendingWholesalers || 0,
      orderTrend,
      orderVolume: currentMonthOrders
    },
    recentOrders: formattedRecentOrders,
    topProducts
  };
}

export async function getDebtReportData() {
  const supabase = await createClient();

  const { data: debtOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      created_at,
      contact_phone,
      status,
      app_users (
        full_name,
        business_name,
        phone_number
      )
    `)
    .eq('status', 'DEBT')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Debt report error:', error);
    return [];
  }

  return debtOrders.map(order => {
    const user = Array.isArray(order.app_users) ? order.app_users[0] : order.app_users;
    return {
      id: order.id,
      businessName: user?.business_name || 'Individual Partner',
      customerName: user?.full_name || 'Unknown',
      phone: user?.phone_number || order.contact_phone || 'No Phone',
      lastPaymentDate: new Date(order.created_at).toLocaleDateString(),
      debt: Number(order.total_amount),
      status: 'DELINQUENT' // Default for DEBT status in this view
    };
  });
}
