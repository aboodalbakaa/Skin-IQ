"use client";

import { useState, useRef, useTransition } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createProduct, updateProduct } from '@/app/[locale]/(admin)/admin/products/actions';

export interface Product {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  is_active: boolean;
  image_url?: string;
  images?: string[];
  video_url?: string;
  specs?: string;
  how_to_use?: string;
  category?: string;
  created_at?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const isEditing = !!product;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Attach the file explicitly (drag & drop doesn't populate the input)
    if (selectedFile) {
      formData.set('image', selectedFile);
    }

    // Attach existing image URL for updates
    if (isEditing && product?.image_url) {
      formData.set('existing_image_url', product.image_url);
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(formData)
        : await createProduct(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-[#0D1518] shadow-2xl z-[100] overflow-y-auto animate-slide-in transition-colors text-slate-900 dark:text-slate-100 pb-10">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#0D1518]/95 backdrop-blur-md border-b border-border px-6 py-5 flex items-center justify-between z-10 transition-colors">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing ? 'Update product details below' : 'Fill in the details to add a product to your store'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hidden ID for edit mode */}
          {isEditing && <input type="hidden" name="id" value={product.id} />}

          {/* Image Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product Image</label>
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
                ${dragActive ? 'border-primary bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}
                ${previewUrl ? 'aspect-[16/10]' : 'aspect-[16/10]'}
              `}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drop image here or click to browse</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, WebP — max 5MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              required
              defaultValue={product?.name || ''}
              placeholder="e.g., Vitamin C Brightening Serum"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              rows={3}
              defaultValue={product?.description || ''}
              placeholder="Brief product description..."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <input
                id="product-category"
                name="category"
                type="text"
                defaultValue={product?.category || ''}
                placeholder="e.g., Serums"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            {/* Video URL */}
            <div>
              <label htmlFor="video-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Video URL (YouTube/Vimeo)
              </label>
              <input
                id="video-url"
                name="video_url"
                type="text"
                defaultValue={product?.video_url || ''}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <label htmlFor="product-specs" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Specifications (One per line)
            </label>
            <textarea
              id="product-specs"
              name="specs"
              rows={3}
              defaultValue={product?.specs || ''}
              placeholder="pH: 5.5&#10;Size: 30ml&#10;Skin Type: All"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none font-mono"
            />
          </div>

          {/* How to Use */}
          <div>
            <label htmlFor="how-to-use" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              How to Use
            </label>
            <textarea
              id="how-to-use"
              name="how_to_use"
              rows={3}
              defaultValue={product?.how_to_use || ''}
              placeholder="Apply 2-3 drops to clean skin..."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="retail-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Retail Price (IQD) <span className="text-red-500">*</span>
              </label>
              <input
                id="retail-price"
                name="retail_price"
                type="number"
                required
                min="0"
                step="any"
                defaultValue={product?.retail_price || ''}
                placeholder="25000"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label htmlFor="wholesale-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Wholesale Price (IQD) <span className="text-red-500">*</span>
              </label>
              <input
                id="wholesale-price"
                name="wholesale_price"
                type="number"
                required
                min="0"
                step="any"
                defaultValue={product?.wholesale_price || ''}
                placeholder="18000"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label htmlFor="discount-retail-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Discount Retail Price (IQD)
              </label>
              <input
                id="discount-retail-price"
                name="discount_retail_price"
                type="number"
                min="0"
                step="any"
                defaultValue={product?.discount_retail_price || ''}
                placeholder="Optional promo price"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label htmlFor="discount-wholesale-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Discount Wholesale Price (IQD)
              </label>
              <input
                id="discount-wholesale-price"
                name="discount_wholesale_price"
                type="number"
                min="0"
                step="any"
                defaultValue={product?.discount_wholesale_price || ''}
                placeholder="Optional promo price"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Active on Store</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Visible to customers when active</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active_checkbox"
                defaultChecked={product?.is_active !== false}
                className="sr-only peer"
                onChange={(e) => {
                  const hidden = e.target.form?.querySelector('input[name="is_active"]') as HTMLInputElement;
                  if (hidden) hidden.value = e.target.checked ? 'true' : 'false';
                }}
              />
              <input type="hidden" name="is_active" defaultValue={product?.is_active !== false ? 'true' : 'false'} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
