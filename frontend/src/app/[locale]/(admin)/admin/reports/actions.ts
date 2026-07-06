"use server";

import { createAdminClient } from '@/utils/supabase/admin';

export async function getDebtMatrixData() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      app_users (
        full_name,
        email,
        phone_number,
        business_name
      )
    `)
    .eq('status', 'DEBT')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSalesSummaryData() {
  const supabase = createAdminClient();
  
  // Get all paid orders with items and products
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      app_users (
        role,
        business_name
      ),
      order_items (
        quantity,
        unit_price,
        products (
          name
        )
      )
    `)
    .eq('status', 'PAID')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPartnerDirectoryData() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .neq('role', 'ADMIN')
    .neq('role', 'SUPER_ADMIN')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInventoryAuditData() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
