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

export async function uploadHeroImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const fileExt = file.name.split('.').pop();
  const fileName = `hero_${Date.now()}.${fileExt}`;
  const filePath = `hero/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('site-assets')
    .getPublicUrl(filePath);

  return { success: true, url: publicUrl };
}
