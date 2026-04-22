import StatCards from '@/components/admin/StatCards';
import DebtReport from '@/components/admin/DebtReport';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import DashboardDateRange from '@/components/admin/DashboardDateRange';
import { getDashboardStats, getDebtReportData } from './dashboard/actions';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

export default async function AdminDashboard({
  searchParams
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const { days } = await searchParams;
  const daysNum = parseInt(days || '30');

  const [statsData, debtReportData] = await Promise.all([
    getDashboardStats(daysNum),
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

        <div className="flex items-center gap-4">
          <DashboardDateRange currentDays={daysNum.toString()} />
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
             <TrendingUp className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
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
