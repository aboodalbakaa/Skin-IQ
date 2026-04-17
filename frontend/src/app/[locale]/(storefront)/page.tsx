import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import ProductGrid from '@/components/store/ProductGrid';
import ProductShowcase from '@/components/store/ProductShowcase';
import CategoryLuxe from '@/components/store/CategoryLuxe';
import { createClient } from '@/utils/supabase/server';
import { ArrowRight } from 'lucide-react';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Index');
  
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(8);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* Premium Hero Section */}
      <section className="relative w-full h-[90vh] flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Aspect: Content */}
        <div className="flex-1 px-6 sm:px-12 lg:px-24 py-12 lg:py-0 flex flex-col justify-center max-w-4xl z-10">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-[10px] font-bold tracking-widest uppercase">
              SkinIQ Boutique
            </span>
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-foreground leading-[1.1]">
              Refining <br />
              <span className="italic font-serif">Self-Care</span> <br />
              Intelligence
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Discover a curated sanctuary of high-performance skincare and holistic wellness, powered by advanced skin intelligence.
            </p>
            <div className="pt-8">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 px-10 py-5 text-sm font-bold tracking-widest uppercase transition-all shadow-xl shadow-primary/20"
                href="/#store"
              >
                {t('shop')}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Aspect: Lifestyle Imagery */}
        <div className="flex-1 w-full lg:h-full relative overflow-hidden">
          <img 
            src="/hero-skincare.png" 
            alt="SkinIQ Luxury Skincare" 
            className="w-full h-full object-cover lg:object-center grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
          />
          {/* Subtle gradient overlay for text legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
        </div>

      </section>

      {/* Luxury Category Selection */}
      <section className="bg-white/50 dark:bg-transparent -mt-8 relative z-20">
        <CategoryLuxe />
      </section>

      {/* Dynamic Product Showcase Section */}
      <section className="relative w-full py-24 overflow-hidden bg-white/30 dark:bg-transparent">
        
        {/* Background Ambient Flow - Luxe Gold Accents */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#9A8C73]/5 blur-[100px] rounded-full animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[100px] rounded-full animate-float-slower" style={{ animationDelay: '-8s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-6 sm:px-12 lg:px-24 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">
                <span className="w-12 h-[1px] bg-current" />
                Selected Highlights
              </div>
              <h2 className="text-4xl sm:text-5xl font-light tracking-tighter text-foreground uppercase leading-none">
                Current <span className="italic">Favorites</span>
              </h2>
              <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                A moving collection of curated formulas for your specific skin intelligence.
              </p>
            </div>
            <Link 
              href="/products" 
              className="group flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-md border border-border rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5"
            >
              View All Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ProductShowcase products={products || []} />
        </div>
      </section>

    </div>
  );
}
