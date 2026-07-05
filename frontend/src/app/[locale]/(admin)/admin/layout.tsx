import AdminSidebar from '@/components/admin/AdminSidebar';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
        <div className="w-72 bg-primary text-primary-foreground border-r border-white/10 p-4">
          <div className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase mb-8">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </div>
          <p className="text-white/70 text-sm mb-8">Admin Panel</p>
          <div className="space-y-2">
            <a href="/admin" className="block px-4 py-3 rounded-xl bg-white/10 text-white font-medium text-sm">Dashboard</a>
            <a href="/admin/products" className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 font-medium text-sm">Products</a>
            <a href="/admin/orders" className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 font-medium text-sm">Orders</a>
            <a href="/admin/bundle-offers" className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 font-medium text-sm">Offers</a>
          </div>
        </div>
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}