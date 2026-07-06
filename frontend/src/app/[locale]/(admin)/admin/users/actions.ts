'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function approveWholesaler(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_users')
    .update({ role: 'WHOLESALER' })
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function rejectWholesaler(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_users')
    .update({ role: 'CUSTOMER', business_name: null })
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_users')
    .update({ role })
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}