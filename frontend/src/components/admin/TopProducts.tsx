"use client";

import { Package, TrendingUp } from 'lucide-react';

interface TopProductsProps {
  products: any[];
}

export default function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IQ', { maximumFractionDigits: 0 }).format(val) + ' IQD';
  };

  return (
    <div className="bg-white dark:bg-[#0D1518] rounded-[2rem] shadow-sm border border-border h-full flex flex-col">
      <div className="p-8 border-b border-border">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Performance</h3>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Best selling products</p>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {products.length > 0 ? (
          products.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-slate-50 dark:bg-slate-900/50 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-primary text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-br-lg">
                    {idx + 1}
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{product.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.totalSold} sold</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(product.price)}
                </div>
                <div className="flex items-center justify-end gap-1 text-[8px] text-emerald-500 font-black uppercase tracking-widest">
                  <TrendingUp className="w-2 h-2" /> Hot
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No sales data yet</p>
          </div>
        )}
      </div>

      <div className="p-8 pt-0 mt-auto">
        <button className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
          Inventory Report
        </button>
      </div>
    </div>
  );
}
