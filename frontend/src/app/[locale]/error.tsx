"use client";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('LOCALE LEVEL ERROR:', error);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ fontFamily: 'system-ui, sans-serif', background: '#f8f9fa' }}>
      <div className="max-w-lg text-center">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#dc2626', marginBottom: 12 }}>Locale-level Error</h1>
        <p style={{ color: '#64748b', marginBottom: 20 }}>
          An unexpected error occurred in the locale layout.
        </p>
        <details style={{ textAlign: 'left', background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'auto', maxHeight: 200 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 500, fontSize: 14, color: '#64748b' }}>Error details</summary>
          <pre style={{ marginTop: 8, fontSize: 12, color: '#dc2626', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.name}: {error.message}
            {'\n\n'}
            {error.stack || '(no stack trace)'}
          </pre>
          {error.digest && <p style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>Digest: {error.digest}</p>}
        </details>
        <button
          onClick={reset}
          style={{ padding: '12px 24px', background: '#2563eb', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}