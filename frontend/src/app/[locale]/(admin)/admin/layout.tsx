'use client';

import { useState } from 'react';
import AdminAuthClient from '@/components/admin/AdminAuthClient';

/**
 * Admin layout — fully client-side.
 * Uses only plain <a> tags for navigation (no Next.js Link/router)
 * to avoid RSC streaming errors in Next.js 16.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { href: '/en/admin', label: 'Dashboard' },
    { href: '/en/admin/products', label: 'Manage Products' },
    { href: '/en/admin/bundle-offers', label: 'Urgent Offers' },
    { href: '/en/admin/orders', label: 'Orders & Debt' },
    { href: '/en/admin/users', label: 'Wholesale Approvals' },
    { href: '/en/admin/promo-codes', label: 'Promo Codes' },
    { href: '/en/admin/traffic', label: 'Traffic Insights' },
    { href: '/en/admin/reports', label: 'Export Reports' },
    { href: '/en/admin/settings/hero', label: 'Hero Manager' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
      {/* Mobile header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-primary-foreground flex items-center justify-between px-6 z-40 border-b border-white/10 shadow-lg">
        <a href="/en/admin" className="font-bold tracking-[0.2em] uppercase text-sm">
          Skin<span className="text-accent italic">IQ</span>
        </a>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -mr-2 text-primary-foreground/70 hover:text-primary-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-6 h-6"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-primary text-primary-foreground transform transition-transform duration-500 ease-in-out sm:relative sm:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full sm:translate-x-0'} flex flex-col border-r border-white/10`}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/10">
          <a href="/en/admin" className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase group">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="sm:hidden p-2 text-primary-foreground/50 hover:text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <nav className="flex-1 py-10 px-6 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between group px-5 py-4 rounded-2xl text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5 border border-transparent"
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10 space-y-4 bg-black/10">
          <a href="/en" className="flex items-center justify-center gap-3 py-4 w-full border border-white/10 rounded-2xl hover:bg-primary-foreground hover:text-primary transition-all text-[9.5px] font-bold tracking-[0.2em] uppercase">
            ← Back to Store
          </a>
          <div className="pt-2 px-2 flex items-center justify-between opacity-40 text-[8px] font-black uppercase tracking-[0.3em]">
            <span>v1.2.0</span>
            <span>SkinIQ Alpha</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>

      <AdminAuthClient />
    </div>
  );
}