'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { success: true };
}