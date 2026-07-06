"use server";

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateHeroConfig(config: any) {
  const supabase = createAdminClient();

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
  const supabase = createAdminClient();
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: "No file provided" };

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