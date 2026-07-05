'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminAuthClient() {
  const router = useRouter();

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

        // User is authorized — do nothing, layout stays visible
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/admin-login');
      }
    }

    // Delay the auth check slightly to let page content render first
    const timer = setTimeout(checkAuth, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}