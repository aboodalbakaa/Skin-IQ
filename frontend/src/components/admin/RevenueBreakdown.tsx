import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type RevenueTone = 'emerald' | 'amber' | 'red';

interface RevenueBreakdownProps {
  title: string;
  productsTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  icon: LucideIcon;
  tone: RevenueTone;
  footer: ReactNode;
}

const toneStyles: Record<RevenueTone, { icon: string; value: string }> = {
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    icon: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IQ', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function RevenueBreakdown({
  title,
  productsTotal,
  deliveryTotal,
  grandTotal,
  icon: Icon,
  tone,
  footer,
}: RevenueBreakdownProps) {
  const styles = toneStyles[tone];

  return (
    <div className="bg-white dark:bg-[#0D1518] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 interactive-hover">
      <div className="flex items-start justify-between gap-4">
        <div className={`p-3 rounded-2xl ${styles.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className={`text-2xl font-black mt-1 tabular-nums ${styles.value}`}>
            {formatCurrency(grandTotal)} <span className="text-[10px]">IQD</span>
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Grand total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-dashed border-border">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Products</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
            {formatCurrency(productsTotal)} <span className="text-[8px] text-slate-400">IQD</span>
          </p>
        </div>
        <div className="border-l border-border pl-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Delivery</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
            {formatCurrency(deliveryTotal)} <span className="text-[8px] text-slate-400">IQD</span>
          </p>
        </div>
      </div>

      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {footer}
      </div>
    </div>
  );
}
