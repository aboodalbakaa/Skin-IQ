"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/admin-login');
          return;
        }

        const { data: userData } = await supabase
          .from('app_users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (
          !userData ||
          (userData.role !== 'ADMIN' &&
            userData.role !== 'SUPER_ADMIN' &&
            userData.role !== 'MANAGER')
        ) {
          router.replace('/admin-login');
          return;
        }

        if (!cancelled) {
          setRole(userData.role);
          setChecking(false);
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        router.replace('/admin-login');
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="w-72 bg-primary text-primary-foreground border-r border-white/10 flex flex-col">
          <div className="h-24 flex items-center px-8 border-b border-white/10">
            <div className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase">
              Skin<span className="text-accent font-bold italic">IQ</span>
            </div>
          </div>
          <nav className="flex-1 py-10 px-6 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-primary-foreground/5 animate-pulse" />
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-12">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
      <AdminSidebar role={role!} />
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}