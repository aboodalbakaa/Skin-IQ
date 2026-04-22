import { createClient } from '@/utils/supabase/server';
import ReportManager from '@/components/admin/ReportManager';
import { FileText } from 'lucide-react';

export default async function AdminReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (userData?.role === 'MANAGER') {
    const { redirect } = await import('next/navigation');
    redirect('/admin/products');
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Business <span className="text-primary/40">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium max-w-xl">
            Generate, preview, and export high-fidelity reports for auditing, accounting, and trend analysis.
          </p>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-border shadow-sm">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Systems Online & Synced</span>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Actual Report Management Component */}
      <ReportManager />
      
      {/* Informational Footer */}
      <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="p-5 bg-white dark:bg-[#0D1518] rounded-3xl shadow-xl shadow-primary/5">
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
             </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Need a custom report?</h4>
            <p className="text-sm text-slate-500 mt-1 font-medium">Our system automatically aggregates cross-table data for the most common accounting needs. If you require a specialized SQL export, please contact system administration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
