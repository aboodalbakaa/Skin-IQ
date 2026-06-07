'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Syncs a user from Auth into the app_users table.
 * Call this after signup, or on login if the user doesn't have a row yet.
 */
export async function syncAppUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  // Check if app_users row already exists
  const { data: existing } = await supabase
    .from('app_users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (existing) {
    return { success: true, existing: true, role: existing.role };
  }

  // Create a new app_users row from Auth user_metadata
  const adminClient = createAdminClient();
  const metadata = user.user_metadata || {};

  const { error: insertError } = await adminClient
    .from('app_users')
    .insert({
      id: user.id,
      email: user.email,
      full_name: metadata.full_name || metadata.fullName || '',
      phone_number: metadata.phone_number || metadata.phone || '',
      business_name: metadata.business_name || null,
      role: metadata.role || 'CUSTOMER',
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    // Fallback: try with anon client (won't work if RLS blocks insert)
    console.error('Admin insert failed, trying anon:', insertError.message);
    const { error: anonError } = await supabase
      .from('app_users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: metadata.full_name || metadata.fullName || '',
        phone_number: metadata.phone_number || metadata.phone || '',
        business_name: metadata.business_name || null,
        role: metadata.role || 'CUSTOMER',
      });

    if (anonError) {
      return { error: `Failed to create profile: ${anonError.message}` };
    }
  }

  return { success: true, existing: false, role: metadata.role || 'CUSTOMER' };
}