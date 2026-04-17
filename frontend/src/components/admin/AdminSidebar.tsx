"use client";

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { 
  Home, Users, Package, FileText, ShoppingBag, 
  Ticket, Globe, Menu, X, ChevronRight, LogOut 
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdminSidebarProps {
  role: string;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Admin');
  const pathname = usePathname();

  const isFullAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MANAGER';

  const menuItems = [
    { href: '/admin', label: t('dashboard'), icon: Home, adminOnly: false },
    { href: '/admin/products', label: t('products_manage'), icon: ShoppingBag, adminOnly: false },
    { href: '/admin/orders', label: t('orders'), icon: Package, adminOnly: true },
    { href: '/admin/users', label: t('wholesale_approvals'), icon: Users, adminOnly: true },
    { href: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket, adminOnly: true },
    { href: '/admin/reports', label: t('reports'), icon: FileText, adminOnly: true },
  ];

  const filteredItems = menuItems.filter(item => !item.adminOnly || isFullAdmin);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-6 z-40 border-b border-white/10 shadow-lg">
        <Link href="/admin" className="font-bold tracking-[0.2em] uppercase text-sm">
          Skin<span className="text-accent italic">IQ</span>
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-white/70 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-primary text-white transform transition-transform duration-500 ease-in-out sm:relative sm:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full sm:translate-x-0'}
        flex flex-col border-r border-white/10
      `}>
        {/* Sidebar Header */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/10">
          <Link href="/admin" className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase group">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="sm:hidden p-2 text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-10 px-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between group px-5 py-4 rounded-2xl text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-white/30 group-hover:text-white/60'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 space-y-4 bg-black/10">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 py-4 w-full border border-white/10 rounded-2xl hover:bg-white hover:text-primary transition-all text-[9.5px] font-bold tracking-[0.2em] uppercase"
          >
            <Globe className="w-4 h-4" />
            {t('back_to_store')}
          </Link>
          <div className="pt-2 px-2 flex items-center justify-between opacity-40 text-[8px] font-black uppercase tracking-[0.3em]">
             <span>v1.2.0</span>
             <span>SkinIQ Alpha</span>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
