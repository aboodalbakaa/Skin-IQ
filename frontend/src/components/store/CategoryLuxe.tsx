"use client";

import { useState } from 'react';
import { Sparkles, Grid3X3 } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  onFilter: (category: string | null) => void;
}

export default function CategoryFilter({ categories, onFilter }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);

  const handleClick = (cat: string | null) => {
    setActive(cat);
    onFilter(cat);
  };

  // Only render if there are actual categories
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-6 sm:py-8">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-6 sm:px-12 lg:px-24 snap-x">
        {/* "All" Button */}
        <button
          onClick={() => handleClick(null)}
          className={`
            flex-shrink-0 flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-full transition-all duration-300 snap-center
            ${active === null 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white hover:border-primary/30'}
          `}
        >
          <Grid3X3 className={`w-3.5 h-3.5 ${active === null ? '' : 'opacity-40'}`} />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em]">
            All Products
          </span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`
              flex-shrink-0 flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-full transition-all duration-300 snap-center
              ${active === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white hover:border-primary/30'}
            `}
          >
            <Sparkles className={`w-3.5 h-3.5 ${active === cat ? '' : 'opacity-40'}`} />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em]">
              {cat}
            </span>
          </button>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
