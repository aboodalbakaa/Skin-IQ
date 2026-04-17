'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPromoCode(formData: FormData) {
  const supabase = await createClient();
  const code = formData.get('code') as string;
  const discount = Number(formData.get('discount'));

  const discount_type = formData.get('discount_type') as string;

  const { error } = await supabase
    .from('promo_codes')
    .insert({
      code: code.toUpperCase(),
      discount_type: discount_type,
      discount_value: discount,
      is_active: true
    });

  if (error) return { error: error.message };
  revalidatePath('/admin/promo-codes');
  return { success: true };
}

export async function togglePromoStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('promo_codes')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/promo-codes');
  return { success: true };
}

export async function deletePromoCode(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/promo-codes');
  return { success: true };
}
