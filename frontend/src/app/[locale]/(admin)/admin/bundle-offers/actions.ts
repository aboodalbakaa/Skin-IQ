'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function uploadImageToStorage(file: File): Promise<string | null> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `bundle-${crypto.randomUUID()}.${ext}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Bundle image upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  const supabase = await createClient();
  const match = imageUrl.match(/product-images\/(.+)$/);
  if (!match) return;
  const filePath = match[1];
  await supabase.storage.from('product-images').remove([filePath]);
}

export async function createBundleOffer(formData: FormData) {
  const supabase = await createClient();

  const title_ar = formData.get('title_ar') as string;
  const title_en = formData.get('title_en') as string;
  const description_ar = formData.get('description_ar') as string;
  const description_en = formData.get('description_en') as string;
  const bundle_price = parseFloat(formData.get('bundle_price') as string);
  const original_price = parseFloat(formData.get('original_price') as string);
  const is_active = formData.get('is_active') === 'true';
  const sort_order = parseInt(formData.get('sort_order') as string || '0');
  
  const imageFile = formData.get('image') as File | null;

  if (!title_ar || !title_en || isNaN(bundle_price) || isNaN(original_price)) {
    return { error: 'Missing required fields' };
  }

  let image_url = '';
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadImageToStorage(imageFile) || '';
  }

  const { error } = await supabase
    .from('bundle_offers')
    .insert({
      title_ar,
      title_en,
      description_ar: description_ar || '',
      description_en: description_en || '',
      image_url,
      bundle_price,
      original_price,
      is_active,
      sort_order,
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/bundle-offers');
  revalidatePath('/');
  return { success: true };
}

export async function updateBundleOffer(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const title_ar = formData.get('title_ar') as string;
  const title_en = formData.get('title_en') as string;
  const description_ar = formData.get('description_ar') as string;
  const description_en = formData.get('description_en') as string;
  const bundle_price = parseFloat(formData.get('bundle_price') as string);
  const original_price = parseFloat(formData.get('original_price') as string);
  const is_active = formData.get('is_active') === 'true';
  const sort_order = parseInt(formData.get('sort_order') as string || '0');
  
  const imageFile = formData.get('image') as File | null;
  const existing_image_url = formData.get('existing_image_url') as string | null;

  if (!id || !title_ar || !title_en || isNaN(bundle_price) || isNaN(original_price)) {
    return { error: 'Missing required fields' };
  }

  let image_url = existing_image_url || '';
  if (imageFile && imageFile.size > 0) {
    if (existing_image_url && existing_image_url.includes('supabase.co')) {
      await deleteImageFromStorage(existing_image_url);
    }
    image_url = await uploadImageToStorage(imageFile) || '';
  }

  const { error } = await supabase
    .from('bundle_offers')
    .update({
      title_ar,
      title_en,
      description_ar: description_ar || '',
      description_en: description_en || '',
      image_url,
      bundle_price,
      original_price,
      is_active,
      sort_order,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/bundle-offers');
  revalidatePath('/');
  return { success: true };
}

export async function deleteBundleOffer(id: string, imageUrl?: string) {
  const supabase = await createClient();

  if (imageUrl && imageUrl.includes('supabase.co')) {
    await deleteImageFromStorage(imageUrl);
  }

  const { error } = await supabase
    .from('bundle_offers')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/bundle-offers');
  revalidatePath('/');
  return { success: true };
}

export async function toggleBundleActive(id: string, is_active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('bundle_offers')
    .update({ is_active })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/bundle-offers');
  revalidatePath('/');
  return { success: true };
}
