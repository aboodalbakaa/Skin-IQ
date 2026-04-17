import { DollarSign, UserCheck, Activity } from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalDebt: number;
    monthlyRevenue: number;
    pendingWholesalers: number;
  }
}

export default function StatCards({ stats }: StatCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      
      {/* Outstanding Debt */}
      <div className="bg-white dark:bg-[#0D1518] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">Outstanding Debt</p>
            <h3 className="text-3xl font-bold mt-1 text-foreground dark:text-white">{formatCurrency(stats.totalDebt)}</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-red-500 font-medium">Updated just now</p>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white dark:bg-[#0D1518] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">Monthly Revenue (Cleared)</p>
            <h3 className="text-3xl font-bold mt-1 text-foreground dark:text-white">{formatCurrency(stats.monthlyRevenue)}</h3>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-green-500 font-medium">+24% from base</p>
      </div>

      {/* Pending Approvals */}
      <div className="bg-primary dark:bg-[#0D1518] p-6 rounded-2xl shadow-sm border border-transparent dark:border-slate-800 interactive-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium opacity-80 text-primary-foreground">Pending Wholesalers</p>
            <h3 className="text-3xl font-bold mt-1 text-primary-foreground">{stats.pendingWholesalers}</h3>
          </div>
          <div className="p-3 bg-white/20 text-white rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-accent dark:text-cyan-400 font-medium">Requires verification</p>
      </div>

    </div>
  );
}
