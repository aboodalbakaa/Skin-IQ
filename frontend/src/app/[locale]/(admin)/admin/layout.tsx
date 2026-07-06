/**
 * Ultra-minimal admin layout — pure static content.
 * Zero client components, zero data fetching, zero hooks.
 * Just proves whether the admin route itself renders without error.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-72 bg-primary text-primary-foreground p-6">
        <div className="font-bold text-2xl tracking-[0.2em] uppercase">
          Skin<span className="text-accent italic">IQ</span>
        </div>
        <nav className="mt-10 text-sm opacity-70">
          Admin Navigation
        </nav>
      </aside>
      <main className="flex-1 p-12">
        {children}
      </main>
    </div>
  );
}