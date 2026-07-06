'use client';

import { useState, useEffect } from 'react';
import StatCards from '@/components/admin/StatCards';
import DebtReport from '@/components/admin/DebtReport';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import { LayoutDashboard, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DashboardData {
  metrics: {
    clearedRevenue: number;
    pendingRevenue: number;
    outstandingDebt: number;
    pendingWholesalers: number;
    orderTrend: number;
    orderVolume: number;
    trafficVolume: number;
    trafficTrend: number;
  };
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [debtData, setDebtData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const statsRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getDashboardStats' }),
        });
        if (!statsRes.ok) {
          const errBody = await statsRes.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${statsRes.status}`);
        }
        const statsData = await statsRes.json();

        const debtRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getDebtReportData' }),
        });
        const debtData = debtRes.ok ? await debtRes.json() : [];

        if (!cancelled) {
          setData(statsData);
          setDebtData(debtData);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 pb-20">
      
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
        <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
           <TrendingUp className="w-4 h-4 text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Could not load dashboard</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <>
          <StatCards stats={data.metrics} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <RecentOrders orders={data.recentOrders} />
            </div>
            <div>
               <TopProducts products={data.topProducts} />
            </div>
          </div>
          <div className="pt-4">
            <DebtReport reportData={debtData} />
          </div>
        </>
      )}

    </div>
  );
}