'use client';

import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const RANGES = [
  { label: 'Today', value: '1' },
  { label: 'Yesterday', value: '2' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'All Time', value: '3650' },
];

export default function DashboardDateRange({ currentDays }: { currentDays: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', days);
    router.push(`/admin?${params.toString()}`);
    setIsOpen(false);
  };

  const currentLabel = RANGES.find(r => r.value === currentDays)?.label || 'Last 30 Days';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-border rounded-2xl text-sm font-bold hover:border-primary transition-all shadow-sm"
      >
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-slate-900 dark:text-slate-100">{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-[998]" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 md:left-auto md:right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-border rounded-[2rem] shadow-2xl overflow-hidden z-[999] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Select Range</span>
            </div>
            <div className="p-2">
              {RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleSelect(range.value)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    currentDays === range.value 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                  }`}
                >
                  {range.label}
                  {currentDays === range.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border">
              <p className="text-[9px] font-black text-slate-900 dark:text-slate-200 text-center leading-relaxed uppercase tracking-widest">
                Analytics update instantly.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
