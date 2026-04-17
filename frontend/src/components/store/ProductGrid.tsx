"use client";

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  is_wholesale?: boolean;
  badge?: string;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const locale = tCommon('iqd') === 'دينار عراقي' ? 'ar' : 'en';
  const addItem = useCartStore((state) => state.addItem);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="store">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-light text-foreground">{t('shop')}</h2>
          <p className="text-muted-foreground mt-2 text-balance max-w-md">
            {locale === 'ar' 
              ? 'تركيبات مختارة بعناية لتحقيق أقصى درجات الصحة لحاجز البشرة.' 
              : 'Curated formulas for optimal skin barrier health.'}
          </p>
        </div>
        <div className="hidden sm:flex gap-4 text-sm font-semibold tracking-wide">
          <button className="text-muted-foreground hover:text-foreground transition-colors">{t('filter')}</button>
          <span className="text-border">|</span>
          <button className="text-muted-foreground hover:text-foreground transition-colors">{t('sort')}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 gap-y-8 sm:gap-y-12">
        {products.map((product) => (
          <div key={product.id} className="group flex flex-col interactive-hover relative">
            {/* Badges */}
            {product.badge && (
              <div className={`absolute top-3 left-3 z-10 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                product.is_wholesale 
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                  : "bg-primary text-white"
              }`}>
                {product.badge}
              </div>
            )}
            
            {/* Wishlist Button */}
            <button 
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'fill-primary text-primary' : 'text-slate-600 dark:text-slate-300'}`} />
            </button>

            {/* Image Container */}
            <Link href={`/products/${product.id}`} className="block">
              <div className="aspect-square bg-muted mb-4 overflow-hidden rounded-lg border border-border">
                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col pt-2">
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight min-h-[40px] line-clamp-2 uppercase tracking-tight text-xs sm:text-sm group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <div className="mt-2 flex flex-col gap-0.5">
                  <p className="text-primary dark:text-accent font-black text-sm sm:text-lg tracking-tight tabular-nums">
                    {(product.discount_retail_price || product.retail_price).toLocaleString()} 
                    <span className="text-[10px] sm:text-xs ml-1 opacity-90 uppercase font-black">{tCommon('iqd')}</span>
                  </p>
                  {product.discount_retail_price && (
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-through font-bold">
                      {product.retail_price.toLocaleString()} {tCommon('iqd')}
                    </p>
                  )}
                </div>
              </div>
            </Link>
            
            {/* Add to Cart */}
            <button 
              onClick={() => addItem({ ...product, price: product.discount_retail_price || product.retail_price, quantity: 1 })}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              {t('add_to_cart')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
