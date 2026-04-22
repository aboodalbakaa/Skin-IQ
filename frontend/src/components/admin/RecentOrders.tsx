"use client";

import { Link } from '@/i18n/routing';
import { ShoppingBag, ChevronRight, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface RecentOrdersProps {
  orders: any[];
}

const statusConfig: any = {
  PENDING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  PAID: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  DEBT: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  CANCELLED: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-white/5' }
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IQ', { maximumFractionDigits: 0 }).format(val) + ' IQD';
  };

  return (
    <div className="bg-white dark:bg-[#0D1518] rounded-[2rem] shadow-sm border border-border overflow-hidden">
      <div className="p-8 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Orders</h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Latest transactions</p>
        </div>
        <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/5">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length > 0 ? (
              orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                const customerName = order.app_users?.full_name || order.contact_name || 'Guest';
                const business = order.app_users?.business_name;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">#{order.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{customerName}</span>
                        {business && <span className="text-[10px] text-primary font-black uppercase tracking-widest">{business}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(order.total_amount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic text-sm font-medium">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
