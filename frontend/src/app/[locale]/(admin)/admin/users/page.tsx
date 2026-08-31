import { createAdminClient } from '@/utils/supabase/admin';
import { getAdminRole } from '@/utils/supabase/server';
import UserManagementTable from './UserManagementTable';
import { redirect } from 'next/navigation';

export default async function UserManagementPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string }> 
}) {
  const { filter } = await searchParams;
  const auth = await getAdminRole();

  if (!auth.authorized) {
    redirect('/en/admin-login');
  }

  if (auth.role === 'MANAGER') {
    redirect('/en/admin/products');
  }

  const supabase = createAdminClient();

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

      <UserManagementTable initialUsers={users || []} filter={filter} />
    </div>
  );
}

