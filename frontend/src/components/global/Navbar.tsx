"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShoppingBag, User, Heart, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left section: Menu & Search */}
          <div className="flex items-center gap-4 flex-1">

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border max-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder={t('search')}
                className="bg-transparent border-none text-xs focus:outline-none w-full text-foreground"
              />
            </div>
          </div>

          {/* Center section: Logo */}
          <div className="flex-shrink-0 flex items-center justify-center cursor-pointer">
            <Link href="/" className="font-bold text-2xl tracking-[0.2em] text-primary uppercase group">
              Skin<span className="text-accent font-bold italic">IQ</span>
            </Link>
          </div>

          {/* Right section: Icons & Language */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
            <div className="hidden lg:flex items-center gap-4 mr-6 text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
              <Link href="/" locale="en" className="hover:text-primary transition-all">EN</Link>
              <div className="w-[1px] h-3 bg-border" />
              <Link href="/" locale="ar" className="hover:text-primary transition-all font-arabic text-sm">AR</Link>
            </div>



            <Link href="/account" className="p-2 hover:bg-muted rounded-full transition-colors" aria-label={t('account')}>
              <User className="w-5 h-5 text-foreground" />
            </Link>
            
            <Link href="/wishlist" className="hidden sm:block p-2 hover:bg-muted rounded-full transition-colors">
              <Heart className="w-5 h-5 text-foreground" />
            </Link>

            <button 
              className="p-2 hover:bg-muted rounded-full transition-colors relative"
              onClick={() => useCartStore.getState().openCart()}
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
