'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import heavy components so they don't block initial render
const AdminSidebar = dynamic(() => import('@/components/admin/AdminSidebar'), { ssr: false });
const AdminAuthClient = dynamic(() => import('@/components/admin/AdminAuthClient'), { ssr: false });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
      <Suspense fallback={<div className="w-72 bg-primary min-h-screen animate-pulse" />}>
        <AdminSidebar role="ADMIN" />
      </Suspense>
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
      <AdminAuthClient />
    </div>
  );
}