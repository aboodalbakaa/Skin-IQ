import { createClient } from '@supabase/supabase-js'

/**
 * Administrative Supabase Client
 * Use this ONLY in server-side contexts for operations that require 
 * bypassing RLS visibility restrictions (like verifying a guest order ID).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Service role key must only be used on the server
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    // Fallback to anon if service role is missing (though it shouldn't be for this fix)
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon key.");
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
