"use client";

/**
 * Admin error boundary — shows the REAL error including digest for Vercel logs.
 * The digest links to Vercel Function logs where the exact server error is visible.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, fontFamily: 'monospace', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#dc2626', fontSize: 20, marginBottom: 16 }}>
        ⚠️ Admin Error
      </h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>
          {error.name}: {error.message}
        </p>
        {error.digest && (
          <p style={{ marginTop: 8, fontSize: 14, color: '#991b1b', background: '#fee2e2', padding: '8px 12px', borderRadius: 6 }}>
            🔍 Vercel Error Digest: <strong>{error.digest}</strong>
            <br/>
            <span style={{ fontSize: 12 }}>
              Go to Vercel Dashboard → Deployments → Function Logs → Search for this digest
            </span>
          </p>
        )}
        <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Page URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}
        </p>
      </div>
      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Stack Trace</summary>
        <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 8, background: '#f8f8f8', padding: 12, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          {error.stack || '(no stack trace)'}
        </pre>
      </details>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/en/admin'}
          style={{
            padding: '12px 24px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Hard Refresh
        </button>
      </div>
      <div style={{ marginTop: 32, padding: 16, background: '#f3f4f6', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>🛠 Debug Steps:</p>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Note the <strong>Error Digest</strong> above</li>
          <li>Go to <a href="https://vercel.com/abood-albakaas-projects/skiniq-wellness/logs" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Vercel Logs</a></li>
          <li>Search for the digest to find the actual server error</li>
          <li>Send me the digest or the server error message</li>
        </ol>
      </div>
    </div>
  );
}