"use client";

import { Download, Search } from 'lucide-react';

interface DebtReportProps {
  reportData: any[];
}

export default function DebtReport({ reportData }: DebtReportProps) {
  return (
    <div className="bg-white dark:bg-[#0D1518] rounded-[2rem] shadow-sm border border-border overflow-hidden">
      
      {/* Header Actions */}
      <div className="p-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Wholesale Debt Report</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Manage outstanding payments and accounts.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search partner..." 
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-white dark:bg-[#121E23] text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-slate-400 font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-border">
              <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Customer / Business</th>
              <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Phone Number</th>
              <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Recorded Date</th>
              <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Remaining Debt</th>
              <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reportData.length > 0 ? (
              reportData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900 dark:text-white">{row.businessName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.customerName}</div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {row.phone}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {row.lastPaymentDate}
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-red-500 tabular-nums">
                    {row.debt.toLocaleString()} IQD
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full
                      ${row.status === 'DELINQUENT' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 shadow-sm' : ''}
                      ${row.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : ''}
                      ${row.status === 'CLEARED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : ''}
                    `}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No outstanding debts recorded.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
