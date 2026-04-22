import { createClient } from '@/utils/supabase/server';
import { Globe, Users, Monitor, Smartphone, Tablet, Navigation, Clock, Activity, BarChart3, TrendingUp } from 'lucide-react';

export default async function TrafficInsights() {
  const supabase = await createClient();

  // 1. Fetch Summary Data
  const { count: totalVisits } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true });

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentVisits } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', twentyFourHoursAgo);

  // 2. Fetch Top Pages
  const { data: topPages } = await supabase.rpc('get_top_pages'); // We'll need to create this RPC or do it manually

  // Since RPC might not exist, let's fetch raw and aggregate if needed, 
  // but for simplicity and performance, we'll fetch last 1000 and group in memory or use a simpler query.
  const { data: latestViews } = await supabase
    .from('page_views')
    .select('path, device_type, browser')
    .order('created_at', { ascending: false })
    .limit(1000);

  // Aggregate Top Pages
  const pageMap: Record<string, number> = {};
  const deviceMap: Record<string, number> = { 'Desktop': 0, 'Mobile': 0, 'Tablet': 0 };
  const browserMap: Record<string, number> = {};

  (latestViews || []).forEach(view => {
    pageMap[view.path] = (pageMap[view.path] || 0) + 1;
    deviceMap[view.device_type] = (deviceMap[view.device_type] || 0) + 1;
    browserMap[view.browser] = (browserMap[view.browser] || 0) + 1;
  });

  const sortedPages = Object.entries(pageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

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
                const percentage = Math.round((device.count / (latestViews?.length || 1)) * 100);
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
