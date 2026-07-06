'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Client-side admin auth guard.
 * Checks the user's auth state and role after a short delay.
 * If unauthorized, redirects via full page navigation (not router.push)
 * to avoid triggering Next.js RSC streaming errors.
 */
export default function AdminAuthClient() {
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        if (!supabase) {
          if (!cancelled) window.location.href = '/en/admin-login';
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) window.location.href = '/en/admin-login';
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
          if (!cancelled) window.location.href = '/en/admin-login';
          return;
        }

        // User is authorized — do nothing
      } catch (err) {
        console.error('AdminAuthClient: background auth check failed:', err);
      }
    }

    const timer = setTimeout(checkAuth, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return null;
}