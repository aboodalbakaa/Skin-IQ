'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StatCards from '@/components/admin/StatCards';
import DebtReport from '@/components/admin/DebtReport';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import DashboardDateRange from '@/components/admin/DashboardDateRange';
import { getDashboardStats, getDebtReportData } from './dashboard/actions';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

type StatsData = Awaited<ReturnType<typeof getDashboardStats>>;
type DebtReportData = Awaited<ReturnType<typeof getDebtReportData>>;

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const daysParam = searchParams?.get('days');
  const daysNum = daysParam ? parseInt(daysParam) : 30;
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [debtReportData, setDebtReportData] = useState<DebtReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setError(null);
        const [stats, debt] = await Promise.all([
          getDashboardStats(daysNum),
          getDebtReportData()
        ]);
        if (!cancelled) {
          setStatsData(stats);
          setDebtReportData(debt);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [daysNum]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full space-y-10 pb-20">
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

      {/* Loading State */}
      {!statsData ? (
        <DashboardSkeleton />
      ) : (
        <>
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
            <DebtReport reportData={debtReportData || []} />
          </div>
        </>
      )}

    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-72 bg-primary text-primary-foreground border-r border-white/10 flex flex-col">
        <div className="h-24 flex items-center px-8 border-b border-white/10">
          <div className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </div>
        </div>
        <nav className="flex-1 py-10 px-6 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}