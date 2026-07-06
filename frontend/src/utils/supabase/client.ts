import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client.
 * Uses @supabase/supabase-js directly instead of @supabase/ssr's createBrowserClient,
 * to avoid any compatibility issues with Next.js 16.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn("Supabase credentials missing");
    return null as any;
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}