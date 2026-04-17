'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Upload an image file to Supabase Storage and return the public URL.
 * Uses the 'product-images' bucket.
 */
async function uploadImageToStorage(file: File): Promise<string | null> {
  const supabase = await createClient();
  
  // Generate a unique filename
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Image upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 */
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  const supabase = await createClient();
  
  // Extract file path from the public URL
  const match = imageUrl.match(/product-images\/(.+)$/);
  if (!match) return;
  
  const filePath = match[1];
  await supabase.storage.from('product-images').remove([filePath]);
}

// ─────────────────────────────────────────
// CREATE PRODUCT
// ─────────────────────────────────────────
export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const retail_price = parseFloat(formData.get('retail_price') as string);
  const wholesale_price = parseFloat(formData.get('wholesale_price') as string);
  
  const discount_retail_str = formData.get('discount_retail_price') as string;
  const discount_wholesale_str = formData.get('discount_wholesale_price') as string;
  const discount_retail_price = discount_retail_str ? parseFloat(discount_retail_str) : null;
  const discount_wholesale_price = discount_wholesale_str ? parseFloat(discount_wholesale_str) : null;

  const is_active = formData.get('is_active') === 'true';
  const category = formData.get('category') as string;
  const specs = formData.get('specs') as string;
  const how_to_use = formData.get('how_to_use') as string;
  const video_url = formData.get('video_url') as string;
  
  const imageFile = formData.get('image') as File | null;

  if (!name || isNaN(retail_price) || isNaN(wholesale_price)) {
    return { error: 'Missing required fields: name, retail_price, wholesale_price' };
  }

  let image_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadImageToStorage(imageFile);
    if (!image_url) {
      console.warn('Image upload skipped — product-images bucket may not exist yet.');
    }
  }

  const payload: Record<string, unknown> = {
    name,
    description: description || '',
    retail_price,
    wholesale_price,
    discount_retail_price,
    discount_wholesale_price,
    is_active,
    category: category || '',
    specs: specs || '',
    how_to_use: how_to_use || '',
    video_url: video_url || '',
  };

  if (image_url) {
    payload.image_url = image_url;
    payload.images = [image_url];
  }

  const { error } = await supabase
    .from('products')
    .insert(payload);

  if (error) {
    console.error('Create product error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { success: true };
}

// ─────────────────────────────────────────
// UPDATE PRODUCT
// ─────────────────────────────────────────
export async function updateProduct(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const retail_price = parseFloat(formData.get('retail_price') as string);
  const wholesale_price = parseFloat(formData.get('wholesale_price') as string);

  const discount_retail_str = formData.get('discount_retail_price') as string;
  const discount_wholesale_str = formData.get('discount_wholesale_price') as string;
  const discount_retail_price = discount_retail_str ? parseFloat(discount_retail_str) : null;
  const discount_wholesale_price = discount_wholesale_str ? parseFloat(discount_wholesale_str) : null;

  const is_active = formData.get('is_active') === 'true';
  const category = formData.get('category') as string;
  const specs = formData.get('specs') as string;
  const how_to_use = formData.get('how_to_use') as string;
  const video_url = formData.get('video_url') as string;
  
  const imageFile = formData.get('image') as File | null;
  const existing_image_url = formData.get('existing_image_url') as string | null;

  if (!id || !name || isNaN(retail_price) || isNaN(wholesale_price)) {
    return { error: 'Missing required fields' };
  }

  let image_url = existing_image_url;

  // If a new image was uploaded, replace the old one
  if (imageFile && imageFile.size > 0) {
    // Delete old image from storage
    if (existing_image_url) {
      await deleteImageFromStorage(existing_image_url);
    }
    image_url = await uploadImageToStorage(imageFile);
    if (!image_url) {
      return { error: 'Failed to upload new image.' };
    }
  }

  const payload: Record<string, unknown> = {
    name,
    description: description || '',
    retail_price,
    wholesale_price,
    discount_retail_price,
    discount_wholesale_price,
    is_active,
    category: category || '',
    specs: specs || '',
    how_to_use: how_to_use || '',
    video_url: video_url || '',
  };

  if (image_url) {
    payload.image_url = image_url;
    payload.images = [image_url];
  }

  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Update product error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { success: true };
}

// ─────────────────────────────────────────
// DELETE PRODUCT
// ─────────────────────────────────────────
export async function deleteProduct(id: string, imageUrl?: string) {
  const supabase = await createClient();

  // Delete the image from storage if it exists
  if (imageUrl) {
    await deleteImageFromStorage(imageUrl);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete product error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { success: true };
}

// ─────────────────────────────────────────
// TOGGLE ACTIVE STATUS
// ─────────────────────────────────────────
export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_active })
    .eq('id', id);

  if (error) {
    console.error('Toggle active error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { success: true };
}
