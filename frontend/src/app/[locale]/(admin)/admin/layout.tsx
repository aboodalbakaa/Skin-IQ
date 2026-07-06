import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAuthClient from '@/components/admin/AdminAuthClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-300">
      <AdminSidebar role="ADMIN" />
      <main className="flex-1 overflow-x-hidden pt-16 sm:pt-0 p-6 sm:p-12 min-h-screen">
        {children}
      </main>
      <AdminAuthClient />
    </div>
  );
}