'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  renderSidebar: (role: string) => React.ReactNode;
  skeleton: React.ReactNode;
}

export default function AdminAuthGuard({ children, renderSidebar, skeleton }: AdminAuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>('ADMIN');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        if (!supabase) {
          router.replace('/admin-login');
          return;
        }

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
          setAuthorized(true);
          setChecking(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/admin-login');
      }
    }

    checkAuth();

    return () => { cancelled = true; };
  }, [router]);

  if (checking) {
    return <>{skeleton}</>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
      {renderSidebar(role)}
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}