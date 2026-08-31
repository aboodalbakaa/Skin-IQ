import { DollarSign, UserCheck, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, ChevronRight, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import RevenueBreakdown from './RevenueBreakdown';

interface StatCardsProps {
  stats: {
    clearedRevenue: number;
    clearedProductsRevenue: number;
    clearedDeliveryRevenue: number;
    pendingRevenue: number;
    pendingProductsRevenue: number;
    pendingDeliveryRevenue: number;
    outstandingDebt: number;
    outstandingProductsRevenue: number;
    outstandingDeliveryRevenue: number;
    pendingWholesalers: number;
    orderTrend: number;
    orderVolume: number;
    trafficVolume: number;
    trafficTrend: number;
  }
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
      
      {/* Monthly Revenue (Cleared) */}
      <RevenueBreakdown
        title="Revenue (Cleared)"
        productsTotal={stats.clearedProductsRevenue}
        deliveryTotal={stats.clearedDeliveryRevenue}
        grandTotal={stats.clearedRevenue}
        icon={Activity}
        tone="emerald"
        footer={<span className="inline-flex items-center gap-2 text-emerald-500"><CheckCircle className="w-3 h-3" /> Settled payments</span>}
      />

      {/* Potential Revenue (Pending) */}
      <RevenueBreakdown
        title="Potential (Pending)"
        productsTotal={stats.pendingProductsRevenue}
        deliveryTotal={stats.pendingDeliveryRevenue}
        grandTotal={stats.pendingRevenue}
        icon={Clock}
        tone="amber"
        footer={<span className="text-amber-500">{stats.orderVolume} active orders</span>}
      />

      {/* Site Traffic Card */}
      <Link href="/admin/traffic" className="bg-white dark:bg-[#0D1518] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
            <Globe className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Site Traffic</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tabular-nums">{stats.trafficVolume.toLocaleString()}</h3>
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest ${stats.trafficTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
           {stats.trafficTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
           {Math.abs(stats.trafficTrend)}% Growth
        </div>
      </Link>

      {/* Outstanding Debt */}
      <RevenueBreakdown
        title="Unpaid Debt"
        productsTotal={stats.outstandingProductsRevenue}
        deliveryTotal={stats.outstandingDeliveryRevenue}
        grandTotal={stats.outstandingDebt}
        icon={DollarSign}
        tone="red"
        footer={(
          <span className={`inline-flex items-center gap-2 ${stats.orderTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.orderTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(stats.orderTrend)}% MoM volume
          </span>
        )}
      />

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
