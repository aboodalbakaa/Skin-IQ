import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (userData?.role === 'MANAGER') {
    const { redirect } = await import('next/navigation');
    redirect('/admin/products');
  }

  const { data: rawOrders } = await supabase
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
        quantity,
        unit_price,
        products (
          name,
          image_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Map and cast to our expected type
  const orders = (rawOrders || []) as any[];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10 lg:flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-foreground uppercase tracking-tight">Orders & <span className="italic">Revenue</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Monitor every transaction, track delivery locations, and reach out to customers.</p>
        </div>
        <div className="mt-4 lg:mt-0 text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
          Live Transaction Feed
        </div>
      </div>

      <OrderManagement initialOrders={orders} />
    </div>
  );
}

import OrderManagement from '@/components/admin/OrderManagement';
