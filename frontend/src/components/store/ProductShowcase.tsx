"use client";

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Star, ChevronRight, ChevronLeft, ArrowRight, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Product {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  category?: string;
  badge?: string;
  is_out_of_stock?: boolean;
}

interface ProductShowcaseProps {
  products: Product[];
  userRole?: string;
}

export default function ProductShowcase({ products, userRole }: ProductShowcaseProps) {
  const t = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const isWholesale = userRole === 'WHOLESALE';

  // Entrance animation logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/showcase py-12">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-float-slow" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full animate-float-slower" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Navigation Arrows */}
      <div className="hidden lg:block">
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-foreground shadow-2xl hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-foreground shadow-2xl hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="grid grid-cols-2 gap-3 lg:flex lg:gap-6 overflow-x-auto pb-12 px-4 sm:px-12 lg:px-24 lg:snap-x lg:snap-mandatory scrollbar-hide no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => {
          const finalPrice = isWholesale 
            ? (product.discount_wholesale_price || product.wholesale_price) 
            : (product.discount_retail_price || product.retail_price);
          
          const originalPrice = isWholesale ? product.wholesale_price : product.retail_price;
          const hasDiscount = isWholesale ? !!product.discount_wholesale_price : !!product.discount_retail_price;

          return (
            <div 
              key={product.id}
              className={`w-full lg:flex-shrink-0 lg:w-[280px] sm:w-[320px] lg:snap-center transition-all duration-1000 ease-out transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
              `}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="group relative bg-white dark:bg-slate-900 border border-border shadow-sm rounded-3xl lg:rounded-[2.5rem] p-3 lg:p-4 h-full flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                
                {/* Image Area */}
                <div className="relative aspect-square rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden mb-4 lg:mb-6 bg-slate-50 dark:bg-white/5 p-6 flex items-center justify-center border border-border">
                   {/* Badge */}
                   {(product.badge || isWholesale) && (
                    <div className={`absolute top-4 left-4 z-10 px-4 py-1.5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                      isWholesale ? 'bg-primary text-white' : 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white'
                    }`}>
                      {isWholesale ? 'Wholesale Partner' : product.badge}
                    </div>
                  )}
                  
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name}
                    className={`w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110 ${product.is_out_of_stock ? 'grayscale opacity-60' : ''}`}
                  />

                  {/* Out of Stock Overlay */}
                  {product.is_out_of_stock && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/5 backdrop-blur-[2px]">
                      <span className="px-5 py-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
                        Sold Out
                      </span>
                    </div>
                  )}
                  
                  {/* Visual Polish Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Info */}
                <div className="flex-1 px-1 space-y-4">
                  <Link href={`/products/${product.id}`} className="block group/link space-y-3">
                    <div className="flex items-center gap-1 text-amber-400/80">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                    </div>
                    <h3 className="text-sm lg:text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover/link:text-primary transition-colors uppercase tracking-tight">
                      {product.name}
                    </h3>
                    
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">
                        {isWholesale ? 'Wholesale Partner Price' : 'Premium Retail Price'}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-primary tabular-nums">
                          {finalPrice.toLocaleString()} <span className="text-[10px] uppercase ml-1">IQD</span>
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-slate-400 line-through">
                            {originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Quick Action Button - Moved below and detached */}
                  {!product.is_out_of_stock && (
                    <button 
                      onClick={() => addItem({ ...product, price: finalPrice, quantity: 1 })}
                      className="w-full py-4 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-primary/20 group/btn"
                    >
                      <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                      Quick Add
                    </button>
                  )}

                  {product.is_out_of_stock && (
                    <div className="w-full py-4 mt-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-dashed border-slate-200 dark:border-white/10 cursor-not-allowed">
                      Unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Closing "View More" Slide */}
        <div className="w-full lg:flex-shrink-0 lg:w-[200px] flex items-center justify-center lg:snap-center col-span-2 lg:col-span-1 mt-4 lg:mt-0">
           <a 
            href="/products" 
            className="flex flex-col items-center gap-4 group/more text-slate-400 hover:text-primary transition-all"
           >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center group-hover/more:border-primary group-hover/more:scale-110 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore All</span>
           </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(30px, -30px) scale(1); }
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
