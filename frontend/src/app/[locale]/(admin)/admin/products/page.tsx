'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductTable from '@/components/admin/ProductTable';
import { postAdminJson } from '@/utils/admin-api';

export const dynamic = 'force-dynamic';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postAdminJson<any[]>('getAllProducts');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <ProductTable products={products || []} onProductsChanged={loadProducts} />
    </div>
  );
}
