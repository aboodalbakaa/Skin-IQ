"use client";

import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import { Heart, X, Trash2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function FavoritesModal() {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Products');
  const { items, isOpen, closeFavorites, removeFavorite } = useFavoritesStore();
  const addItem = useCartStore((state) => state.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm transition-opacity" 
        onClick={closeFavorites}
      />
      <div className="fixed top-24 right-4 sm:right-8 w-[360px] bg-white dark:bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all translate-y-0 opacity-100 duration-300 ease-out max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted shrink-0">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span>Favorites</span>
          </div>
          <button 
            onClick={closeFavorites}
            className="p-1 hover:bg-border rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Your favorites list is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 border border-border rounded-lg bg-muted/30">
                <div className="w-16 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px] uppercase">No Img</div>
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 pr-2">{item.name}</h4>
                    <button 
                      onClick={() => removeFavorite(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <p className="font-bold text-primary text-xs">{item.price?.toLocaleString()} {tCommon('iqd')}</p>
                    {!item.is_out_of_stock && (
                      <button 
                        onClick={() => {
                          addItem({ ...item, quantity: 1 });
                          closeFavorites();
                        }}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md px-2 py-1.5 text-[9px] font-black uppercase flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 bg-muted border-t border-border shrink-0">
            <Link 
              href="/store" 
              onClick={closeFavorites}
              className="w-full py-2.5 rounded-full border border-primary text-primary font-medium text-sm transition-colors hover:bg-primary hover:text-white flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
