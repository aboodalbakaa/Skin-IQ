'use client';

import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const RANGES = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 14 Days', value: '14' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'Last 180 Days', value: '180' },
  { label: 'All Time', value: '3650' }, // 10 years approx
];

export default function DashboardDateRange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get('days') || '30';
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRange = RANGES.find(r => r.value === currentDays) || RANGES[2];

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', value);
    router.push(`/admin?${params.toString()}`);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all group"
      >
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border flex items-center gap-3 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
           <Calendar className="w-4 h-4 text-slate-400" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-200">{selectedRange.label}</span>
           <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-border rounded-[2rem] shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Select Timeframe</span>
          </div>
          <div className="p-2">
            {RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => handleSelect(range.value)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  currentDays === range.value 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                }`}
              >
                {range.label}
                {currentDays === range.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border">
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center leading-relaxed uppercase tracking-tighter">
              Charts and trends will automatically update based on your selection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
