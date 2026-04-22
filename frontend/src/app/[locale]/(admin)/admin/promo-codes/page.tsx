import { createClient } from '@/utils/supabase/server';
import { Ticket, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { createPromoCode, togglePromoStatus, deletePromoCode } from './actions';
import { revalidatePath } from 'next/cache';
import { PromoCodeDetails } from '@/components/admin/PromoCodeStats';

export default async function PromoCodesPage() {
  const supabase = await createClient();
  const { data: promoCodes } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch usage stats from orders
  const { data: orders } = await supabase
    .from('orders')
    .select('promo_code, total_amount, id, created_at, contact_name')
    .not('promo_code', 'is', null);

  // Aggregate stats
  const promoStats = (promoCodes || []).map(promo => {
    const associatedOrders = (orders || []).filter(o => o.promo_code?.toUpperCase() === promo.code?.toUpperCase());
    return {
      ...promo,
      usageCount: associatedOrders.length,
      revenue: associatedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      partnerProfit: associatedOrders.reduce((sum, o) => sum + ((Number(o.total_amount) || 0) * (Number(promo.commission_rate) || 0) / 100), 0),
      orders: associatedOrders
    };
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Promo <span className="text-accent">Codes</span></h1>
          <p className="text-slate-500 mt-2">Manage marketing discounts and active campaign codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-3xl border border-border sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">New Code</h2>
            </div>

            <form 
              action={async (formData) => { 
                'use server'; 
                await createPromoCode(formData); 
              }} 
              className="space-y-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Code String</label>
                  <input 
                    required
                    name="code"
                    type="text" 
                    placeholder="e.g. EID25"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold tracking-widest uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Discount Type</label>
                  <select
                    name="discount_type"
                    required
                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (IQD)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Value</label>
                  <div className="relative">
                     <input 
                      required
                      name="discount"
                      type="number" 
                      min="1"
                      placeholder="15"
                      className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Commission Rate (%)</label>
                <div className="relative">
                   <input 
                    name="commission"
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="10"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic mt-1">Percent of revenue to share with partner.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
              >
                Create Promo Code
              </button>
            </form>
          </div>
        </div>

        {/* Codes Table/Cards */}
        <div className="lg:col-span-2">
          {/* Desktop Table View */}
          <div className="hidden sm:block glass rounded-[2rem] border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Promo Code</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Discount</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Usage</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Revenue</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Partner Profit</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promoStats?.map((promo) => (
                  <tr key={promo.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 border-b border-border last:border-0 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-black tracking-widest text-slate-900 dark:text-white uppercase border-2 border-slate-200 dark:border-slate-700 shadow-sm block">
                          {promo.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xl font-black text-accent flex items-baseline gap-1">
                        {promo.discount_type === 'percentage' ? (
                          <>{promo.discount_value}%</>
                        ) : (
                          <>
                            {promo.discount_value.toLocaleString()} <span className="text-[10px] uppercase tracking-widest text-slate-400">IQD</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {promo.usageCount} <span className="text-[10px] font-bold text-slate-400">Orders</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {promo.revenue.toLocaleString()} <span className="text-[10px] font-bold opacity-60">IQD</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg font-black text-sm">
                        {promo.partnerProfit.toLocaleString()} <span className="text-[10px] opacity-60">IQD</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">@{promo.commission_rate}% rate</p>
                    </td>
                    <td className="px-8 py-6">
                      {promo.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end items-center gap-2">
                        <PromoCodeDetails code={promo.code} orders={promo.orders} commissionRate={promo.commission_rate} />
                        <form action={async () => { 'use server'; await togglePromoStatus(promo.id, promo.is_active); }}>
                          <button 
                            type="submit"
                            title={promo.is_active ? "Deactivate" : "Activate"}
                            className={`p-2 rounded-xl border transition-all ${
                              promo.is_active 
                                ? "text-amber-500 border-amber-500/20 hover:bg-amber-50" 
                                : "text-emerald-500 border-emerald-500/20 hover:bg-emerald-50"
                            }`}
                          >
                            {promo.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        </form>
                        <form action={async () => { 'use server'; await deletePromoCode(promo.id); }}>
                          <button 
                            type="submit"
                            title="Delete"
                            className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {promoStats?.map((promo) => (
              <div key={promo.id} className="glass p-6 rounded-3xl border border-border flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-black tracking-[0.2em] text-primary dark:text-white uppercase border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                        {promo.code}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                        {promo.discount_type === 'percentage' ? 'Percentage Discount' : 'Fixed Amount'}
                      </p>
                    </div>
                  </div>
                  {promo.is_active ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black rounded-full uppercase tracking-widest">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[8px] font-black rounded-full uppercase tracking-widest">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
                   <div className="space-y-1 border-r border-border">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revenue</p>
                     <p className="text-xl font-black text-emerald-500">{promo.revenue.toLocaleString()} <span className="text-[8px]">IQD</span></p>
                   </div>
                   <div className="space-y-1 pl-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Partner Profit</p>
                     <p className="text-xl font-black text-accent">{promo.partnerProfit.toLocaleString()} <span className="text-[8px]">IQD</span></p>
                   </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <PromoCodeDetails code={promo.code} orders={promo.orders} commissionRate={promo.commission_rate} />
                  </div>
                  <form className="flex-1" action={async () => { 'use server'; await togglePromoStatus(promo.id, promo.is_active); }}>
                    <button 
                      type="submit"
                      className={`w-full py-4 rounded-2xl border font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                        promo.is_active 
                          ? "text-amber-500 border-amber-500/20 bg-amber-500/5" 
                          : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                      }`}
                    >
                      {promo.is_active ? <><PowerOff className="w-4 h-4" /> Deactivate</> : <><Power className="w-4 h-4" /> Activate</>}
                    </button>
                  </form>
                  <form action={async () => { 'use server'; await deletePromoCode(promo.id); }}>
                    <button 
                      type="submit"
                      className="p-4 rounded-2xl border border-red-500/20 text-red-500 bg-red-500/5 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {(!promoCodes || promoCodes.length === 0) && (
            <div className="glass p-20 rounded-[2rem] border border-border text-center text-slate-400 italic">
              No promo codes created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
