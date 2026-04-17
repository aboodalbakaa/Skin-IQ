"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

export default function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data);
      }
      setLoading(false);
    }

    if (userId) fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No orders yet</h3>
        <p className="text-slate-500 text-sm mt-1">When you place an order, it will appear here.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200';
      case 'DEBT': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="group bg-white dark:bg-[#0D1518]/50 border border-border rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1.5 opacity-50">Order ID</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">{order.id.slice(0, 8)}...</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-12">
              <div className="flex flex-col items-start sm:items-end">
                <div className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1.5 opacity-50">Date</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <div className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1.5 opacity-50">Total Amout</div>
                <div className="text-lg font-black text-primary tabular-nums">
                  IQD {Number(order.total_amount).toLocaleString()}
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border h-fit shadow-sm ${getStatusColor(order.status)}`}>
                {order.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> :
                 order.status === 'DEBT' ? <AlertCircle className="w-3 h-3" /> :
                 <Clock className="w-3 h-3" />}
                {order.status}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
