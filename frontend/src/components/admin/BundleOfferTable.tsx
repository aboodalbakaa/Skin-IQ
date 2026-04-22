"use client";

import { useState, useTransition } from 'react';
import { Pencil, Trash2, Eye, EyeOff, Plus, Search, Package, Loader2, AlertTriangle, Flame } from 'lucide-react';
import { deleteBundleOffer, toggleBundleActive } from '@/app/[locale]/(admin)/admin/bundle-offers/actions';
import BundleOfferForm from './BundleOfferForm';
import { useRouter } from 'next/navigation';

export interface BundleOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  bundle_price: number;
  original_price: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

interface BundleOfferTableProps {
  offers: BundleOffer[];
}

export default function BundleOfferTable({ offers }: BundleOfferTableProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<BundleOffer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BundleOffer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IQ', { maximumFractionDigits: 0 }).format(val);
  };

  const filteredOffers = offers.filter(o =>
    o.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.title_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (offer: BundleOffer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDelete = async (offer: BundleOffer) => {
    setDeletingId(offer.id);
    startTransition(async () => {
      await deleteBundleOffer(offer.id, offer.image_url);
      setConfirmDelete(null);
      setDeletingId(null);
      router.refresh();
    });
  };

  const handleToggleActive = (offer: BundleOffer) => {
    startTransition(async () => {
      await toggleBundleActive(offer.id, !offer.is_active);
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-foreground flex items-center gap-3">
            <Flame className="text-red-500 w-8 h-8" />
            Urgent Offers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional bundles shown on the homepage carousel.
          </p>
        </div>
        <button
          onClick={() => { setEditingOffer(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          New Offer
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white dark:bg-[#0D1518] text-slate-900 dark:text-slate-100"
        />
      </div>

      {filteredOffers.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1518] rounded-2xl shadow-sm border border-border p-16 text-center">
          <div className="inline-flex p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-6">
            <Flame className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No offers found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Add bundle offers that will appear on the horizontal scrolling carousel.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0D1518] rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-900 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Offer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundle Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                          {offer.image_url ? (
                            <img src={offer.image_url} alt={offer.title_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{offer.title_en}</h3>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{offer.title_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-500 tabular-nums">
                          {formatCurrency(offer.bundle_price)} IQD
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatCurrency(offer.original_price)} IQD
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(offer)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                          ${offer.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                      >
                        {offer.is_active ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="p-2 text-slate-400 hover:text-primary rounded-lg transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(offer)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" onClick={() => setConfirmDelete(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#0D1518] rounded-2xl shadow-2xl z-[80] p-8 max-w-sm w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Delete Offer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <strong>&ldquo;{confirmDelete.title_en}&rdquo;</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <BundleOfferForm
          offer={editingOffer}
          onClose={() => { setShowForm(false); setEditingOffer(null); }}
          onSuccess={() => { setShowForm(false); setEditingOffer(null); router.refresh(); }}
        />
      )}
    </>
  );
}
