"use client";

import { useState, useTransition } from 'react';
import { 
  FileText, Download, BarChart3, TrendingUp, Users, 
  Eye, X, Loader2, Table as TableIcon, FileSpreadsheet
} from 'lucide-react';
import { 
  getDebtMatrixData, 
  getSalesSummaryData, 
  getPartnerDirectoryData, 
  getInventoryAuditData 
} from '@/app/[locale]/(admin)/admin/reports/actions';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  fetcher: () => Promise<any[]>;
  columns: string[];
  mapping: (data: any[]) => any[][];
}

export default function ReportManager() {
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [isPending, startTransition] = useTransition();

  const reports: Report[] = [
    {
      id: 'debt-matrix',
      title: 'Partner Debt Matrix',
      description: 'Comprehensive list of wholesale partners with outstanding balances and contact info.',
      icon: BarChart3,
      color: 'red',
      fetcher: getDebtMatrixData,
      columns: ['Date', 'Partner', 'Business', 'Phone', 'Amount (IQD)'],
      mapping: (data) => data.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        item.app_users?.full_name || 'N/A',
        item.app_users?.business_name || 'N/A',
        item.app_users?.phone_number || 'N/A',
        item.total_amount.toLocaleString()
      ])
    },
    {
      id: 'sales-summary',
      title: 'Sales & Trends Summary',
      description: 'Revenue breakdown by product and customer type. Useful for campaign auditing.',
      icon: TrendingUp,
      color: 'emerald',
      fetcher: getSalesSummaryData,
      columns: ['Date', 'Order ID', 'Type', 'Business', 'Revenue (IQD)'],
      mapping: (data) => data.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        item.id.slice(0, 8),
        item.app_users?.role || 'CUSTOMER',
        item.app_users?.business_name || 'N/A',
        item.total_amount.toLocaleString()
      ])
    },
    {
      id: 'partner-directory',
      title: 'Partner CRM Directory',
      description: 'Full database of registered partners with approval status and registration dates.',
      icon: Users,
      color: 'blue',
      fetcher: getPartnerDirectoryData,
      columns: ['Joined', 'Name', 'Email', 'Business', 'Role'],
      mapping: (data) => data.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        item.full_name,
        item.email,
        item.business_name || 'Individual',
        item.role
      ])
    },
    {
      id: 'inventory-audit',
      title: 'Inventory & Pricing Audit',
      description: 'Stock levels vs pricing consistency check. Helps ensure wholesale accuracy.',
      icon: FileText,
      color: 'amber',
      fetcher: getInventoryAuditData,
      columns: ['Product', 'Stock Status', 'Retail Price', 'Wholesale Price', 'Status'],
      mapping: (data) => data.map(item => [
        item.name,
        item.is_active ? 'In Stock' : 'Out of Stock',
        item.retail_price.toLocaleString(),
        item.wholesale_price?.toLocaleString() || 'N/A',
        item.is_active ? 'Visible' : 'Hidden'
      ])
    }
  ];

  const handlePreview = (report: Report) => {
    setActiveReport(report);
    startTransition(async () => {
      try {
        const data = await report.fetcher();
        setPreviewData(report.mapping(data));
      } catch (err) {
        console.error("Failed to fetch report data", err);
      }
    });
  };

  const exportToCSV = () => {
    if (!activeReport || !previewData) return;

    const headers = activeReport.columns.join(',');
    const rows = previewData.map(row => row.join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reports.map((report) => (
          <div 
            key={report.id}
            className="group relative bg-white dark:bg-[#0D1518] p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-${report.color}-500/10 text-${report.color}-500 group-hover:scale-110 transition-transform duration-500`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handlePreview(report)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-border hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-900 dark:text-white shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{report.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {report.description}
            </p>

            <div className="mt-8 pt-6 border-t border-dashed border-border flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Format: CSV / Spreadsheet</span>
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <TableIcon className="w-3.5 h-3.5 text-slate-400" />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setActiveReport(null); setPreviewData(null); }} />
          
          <div className="relative w-full max-w-6xl bg-white dark:bg-[#0D1518] rounded-[3rem] shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-10 py-8 border-b border-border bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-5">
                 <div className={`p-3 rounded-2xl bg-${activeReport.color}-500/10 text-${activeReport.color}-500`}>
                    <activeReport.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {activeReport.title} <span className="text-primary/40 font-light ml-2">Preview</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Auditing live system data as of {new Date().toLocaleDateString()}</p>
                 </div>
              </div>
              <button onClick={() => { setActiveReport(null); setPreviewData(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-10">
              {isPending ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Fetching Records...</p>
                </div>
              ) : previewData && previewData.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 border-b border-border">
                        {activeReport.columns.map(col => (
                          <th key={col} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-4 italic text-slate-400">
                   No records found for this report criteria.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-10 py-8 border-t border-border bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                 Note: Exported CSVs are ready for import into Excel or Google Sheets.
               </p>
               <div className="flex gap-4">
                 <button 
                  onClick={() => { setActiveReport(null); setPreviewData(null); }}
                  className="px-8 py-4 border border-border rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
                 <button 
                  disabled={!previewData || previewData.length === 0}
                  onClick={exportToCSV}
                  className="px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Download Report
                </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
