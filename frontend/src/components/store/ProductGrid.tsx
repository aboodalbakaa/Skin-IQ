"use client";

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Heart, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  wholesale_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  is_wholesale?: boolean;
  is_out_of_stock?: boolean;
  badge?: string;
}

interface ProductGridProps {
  products: Product[];
  userRole?: string;
}

export default function ProductGrid({ products, userRole }: ProductGridProps) {
  const t = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const locale = tCommon('iqd') === 'دينار عراقي' ? 'ar' : 'en';
  const addItem = useCartStore((state) => state.addItem);
  const { items: favoriteItems, toggleFavorite } = useFavoritesStore();
  
  const wishlist = new Set(favoriteItems.map(item => item.id));

  const isWholesale = userRole === 'WHOLESALE';

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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 gap-y-8 sm:gap-y-12">
        {products.map((product) => {
          const finalPrice = isWholesale 
            ? (product.discount_wholesale_price || product.wholesale_price)
            : (product.discount_retail_price || product.retail_price);
          
          const referencePrice = isWholesale ? product.retail_price : product.retail_price;
          const hasReference = isWholesale || (isWholesale ? !!product.discount_wholesale_price : !!product.discount_retail_price);

          return (
            <div key={product.id} className="group flex flex-col interactive-hover relative">
              {/* Badges */}
              {(product.badge || isWholesale) && (
                <div className={`absolute top-3 left-3 z-10 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                  isWholesale 
                    ? "bg-primary text-white" 
                    : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                }`}>
                  {isWholesale ? 'Wholesale Partner' : product.badge}
                </div>
              )}
              
              {/* Wishlist Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite({
                    id: product.id,
                    name: product.name,
                    price: finalPrice,
                    image_url: product.image_url,
                    is_out_of_stock: product.is_out_of_stock
                  });
                }}
                className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'fill-primary text-primary' : 'text-slate-600 dark:text-slate-300'}`} />
              </button>

              {/* Image Container */}
              <Link href={`/products/${product.id}`} className="block">
                <div className="aspect-square bg-slate-50 dark:bg-white/5 mb-4 overflow-hidden rounded-2xl border border-border relative flex items-center justify-center group-hover:shadow-lg transition-shadow p-6">
                  {product.is_out_of_stock && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/5 backdrop-blur-[2px]">
                      <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
                        Sold Out
                      </span>
                    </div>
                  )}
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name}
                    className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out ${product.is_out_of_stock ? 'grayscale opacity-60' : ''}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-2 space-y-3">
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight min-h-[40px] line-clamp-2 uppercase tracking-tight text-xs sm:text-sm group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {isWholesale ? 'Wholesale Partner Price' : 'Premium Retail Price'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="text-primary dark:text-accent font-black text-lg sm:text-xl tracking-tight tabular-nums">
                        {finalPrice.toLocaleString()} 
                        <span className="text-[10px] sm:text-xs ml-1 uppercase font-black">{tCommon('iqd')}</span>
                      </p>
                      {hasReference && (
                        <p className="text-[10px] sm:text-xs text-slate-400 line-through font-bold">
                          {referencePrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Add to Cart - Detached and Consistent Styling */}
              {product.is_out_of_stock ? (
                <div className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-not-allowed">
                  Sold Out
                </div>
              ) : (
                <button 
                  onClick={() => addItem({ ...product, price: finalPrice, quantity: 1 })}
                  className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-primary/20 group/btn"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                  {t('add_to_cart')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
