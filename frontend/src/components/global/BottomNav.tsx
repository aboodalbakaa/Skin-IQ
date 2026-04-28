"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Home, ShoppingBag, Stethoscope, User } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BottomNav() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const navItems = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/products', icon: ShoppingBag, label: t('shop') },
    { href: 'https://dr-daniya.vercel.app/consultation', icon: Stethoscope, label: t('consultation'), external: true },
    { href: '/account', icon: User, label: t('account') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden glass border-t border-border pb-safe transition-all duration-300">
      <div className="flex justify-around items-center h-16 sm:h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-all duration-300 group gap-1"
              >
                <div className="p-1.5 rounded-xl group-hover:bg-primary/5 transition-colors">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group gap-1 relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'group-hover:bg-primary/5'}`}>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'fill-primary/20' : ''}`} />
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${locale === 'ar' ? 'font-arabic' : ''} ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
