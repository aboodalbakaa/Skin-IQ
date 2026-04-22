import { DollarSign, UserCheck, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface StatCardsProps {
  stats: {
    clearedRevenue: number;
    pendingRevenue: number;
    outstandingDebt: number;
    pendingWholesalers: number;
    orderTrend: number;
    orderVolume: number;
  }
}

export default function StatCards({ stats }: StatCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IQ', { maximumFractionDigits: 0 }).format(val) + ' IQD';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      
      {/* Monthly Revenue (Cleared) */}
      <div className="bg-white dark:bg-[#0D1518] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revenue (Cleared)</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tabular-nums">{formatCurrency(stats.clearedRevenue)}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
           <CheckCircle className="w-3 h-3" /> Settled Payments
        </div>
      </div>

      {/* Potential Revenue (Pending) */}
      <div className="bg-white dark:bg-[#0D1518] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Potential (Pending)</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tabular-nums">{formatCurrency(stats.pendingRevenue)}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
           {stats.orderVolume} active orders
        </div>
      </div>

      {/* Outstanding Debt */}
      <div className="bg-white dark:bg-[#0D1518] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unpaid Debt</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tabular-nums">{formatCurrency(stats.outstandingDebt)}</h3>
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest ${stats.orderTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
           {stats.orderTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
           {Math.abs(stats.orderTrend)}% MoM Volume
        </div>
      </div>

      {/* Pending Wholesalers */}
      <Link href="/admin/users?filter=pending" className="bg-primary dark:bg-primary/20 p-6 rounded-3xl shadow-lg border border-transparent dark:border-primary/30 interactive-hover group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/20 text-white rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Wholesale Pending</p>
            <h3 className="text-3xl font-black mt-1 text-white tabular-nums">{stats.pendingWholesalers}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Requires Action</span>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

    </div>
  );
}
