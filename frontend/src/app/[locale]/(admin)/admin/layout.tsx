import { Link } from '@/i18n/routing';
import { Home, Users, Package, FileText, ShoppingBag, Ticket, Globe } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

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

  const isFullAdmin = userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Minimalist Deep Teal */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-2xl border-r border-white/10 z-10 hidden sm:flex">
        <div className="h-24 flex flex-col items-center justify-center border-b border-white/10 px-8">
          <Link href="/admin" className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase group">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </Link>
          <span className="text-[8px] font-bold tracking-[0.4em] opacity-40 mt-1 uppercase">Business Platform</span>
        </div>
        
        <nav className="flex-1 py-10 px-6 flex flex-col gap-3">
          <Link href="/admin" className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border border-white/5 hover:bg-white/10">
            <Home className="w-4 h-4 text-accent" /> {t('dashboard')}
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5">
            <ShoppingBag className="w-4 h-4" /> {t('products_manage')}
          </Link>

          {isFullAdmin && (
            <>
              <Link href="/admin/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5">
                <Package className="w-4 h-4" /> {t('orders')}
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5">
                <Users className="w-4 h-4" /> {t('wholesale_approvals')}
              </Link>
              <Link href="/admin/promo-codes" className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5">
                <Ticket className="w-4 h-4" /> Promo Codes
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5">
                <FileText className="w-4 h-4" /> {t('reports')}
              </Link>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/10">
           <Link href="/" className="flex items-center justify-center gap-2 py-4 w-full border border-white/20 rounded-xl hover:bg-white hover:text-primary transition-all text-[10px] font-bold tracking-[0.2em] uppercase">
             {t('back_to_store')}
           </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 pb-32 sm:p-12 sm:pb-12 bg-background">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Floating Premium Dock */}
      <div className="sm:hidden fixed bottom-6 left-6 right-6 z-50">
        <nav className="glass rounded-[24px] shadow-2xl flex justify-around items-center h-20 px-2 border border-white/20">
          <Link href="/admin" className="flex flex-col items-center gap-1.5 px-3 py-2 transition-all">
            <div className="p-2 rounded-2xl bg-primary text-accent shadow-lg shadow-primary/20">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter text-primary opacity-70">Home</span>
          </Link>
          <Link href="/admin/products" className="flex flex-col items-center gap-1.5 px-3 py-2 opacity-40 hover:opacity-100 transition-all">
            <ShoppingBag className="w-5 h-5 text-foreground" />
            <span className="text-[8px] font-bold uppercase tracking-tighter text-foreground">Store</span>
          </Link>
          
          {isFullAdmin && (
            <>
              <Link href="/admin/orders" className="flex flex-col items-center gap-1.5 px-3 py-2 opacity-40 hover:opacity-100 transition-all">
                <Package className="w-5 h-5 text-foreground" />
                <span className="text-[8px] font-bold uppercase tracking-tighter text-foreground">Orders</span>
              </Link>
              <Link href="/admin/users" className="flex flex-col items-center gap-1.5 px-3 py-2 opacity-40 hover:opacity-100 transition-all">
                <Users className="w-5 h-5 text-foreground" />
                <span className="text-[8px] font-bold uppercase tracking-tighter text-foreground">Partners</span>
              </Link>
              <Link href="/admin/reports" className="flex flex-col items-center gap-1.5 px-3 py-2 opacity-40 hover:opacity-100 transition-all">
                <FileText className="w-5 h-5 text-foreground" />
                <span className="text-[8px] font-bold uppercase tracking-tighter text-foreground">Stats</span>
              </Link>
            </>
          )}

          {/* View Website Link for Mobile */}
          <Link href="/" className="flex flex-col items-center gap-1.5 px-3 py-2 text-accent transition-all">
            <div className="p-2 rounded-2xl bg-white/10 shadow-lg border border-white/10">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Site</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
