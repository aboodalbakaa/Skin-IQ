import { redirect } from 'next/navigation';

import ReconciliationConsole from '@/components/admin/ReconciliationConsole';
import { getAdminRole } from '@/utils/supabase/server';

export default async function ReconciliationPage() {
  const auth = await getAdminRole(['ADMIN', 'SUPER_ADMIN']);
  if (!auth.authorized) redirect('/en/admin-login');

  return <ReconciliationConsole />;
}
