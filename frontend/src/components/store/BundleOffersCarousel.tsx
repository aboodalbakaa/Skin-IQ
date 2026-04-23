"use client";

import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BundleOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  bundle_price: number;
  original_price: number;
}

interface BundleOffersCarouselProps {
  offers: BundleOffer[];
  locale?: string;
}

export default function BundleOffersCarousel({ offers, locale = 'en' }: BundleOffersCarouselProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isAr = locale === 'ar';

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      
      // Auto-scroll logic
      const interval = setInterval(() => {
        if (!el) return;
        const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
        if (isAtEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
        }
      }, 5000);

      return () => {
        el.removeEventListener('scroll', checkScroll);
        clearInterval(interval);
      };
    }
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  const handleAddBundle = (offer: BundleOffer) => {
    addItem({
      id: `bundle-${offer.id}`,
      name: isAr ? offer.title_ar : offer.title_en,
      price: offer.bundle_price,
      quantity: 1,
      image_url: offer.image_url,
    });
    setAddedId(offer.id);
    setTimeout(() => setAddedId(null), 2500);
  };

  if (!offers || offers.length === 0) return null;

  const discount = (offer: BundleOffer) => 
    Math.round(((offer.original_price - offer.bundle_price) / offer.original_price) * 100);

  return (
    <div className="relative w-full">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
            <Flame className="w-4 h-4 animate-pulse" />
            {isAr ? 'عروض حصرية' : 'Exclusive Offers'}
          </div>
        </div>
        <h2 className="text-3xl sm:text-5xl font-light tracking-tighter text-foreground uppercase leading-tight">
          {isAr ? (
            <>عروض <span className="italic font-serif text-red-500">خاصة</span></>
          ) : (
            <>Special <span className="italic font-serif text-red-500">Deals</span></>
          )}
        </h2>
        <p className="text-muted-foreground max-w-md font-medium leading-relaxed mt-3 text-sm">
          {isAr 
            ? 'عروض لفترة محدودة - أضف العرض كاملاً إلى سلتك بنقرة واحدة'
            : 'Limited-time bundles — add the entire offer to your basket in one click'}
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Navigation Arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth px-6 sm:px-12 lg:px-24 pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[55vw] lg:w-[45vw] xl:w-[40vw] scroll-snap-start"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-border shadow-2xl shadow-black/5 group/card hover:shadow-3xl transition-all duration-500">
                
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg">
                  <Flame className="w-3.5 h-3.5" />
                  {isAr ? `خصم ${discount(offer)}%` : `${discount(offer)}% OFF`}
                </div>

                {/* Offer Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-50 dark:bg-white/5 p-4 flex items-center justify-center">
                  <img
                    src={offer.image_url}
                    alt={isAr ? offer.title_ar : offer.title_en}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-105"
                  />
                  {/* Gradient Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                </div>

                {/* Content */}
                <div className="relative px-5 sm:px-8 pb-5 sm:pb-8 -mt-8">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1" dir={isAr ? 'rtl' : 'ltr'}>
                    {isAr ? offer.title_ar : offer.title_en}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2" dir={isAr ? 'rtl' : 'ltr'}>
                    {isAr ? offer.description_ar : offer.description_en}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-center gap-3 mb-4" dir={isAr ? 'rtl' : 'ltr'}>
                    <span className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight tabular-nums">
                      {offer.bundle_price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-red-400 uppercase">{isAr ? 'د.ع' : 'IQD'}</span>
                    <span className="text-sm sm:text-base font-bold text-slate-300 line-through tabular-nums">
                      {offer.original_price.toLocaleString()}
                    </span>
                  </div>

                  {/* Add Bundle to Cart Button */}
                  <button
                    onClick={() => handleAddBundle(offer)}
                    disabled={addedId === offer.id}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg
                      ${addedId === offer.id
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
                      }
                    `}
                  >
                    {addedId === offer.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        {isAr ? 'تمت الإضافة!' : 'Added to Basket!'}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        {isAr ? 'أضف العرض للسلة' : 'Add Offer to Basket'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
