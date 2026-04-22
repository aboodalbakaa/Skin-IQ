"use client";

import { useState } from 'react';
import { Eye, X, ExternalLink, Calendar, User, CreditCard } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  contact_name: string;
}

interface PromoCodeStatsProps {
  code: string;
  orders: Order[];
  commissionRate: number;
}

export function PromoCodeDetails({ code, orders, commissionRate }: PromoCodeStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalProfit = (totalRevenue * (commissionRate || 0)) / 100;

  if (orders.length === 0) {
    return (
      <button 
        disabled
        className="p-2 rounded-xl border border-border opacity-20 cursor-not-allowed"
      >
        <Eye className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title="View Associated Orders"
        className="p-2 rounded-xl border border-accent/20 text-accent hover:bg-accent/5 transition-all"
      >
        <Eye className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg font-black text-[10px] uppercase tracking-widest">
                    Campaign Performance
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                    Code: {code}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Showing {orders.length} orders. Commission rate: <span className="text-accent font-black">{commissionRate}%</span>
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-border hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-6 rounded-[2rem] bg-slate-500/5 border border-slate-500/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/60 mb-2">Total Sales</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{orders.length}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Revenue Generated</p>
                  <p className="text-3xl font-black text-emerald-500">
                    {totalRevenue.toLocaleString()} <span className="text-xs">IQD</span>
                  </p>
                </div>
                <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/60 mb-2">Partner Profit</p>
                  <p className="text-3xl font-black text-accent">
                    {totalProfit.toLocaleString()} <span className="text-xs">IQD</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">Order History</h3>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="group p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-border transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-border flex items-center justify-center text-slate-400">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{order.contact_name || 'Guest Customer'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-medium text-slate-500">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Amount</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">
                            {Number(order.total_amount).toLocaleString()} <span className="text-[10px]">IQD</span>
                          </p>
                        </div>
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-border hover:border-accent hover:text-accent transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
