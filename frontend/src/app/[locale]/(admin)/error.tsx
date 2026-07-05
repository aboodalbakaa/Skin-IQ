"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Admin page crashed:', error);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred in the admin panel.
        </p>
        <details className="text-left bg-white dark:bg-[#0D1518] p-4 rounded-xl border border-border mb-6 overflow-auto max-h-48">
          <summary className="cursor-pointer font-medium text-sm text-slate-500">Error details</summary>
          <pre className="mt-2 text-xs text-red-500 font-mono whitespace-pre-wrap break-all">
            {error.name}: {error.message}
            {'\n\n'}
            {error.stack || '(no stack trace)'}
          </pre>
          {error.digest && (
            <p className="mt-2 text-xs text-slate-400">Digest: {error.digest}</p>
          )}
        </details>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Go to Admin
          </button>
        </div>
      </div>
    </div>
  );
}