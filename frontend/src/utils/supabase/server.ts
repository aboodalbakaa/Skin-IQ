import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

/**
 * Verify the current user has an admin-level role.
 * Returns { authorized: true, role } on success, or { authorized: false } on failure.
 * Does NOT throw — safe for server actions.
 */
export async function getAdminRole(allowedRoles: string[] = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']): Promise<{ authorized: true; role: string } | { authorized: false }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false }
  }

  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || !allowedRoles.includes(userData.role)) {
    return { authorized: false }
  }

  return { authorized: true, role: userData.role }
}
