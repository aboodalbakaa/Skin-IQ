import { createClient } from '@/utils/supabase/server';
import UserManagementTable from './UserManagementTable';

export default async function UserManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userData } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (userData?.role === 'MANAGER') {
    const { redirect } = await import('next/navigation');
    redirect('/admin/products');
  }

  // Fetch all users for management
  const { data: users, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        Error loading users: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground">User & Role <span className="italic">Management</span></h1>
          <p className="text-muted-foreground mt-2 font-medium tracking-wide">Assign permissions, approve partners, and manage business roles.</p>
        </div>
      </div>

      <UserManagementTable initialUsers={users || []} />
    </div>
  );
}

