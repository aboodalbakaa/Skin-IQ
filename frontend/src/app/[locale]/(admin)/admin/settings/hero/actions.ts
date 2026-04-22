"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateHeroConfig(config: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify admin role
  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ 
      key: 'hero_config', 
      value: config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) {
    console.error('Error updating hero config:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
