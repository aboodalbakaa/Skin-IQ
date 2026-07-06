"use client";

/**
 * Admin error boundary — shows the REAL error on screen so we can debug.
 * No custom messages, just the raw error.
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
        Admin Error
      </h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>{error.name}</p>
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>{error.message}</p>
        {error.digest && (
          <p style={{ marginTop: 8, fontSize: 11, color: '#666' }}>Digest: {error.digest}</p>
        )}
      </div>
      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Stack Trace</summary>
        <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 8, background: '#f8f8f8', padding: 12, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          {error.stack || '(no stack trace)'}
        </pre>
      </details>
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
    </div>
  );
}