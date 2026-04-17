import { createClient } from '@/utils/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductGrid from '@/components/store/ProductGrid';
import { Sparkles } from 'lucide-react';

export default async function ProductsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Index');
  
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles className="w-4 h-4" />
            Full Collection
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-foreground uppercase">
            Curated <span className="italic">Excellence</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Explore our complete sanctuary of high-performance skincare and holistic essentials. Every product is selected for uncompromising quality.
          </p>
        </div>

        {/* Catalog */}
        <div className="pt-8">
           <ProductGrid products={products || []} />
        </div>

      </div>

      {/* Aesthetic Background Accents */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full" />
      </div>
    </div>
  );
}
