import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import FilterableShowcase from '@/components/store/FilterableShowcase';
import BundleOffersCarousel from '@/components/store/BundleOffersCarousel';
import { createClient } from '@/utils/supabase/server';
import { ArrowRight } from 'lucide-react';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Index');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(20);

  const { data: bundleOffers } = await supabase
    .from('bundle_offers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const { data: heroData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_config')
    .single();

  return <StorefrontClient heroData={heroData} products={products} bundleOffers={bundleOffers} locale={locale} />;
}

function StorefrontClient({ heroData, products, bundleOffers, locale }: any) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroConfig = heroData?.value || {
    title: "Elevate <br /> Your Daily <br /> <span class=\"italic font-serif text-accent\">Skin Ritual</span>",
    subtitle: "Step into a world of curated excellence where pure ingredients meet high-performance results for a glow that's uniquely yours.",
    image_url: "/hero-skincare.png",
    button_text: "Shop the Collection",
    button_link: "/#store",
    badge_text: "Boutique Experience"
  };

  const titleLines = (heroConfig.title || '').split('<br />');

  const allCategories = (products || [])
    .map(p => p.category)
    .filter((cat): cat is string => !!cat && cat.trim() !== '');
  const uniqueCategories = [...new Set(allCategories)];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* Premium Hero Section */}
      <section className="relative w-full min-h-[95vh] flex flex-col lg:flex-row items-stretch justify-between overflow-hidden">
        
        {/* Dynamic Background Elements with Parallax */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-mesh"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          
          {/* Floating Logo Marks */}
          <div 
            className="absolute top-[20%] left-[10%] opacity-[0.03] dark:opacity-[0.07] animate-float-logo"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
             <h1 className="text-[15rem] sm:text-[20rem] font-black tracking-tighter">IQ</h1>
          </div>
          <div 
            className="absolute bottom-[10%] right-[30%] opacity-[0.02] dark:opacity-[0.05] animate-float-logo" 
            style={{ animationDelay: '-4s', transform: `translateY(${scrollY * 0.15}px)` }}
          >
             <h1 className="text-[10rem] sm:text-[15rem] font-black tracking-tighter italic text-accent">SKIN</h1>
          </div>

          {/* Animated Gradients */}
          <div 
            className="absolute top-1/4 -right-20 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          />
        </div>

        {/* Left Aspect: Content */}
        <div className="flex-1 px-6 sm:px-12 lg:px-24 pt-32 pb-12 lg:py-0 flex flex-col justify-center max-w-4xl z-10">
          <div className="space-y-8" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
            <div className="overflow-hidden">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-[10px] font-black tracking-[0.3em] uppercase animate-text-reveal">
                {heroConfig.badge_text}
              </span>
            </div>

            <div className="space-y-2">
              {titleLines.map((line: string, i: number) => (
                <div key={i} className="overflow-hidden">
                  <h1 
                    className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight text-foreground leading-[0.95] animate-text-reveal uppercase pr-4"
                    style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </div>
              ))}
            </div>

            <div className="overflow-hidden">
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-md animate-text-reveal" style={{ animationDelay: '0.5s' }}>
                {heroConfig.subtitle}
              </p>
            </div>

            <div className="pt-8 overflow-hidden">
              <div className="animate-text-reveal" style={{ animationDelay: '0.6s' }}>
                <Link
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground px-10 sm:px-12 py-5 sm:py-6 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
                  href={heroConfig.button_link || "/#store"}
                >
                  <span className="relative z-10">{heroConfig.button_text}</span>
                  <div className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aspect: Lifestyle Imagery */}
        <div className="flex-1 w-full relative overflow-hidden min-h-[60vh] lg:min-h-0 z-10">
          <img 
            src={heroConfig.image_url || "/hero-skincare.png"} 
            alt="SkinIQ Luxury Skincare" 
            className="w-full h-full object-cover lg:object-center grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 scale-105"
            style={{ transform: `scale(${1.05 + scrollY * 0.0001}) translateY(${scrollY * 0.05}px)` }}
          />
          {/* Refined gradient overlay for text legibility - much more subtle at the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/40 to-transparent lg:hidden" />
        </div>

      </section>

      {/* 🔥 Bundle Offers Carousel */}
      {bundleOffers && bundleOffers.length > 0 && (
        <section className="relative w-full py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-red-50/40 via-white/60 to-white dark:from-red-950/10 dark:via-transparent dark:to-transparent">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10">
            <BundleOffersCarousel offers={bundleOffers} locale={locale} />
          </div>
        </section>
      )}

      {/* Dynamic Product Showcase Section with Category Filter */}
      <section className="relative w-full py-24 overflow-hidden bg-white/30 dark:bg-transparent">
        
        {/* Background Ambient Flow - Luxe Gold Accents */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#9A8C73]/5 blur-[100px] rounded-full animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[100px] rounded-full animate-float-slower" style={{ animationDelay: '-8s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 px-6 sm:px-12 lg:px-24 gap-6">
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

          <FilterableShowcase products={products || []} categories={uniqueCategories} userRole={userRole} />
        </div>
      </section>

    </div>
  );
}
