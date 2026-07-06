'use client';

import { LayoutDashboard } from 'lucide-react';

/**
 * Minimal client-component dashboard.
 * NO searchParams, NO data fetching, NO server actions, NO API calls.
 * Just static UI — proves whether the RSC error is from the layout/page
 * rendering or from something else.
 */
export default function AdminDashboard() {
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
        </div>
      </div>
      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
        <p className="text-slate-400 text-sm font-medium">
          ✅ Dashboard shell loaded — no issues on this page.
        </p>
      </div>
    </div>
  );
}