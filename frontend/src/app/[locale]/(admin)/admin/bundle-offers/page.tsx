'use client';

import { useCallback, useEffect, useState } from 'react';
import BundleOfferTable, { type BundleOffer } from '@/components/admin/BundleOfferTable';
import { postAdminJson } from '@/utils/admin-api';

export const dynamic = 'force-dynamic';

export default function AdminBundleOffers() {
  const [offers, setOffers] = useState<BundleOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOffers(await postAdminJson<BundleOffer[]>('getBundleOffers'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundle offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading bundle offers</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={loadOffers}
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
      <BundleOfferTable offers={offers} onOffersChanged={loadOffers} />
    </div>
  );
}
