"use client";

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const t = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const { items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-32 px-4 bg-background">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('empty_title') || 'Your cart is empty'}</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            {t('empty_description') || "Looks like you haven't added anything to your cart yet. Explore our premium skincare collections."}
          </p>
          <Link 
            href="/#store" 
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white rounded-full font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          >
            {tCommon('shop_now') || 'Start Shopping'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb / Back Link */}
        <Link href="/#store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10 text-sm font-medium group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t('back_to_shop') || 'Back to Store'}
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative flex flex-col sm:flex-row items-center gap-6 p-6 bg-white dark:bg-[#0D1518] rounded-3xl border border-border transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-muted rounded-2xl overflow-hidden border border-border flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest px-4 text-center">No Image</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider font-semibold">
                      {item.price.toLocaleString()} {tCommon('iqd')}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-800 text-foreground transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-foreground">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-800 text-foreground transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-medium text-xs transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('remove') || 'Remove'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Total Price Per Item */}
                  <div className="hidden md:flex flex-col items-end justify-center pl-6 border-l border-border ml-4">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter mb-1">Subtotal</span>
                    <span className="text-xl font-bold text-primary whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()} {tCommon('iqd')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar Summary */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white dark:bg-[#0D1518] p-8 rounded-[2rem] border border-border shadow-2xl shadow-primary/5">
              <h2 className="text-xl font-bold text-foreground mb-8 flex items-center gap-2">
                {t('summary') || 'Order Summary'}
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-slate-200 font-medium">{t('subtotal') || 'Subtotal'}</span>
                  <span className="text-foreground dark:text-slate-100 font-bold">{subtotal.toLocaleString()} {tCommon('iqd')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-slate-200 font-medium">{tCommon('delivery') || 'Delivery'}</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">Calculated at Checkout</span>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs uppercase text-muted-foreground dark:text-slate-300 font-bold tracking-tighter">{t('total') || 'Estimated Total'}</span>
                    <span className="text-3xl font-bold text-primary dark:text-accent">
                      {subtotal.toLocaleString()} <span className="text-xs">{tCommon('iqd')}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right italic">VAT included where applicable</p>
                </div>
              </div>

              <Link 
                href="/checkout" 
                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-bold transition-all hover:opacity-95 hover:scale-[1.02] shadow-xl shadow-primary/30 active:scale-[0.98]"
              >
                {t('checkout')} <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="mt-6 flex items-center justify-center gap-4 py-4 border-t border-border mt-8">
                <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed" alt="Visa" />
                <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed" alt="Mastercard" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter border border-border rounded px-2 py-1">Cash on Delivery</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
