"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Leaf, Shield, Heart, Droplets } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Full Sanctuary', icon: Sparkles },
  { id: 'cleansers', label: 'Pure Cleansing', icon: Droplets },
  { id: 'moisturizers', label: 'Deep Hydration', icon: Shield },
  { id: 'serums', label: 'Active Serums', icon: Heart },
  { id: 'organic', label: 'Earth Origins', icon: Leaf },
];

export default function CategoryLuxe() {
  const [active, setActive] = useState('all');

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6 sm:px-12 lg:px-24 snap-x">
        {CATEGORIES.map((cat, index) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`
                flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-500 snap-center
                ${isActive 
                  ? 'bg-[#9A8C73] text-white shadow-xl shadow-[#9A8C73]/20 translate-y-[-2px]' 
                  : 'bg-white/50 dark:bg-white/[0.02] border border-white/20 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white hover:border-[#9A8C73]/30'}
              `}
              style={{ 
                animation: `fade-in-right 0.8s ease-out forwards ${index * 0.1}s`,
                opacity: 0,
                transform: 'translateX(20px)'
              }}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : 'opacity-40'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {cat.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-white animate-ping" />
              )}
            </button>
          )
        })}
      </div>

      <style jsx global>{`
        @keyframes fade-in-right {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
