"use client";

import { useState, useTransition } from 'react';
import { X, Upload, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { createBundleOffer, updateBundleOffer } from '@/app/[locale]/(admin)/admin/bundle-offers/actions';
import type { BundleOffer } from './BundleOfferTable';

interface BundleOfferFormProps {
  offer: BundleOffer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BundleOfferForm({ offer, onClose, onSuccess }: BundleOfferFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(offer?.image_url || null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (offer) {
      formData.append('id', offer.id);
      formData.append('existing_image_url', offer.image_url);
    }

    startTransition(async () => {
      const result = offer 
        ? await updateBundleOffer(formData)
        : await createBundleOffer(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D1518] rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {offer ? 'Edit Bundle Offer' : 'New Bundle Offer'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure your promotional bundle details.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Image Upload Area */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Promo Image (Social Media Design)
              </label>
              <div className="relative group aspect-[16/9] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary transition-all overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl">
                        Change Image
                        <input type="file" name="image" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-3">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Design</span>
                    <input type="file" name="image" className="hidden" accept="image/*" required={!offer} onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Titles */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Title (English)</label>
              <input name="title_en" defaultValue={offer?.title_en || ''} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Eucerin Special Offer" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">العنوان (عربي)</label>
              <input name="title_ar" defaultValue={offer?.title_ar || ''} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-right" dir="rtl" placeholder="عرض خاص من يوسرين" />
            </div>

            {/* Descriptions */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description (English)</label>
              <textarea name="description_en" defaultValue={offer?.description_en || ''} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-24 focus:outline-none" placeholder="Bundle includes 4 essential products..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">الوصف (عربي)</label>
              <textarea name="description_ar" defaultValue={offer?.description_ar || ''} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-24 focus:outline-none text-right" dir="rtl" placeholder="العرض يشمل 4 منتجات أساسية..." />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bundle Price (IQD)</label>
              <input type="number" name="bundle_price" defaultValue={offer?.bundle_price || ''} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm" placeholder="93000" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Original Price (IQD)</label>
              <input type="number" name="original_price" defaultValue={offer?.original_price || ''} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm" placeholder="110000" />
            </div>

            {/* Options */}
            <div className="flex items-center gap-6 md:col-span-2 py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="is_active" value="true" defaultChecked={offer ? offer.is_active : true} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Visible on Website</span>
              </label>
              
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sort Order</label>
                <input type="number" name="sort_order" defaultValue={offer?.sort_order || 0} className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {error && <div className="mt-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

          <div className="mt-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-[2] py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {offer ? 'Update Offer' : 'Create Offer'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
