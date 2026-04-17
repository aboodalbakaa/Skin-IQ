"use client";

import { Download, Search } from 'lucide-react';

const MOCK_DEBT_REPORT: any[] = [];

export default function DebtReport() {
  return (
    <div className="bg-white dark:bg-[#0D1518] rounded-2xl shadow-sm border border-border overflow-hidden">
      
      {/* Header Actions */}
      <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Wholesale Debt Report</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage outstanding payments and accounts.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search pharmacy..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-white dark:bg-[#121E23] text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-border">
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Customer / Business</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Phone Number</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Last Payment</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Remaining Debt</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_DEBT_REPORT.length > 0 ? (
              MOCK_DEBT_REPORT.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{row.businessName}</div>
                    <div className="text-xs text-muted-foreground">{row.customerName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {row.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {row.lastPaymentDate}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    IQD {row.debt.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full
                      ${row.status === 'DELINQUENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 dark:border-red-900/50 border border-red-200' : ''}
                      ${row.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-900/50 border border-amber-200' : ''}
                      ${row.status === 'CLEARED' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-900/50 border border-green-200' : ''}
                    `}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-slate-400 italic text-sm">No outstanding debts found in current reports.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
