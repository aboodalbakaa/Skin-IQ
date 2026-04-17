import { FileText, Download, BarChart3, TrendingUp, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

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
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-light text-foreground">Export Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and download business intelligence documents and accounting statements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Report Card: Debt Matrix */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:border-accent transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-white rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Partner Debt Matrix</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            A comprehensive list of all wholesale partners with outstanding balances, including last payment dates and contact info.
          </p>
        </div>

        {/* Report Card: Sales Summary */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:border-accent transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-white rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Monthly Sales Summary</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Detailed breakdown of revenue categorized by product and partner type (Customer vs Wholesale).
          </p>
        </div>

        {/* Report Card: Partner Directory */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:border-accent transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-white rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Partner Directory</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Export a full database of registered wholesale partners, pharmacies, and individuals with their approval status.
          </p>
        </div>

        {/* Report Card: Inventory Statement */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:border-accent transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-white rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Inventory Statement</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Current stock levels, active product statuses, and retail/wholesale price comparisons.
          </p>
        </div>
      </div>
    </div>
  );
}
