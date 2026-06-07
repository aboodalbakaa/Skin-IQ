import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Returns the authenticated user's ID and role if they have admin access,
 * otherwise returns null. Used for defence-in-depth auth checks in server actions.
 */
export async function getAdminRole(): Promise<{ userId: string; role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single();
  const role = data?.role as string | undefined;
  if (!role || (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'MANAGER')) return null;
  return { userId: user.id, role };
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
