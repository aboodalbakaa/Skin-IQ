import AdminSidebar from '@/components/admin/AdminSidebar';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Admin');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin-login');
  }

  // Check Role in Database
  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN' && userData.role !== 'MANAGER')) {
    redirect('/admin-login');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar role={userData.role} />

      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}
