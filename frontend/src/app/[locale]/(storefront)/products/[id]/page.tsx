import { createClient } from '@/utils/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/store/ProductGrid';
import { ShoppingBag, Star, ChevronRight, Play, Info, BookOpen, Package } from 'lucide-react';
import { Link } from '@/i18n/routing';
import CartButtonDetails from '@/components/store/CartButtonDetails';

interface Product {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  images?: string[];
  video_url?: string;
  specs?: string;
  how_to_use?: string;
  category?: string;
  is_out_of_stock?: boolean;
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Products');
  const tc = await getTranslations('Common');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole = 'GUEST';
  if (user) {
    const { data: userData } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = userData?.role || 'CUSTOMER';
  }

  const isWholesale = userRole === 'WHOLESALE';

  // Fetch main product
  const { data: rawProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!rawProduct) {
    notFound();
  }

  const product = rawProduct as Product;

  // Fetch related products (same category, limit 4)
  const { data: rawRelated } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', product.category || '')
    .neq('id', id)
    .limit(4);

  const relatedProducts = (rawRelated as Product[]) || [];

  const displayImages = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const specsList = product.specs ? product.specs.split('\n').filter((s: string) => s.trim()) : [];

  const finalPrice = isWholesale 
    ? (product.discount_wholesale_price || product.wholesale_price)
    : (product.discount_retail_price || product.retail_price);
  
  const originalPrice = isWholesale ? product.wholesale_price : product.retail_price;
  const hasDiscount = isWholesale ? !!product.discount_wholesale_price : !!product.discount_retail_price;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 sm:mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery Section */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-border bg-muted group">
              <img 
                src={displayImages[0]} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              {product.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                   <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-2xl animate-pulse">
                      <Play className="fill-current w-8 h-8 ml-1" />
                   </div>
                </div>
              )}
            </div>

            {/* Thumbnails / "Flick through" affordance */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {displayImages.map((img: string, i: number) => (
                  <div key={i} className="flex-shrink-0 w-20 h-20 rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors">
                    <img src={img} alt={`${product.name} detail ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
              <Package className="w-3 h-3" />
              {t('gallery_swipe')}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col">
            <div className="space-y-6">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                <span className="text-xs font-bold text-slate-400 ml-2">(4.9/5 Based on Customer Feedback)</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {isWholesale ? 'Wholesale Partner Price' : 'Retail Price'}
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl sm:text-6xl font-black text-primary tracking-tighter tabular-nums">
                    {finalPrice.toLocaleString()}
                    <span className="text-sm ml-2 font-bold opacity-60 uppercase tracking-widest">{tc('iqd')}</span>
                  </span>
                  {isWholesale ? (
                    <span className="text-xl font-medium text-slate-300 line-through">
                      {product.retail_price.toLocaleString()} {tc('iqd')}
                    </span>
                  ) : product.discount_retail_price && (
                    <span className="text-xl font-medium text-slate-300 line-through">
                      {product.retail_price.toLocaleString()}
                    </span>
                  )}
                </div>
                {isWholesale && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full self-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Partner Exclusive Rate</span>
                  </div>
                )}
              </div>

              <div className="py-6 border-y border-border">
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic font-serif">
                  {product.description || "A curated formula designed for optimal skin health."}
                </p>
              </div>

              {/* Add to Cart - Large Premium Button */}
              <div className="pt-6">
                {product.is_out_of_stock ? (
                  <div className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 text-xs font-black uppercase tracking-[0.3em] cursor-not-allowed">
                    Out of Stock
                  </div>
                ) : (
                  <CartButtonDetails product={product as any} isWholesale={isWholesale} />
                )}
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                 <div className="p-4 rounded-2xl flex items-center gap-3" style={{
                   backgroundColor: product.is_out_of_stock ? 'rgb(255 251 235 / 1)' : 'rgb(236 253 245 / 1)',
                   borderWidth: '1px',
                   borderColor: product.is_out_of_stock ? 'rgb(254 243 199 / 1)' : 'rgb(209 250 229 / 1)',
                 }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${product.is_out_of_stock ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                       <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                       <p className={`text-[10px] font-black uppercase tracking-widest ${product.is_out_of_stock ? 'text-amber-600' : 'text-emerald-600'}`}>
                         {product.is_out_of_stock ? 'Sold Out' : 'Available'}
                       </p>
                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                         {product.is_out_of_stock ? 'Currently Unavailable' : 'In Stock Now'}
                       </p>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                       <Star className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Verified</p>
                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Medical Grade</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections (Specs & How to Use) */}
        <div className="mt-24 sm:mt-32 border-t border-border pt-24 sm:pt-32 space-y-24 sm:space-y-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <Info className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl font-light uppercase tracking-tighter text-slate-900 dark:text-white">
                      Technical <span className="italic">Specs</span>
                   </h2>
                </div>
                {specsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    {specsList.map((spec: string, i: number) => {
                      const [label, value] = spec.split(':');
                      return (
                        <div key={i} className="group pb-4 border-b border-border/50 hover:border-primary transition-colors">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{label || 'Specification'}</p>
                           <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{value || label}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No specific technical data entered for this item.</p>
                )}
             </div>

             <div className="space-y-8 p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-secondary text-primary rounded-2xl">
                      <BookOpen className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl font-light uppercase tracking-tighter text-slate-900 dark:text-white">
                      How to <span className="italic">Use</span>
                   </h2>
                </div>
                <div className="relative z-10 space-y-6">
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                     {product.how_to_use || "Follow standard skincare application guidelines or consult your healthcare provider."}
                   </p>
                </div>
             </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="space-y-16">
              <div className="text-center space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary opacity-60">Cross-Skin Selection</p>
                 <h2 className="text-4xl sm:text-6xl font-light tracking-tighter text-slate-900 dark:text-white uppercase">
                    You Might Also <span className="italic text-primary font-serif">Like</span>
                 </h2>
              </div>
              <ProductGrid products={relatedProducts as any} userRole={userRole} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
