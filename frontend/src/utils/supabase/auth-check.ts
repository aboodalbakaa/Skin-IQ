import { createAdminClient } from './admin';

/**
 * Verify the current user has an admin-level role.
 * Uses admin client (service_role key) instead of SSR cookies,
 * to avoid @supabase/ssr compatibility issues with Next.js 16.
 */
export async function getAdminRoleFromAuth(allowedRoles: string[] = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']): Promise<{ authorized: true; role: string } | { authorized: false }> {
  try {
    const supabase = createAdminClient();
    // We need to verify the user is authenticated.
    // auth.getUser() on the admin client won't have the session cookie,
    // so we check the Authorization header or rely on the fact that
    // server actions already run in a user context.
    // Instead, we'll use getUser with the service_role client which
    // bypasses RLS but requires the user's JWT.
    // Since createAdminClient has autoRefreshToken: false,
    // we need to pass the session differently.
    
    // Actually, let's use a simpler approach: check the request headers
    // for the auth token that Next.js automatically forwards to server actions.
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const { createServerClient } = await import('@supabase/ssr');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabaseClient = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Don't set cookies, just read them
        },
      },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return { authorized: false };
    }

    const { data: userData } = await supabaseClient
      .from('app_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !allowedRoles.includes(userData.role)) {
      return { authorized: false };
    }

    return { authorized: true, role: userData.role };
  } catch (err) {
    console.error('getAdminRoleFromAuth error:', err);
    return { authorized: false };
  }
}