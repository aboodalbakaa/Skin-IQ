'use client';

import { useCallback, useEffect, useState } from 'react';
import { Globe, Monitor, Smartphone, Tablet, Navigation, Activity, BarChart3, TrendingUp } from 'lucide-react';
import { postAdminJson } from '@/utils/admin-api';

export const dynamic = 'force-dynamic';

interface TrafficData {
  totalVisits: number;
  recentVisits: number;
  sortedPages: [string, number][];
  deviceMap: Record<string, number>;
  sampledViewCount: number;
}

export default function TrafficInsights() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTraffic = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await postAdminJson<TrafficData>('getTrafficInsights'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traffic insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTraffic();
  }, [loadTraffic]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading traffic insights</p>
          <p className="text-sm mt-1 opacity-75">{error || 'No traffic data was returned'}</p>
          <button
            onClick={loadTraffic}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { totalVisits, recentVisits, sortedPages, deviceMap, sampledViewCount } = data;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            Traffic <span className="text-accent">Insights</span>
          </h1>
        </div>
        <p className="text-slate-500 font-medium text-lg">Real-time visitor monitoring and engagement analytics.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/5 px-3 py-1 rounded-full">All Time</span>
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
            {(totalVisits || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Total Page Views</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full">Active</span>
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
            {(recentVisits || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Views (Last 24h)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-accent/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6 text-accent" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-3 py-1 rounded-full">Popular</span>
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
            {sortedPages[0]?.[0] || '/'}
          </p>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Most Visited Path</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-sm p-10">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Pages</h2>
          </div>
          <div className="space-y-4">
            {sortedPages.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono tracking-tighter truncate max-w-[200px]">
                    {path}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-1000" 
                      style={{ width: `${(count / (sortedPages[0][1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-sm p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <Monitor className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Device Breakdown</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-10">
            <div className="space-y-8">
              {[
                { label: 'Mobile', icon: Smartphone, count: deviceMap['Mobile'], color: 'text-emerald-500', bg: 'bg-emerald-500' },
                { label: 'Desktop', icon: Monitor, count: deviceMap['Desktop'], color: 'text-blue-500', bg: 'bg-blue-500' },
                { label: 'Tablet', icon: Tablet, count: deviceMap['Tablet'], color: 'text-amber-500', bg: 'bg-amber-500' }
              ].map((device) => {
                const percentage = Math.round((device.count / (sampledViewCount || 1)) * 100);
                return (
                  <div key={device.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <device.icon className={`w-5 h-5 ${device.color}`} />
                        <span className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{device.label}</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{percentage}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                      <div 
                        className={`h-full ${device.bg} rounded-2xl transition-all duration-1000`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
