"use client";

import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function CartNotificationModal() {
  const t = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const { items, isOpen, closeCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const latestItem = items[items.length - 1];
  const cartSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />
      <div className="fixed top-24 right-4 sm:right-8 w-[360px] bg-white dark:bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all translate-y-0 opacity-100 duration-300 ease-out">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span>{t('added_to_cart') || 'Added to Cart'}</span>
          </div>
          <button 
            onClick={closeCart}
            className="p-1 hover:bg-border rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content - Showing latest item */}
        <div className="p-5 flex gap-4">
          <div className="w-20 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
            {latestItem?.image_url ? (
              <img src={latestItem.image_url} alt={latestItem.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-light uppercase tracking-tighter">No Image</div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2">{latestItem?.name}</h4>
            <p className="text-muted-foreground text-sm mt-1">{t('quantity') || 'Qty'}: {latestItem?.quantity}</p>
            <p className="font-bold text-primary text-sm mt-2">{latestItem?.price?.toLocaleString()} {tCommon('iqd')}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-medium mb-2">
            <span className="text-muted-foreground">{t('total')}:</span>
            <span className="text-foreground">{cartSubtotal.toLocaleString()} {tCommon('iqd')}</span>
          </div>
          
          <Link 
            href="/cart" 
            onClick={closeCart}
            className="w-full py-3 rounded-full border border-primary text-primary font-medium text-sm transition-colors hover:bg-primary hover:text-white flex items-center justify-center"
          >
            {t('view_cart') || 'View Cart'}
          </Link>
          <Link 
            href="/checkout" 
            onClick={closeCart}
            className="w-full py-3 rounded-full bg-primary text-white font-medium text-sm transition-opacity hover:opacity-90 flex items-center justify-center"
          >
            {t('checkout')}
          </Link>
        </div>
      </div>
    </>
  );
}
