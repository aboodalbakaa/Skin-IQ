'use client';

import { useCallback, useEffect, useState } from 'react';
import OrderManagement, { type Order } from '@/components/admin/OrderManagement';
import { postAdminJson } from '@/utils/admin-api';

export const dynamic = 'force-dynamic';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [initialQuery, setInitialQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedOrders = await postAdminJson<Order[]>('getAllOrders');
      setInitialQuery(new URLSearchParams(window.location.search).get('query') || '');
      setOrders(loadedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10 lg:flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-foreground uppercase tracking-tight">Orders & <span className="italic">Revenue</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Monitor every transaction, track delivery locations, and reach out to customers.</p>
        </div>
        <div className="mt-4 lg:mt-0 text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
          Live Transaction Feed
        </div>
      </div>

      {loading && (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading orders</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <OrderManagement initialOrders={orders} initialQuery={initialQuery} />
      )}
    </div>
  );
}
