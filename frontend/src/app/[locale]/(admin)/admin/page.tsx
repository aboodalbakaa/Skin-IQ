import StatCards from '@/components/admin/StatCards';
import DebtReport from '@/components/admin/DebtReport';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch Total Debt
  const { data: debtData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'DEBT');
  const totalDebt = debtData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  // 2. Fetch Total Revenue (Paid)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'PAID');
  const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  // 3. Fetch Pending Wholesalers (Customers awaiting approval)
  const { count: pendingWholesalers } = await supabase
    .from('app_users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'CUSTOMER');

  const stats = {
    totalDebt: totalDebt,
    monthlyRevenue: totalRevenue,
    pendingWholesalers: pendingWholesalers || 0
  };

  return (
    <div className="max-w-6xl mx-auto w-full font-[family-name:var(--font-sans)]">
      
      {/* Top Welcome Title */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1 tracking-wide">Welcome to the SkinIQ control center.</p>
        </div>
      </div>

      <StatCards stats={stats} />
      <DebtReport />

    </div>
  );
}
