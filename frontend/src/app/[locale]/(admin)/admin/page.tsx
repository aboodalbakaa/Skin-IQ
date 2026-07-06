/**
 * Ultra-minimal admin dashboard — pure Server Component.
 * No 'use client', no hooks, no data fetching.
 */
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-slate-400 mt-2">Static shell loaded successfully.</p>
    </div>
  );
}