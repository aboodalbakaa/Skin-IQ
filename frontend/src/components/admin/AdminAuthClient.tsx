'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Client-side admin auth guard.
 * Checks the user's auth state and role after a short delay (to let page render first).
 * If unauthorized, redirects to admin-login page.
 * All errors are caught silently to avoid crashing the error boundary.
 */
export default function AdminAuthClient() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        if (!supabase) {
          if (!cancelled) router.replace('/en/admin-login');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) router.replace('/en/admin-login');
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
          if (!cancelled) router.replace('/en/admin-login');
          return;
        }

        // User is authorized — do nothing, layout stays visible
      } catch (err) {
        // Silently swallow errors — this component is a background guard
        // and should never crash the admin panel
        console.error('AdminAuthClient: background auth check failed:', err);
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