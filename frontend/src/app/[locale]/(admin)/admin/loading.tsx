export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-72 bg-primary text-primary-foreground border-r border-white/10 flex flex-col">
        <div className="h-24 flex items-center px-8 border-b border-white/10">
          <div className="font-bold text-2xl tracking-[0.2em] text-primary-foreground uppercase">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </div>
        </div>
        <nav className="flex-1 py-10 px-6 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}