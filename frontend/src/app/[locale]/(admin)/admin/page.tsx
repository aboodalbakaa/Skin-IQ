import StatCards from '@/components/admin/StatCards';
import DebtReport from '@/components/admin/DebtReport';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import { getDashboardStats, getDebtReportData } from './dashboard/actions';
import { LayoutDashboard, TrendingUp, Calendar } from 'lucide-react';

export default async function AdminDashboard() {
  const [statsData, debtReportData] = await Promise.all([
    getDashboardStats(),
    getDebtReportData()
  ]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Control Center</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white">
            Performance <span className="italic font-serif">Overview</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">Real-time metrics and business health insights.</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-2xl border border-border shadow-sm">
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-border flex items-center gap-3">
             <Calendar className="w-4 h-4 text-slate-400" />
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Last 30 Days</span>
          </div>
          <div className="px-4 py-2 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-emerald-500" />
             <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live Data</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <StatCards stats={statsData.metrics} />

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
           <RecentOrders orders={statsData.recentOrders} />
        </div>
        <div>
           <TopProducts products={statsData.topProducts} />
        </div>
      </div>

      {/* Full Width Debt Report */}
      <div className="pt-4">
        <DebtReport reportData={debtReportData} />
      </div>

    </div>
  );
}
