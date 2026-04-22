'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin'); // Revalidate dashboard too
  return { success: true };
}
