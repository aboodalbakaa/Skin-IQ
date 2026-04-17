"use client";

import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { useState } from 'react';

interface CartButtonDetailsProps {
  product: {
    id: string;
    name: string;
    retail_price: number;
    discount_retail_price?: number | null;
    image_url: string;
  };
}

export default function CartButtonDetails({ product }: CartButtonDetailsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_retail_price || product.retail_price,
      quantity: quantity,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
      {/* Quantity Selector */}
      <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1 shrink-0">
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="p-4 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-500"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-bold text-lg text-slate-900 dark:text-white">
          {quantity}
        </span>
        <button 
          onClick={() => setQuantity(q => q + 1)}
          className="p-4 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add To Cart Button */}
      <button 
        onClick={handleAdd}
        disabled={added}
        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden shadow-2xl shadow-primary/20
          ${added 
            ? "bg-emerald-500 text-white scale-[0.98]" 
            : "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
          }
        `}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" />
            Added to Sanctuary
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            Add to Selection
          </>
        )}
      </button>
    </div>
  );
}
