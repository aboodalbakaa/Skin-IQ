'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) throw new Error('Unauthorized');

  // Verify Admin permissions
  const { data: adminData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', adminUser.id)
    .single();

  if (adminData?.role !== 'SUPER_ADMIN' && adminData?.role !== 'ADMIN') {
    throw new Error('Unauthorized permissions');
  }

  // Prevent non-SUPER_ADMIN from promoting to SUPER_ADMIN
  if (newRole === 'SUPER_ADMIN' && adminData.role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can assign Super Admin roles');
  }

  const { error } = await supabase
    .from('app_users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
  
  revalidatePath('/[locale]/admin/users', 'page');
}
