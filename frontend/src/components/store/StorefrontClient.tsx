"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import FilterableShowcase from '@/components/store/FilterableShowcase';
import BundleOffersCarousel from '@/components/store/BundleOffersCarousel';
import { ArrowRight } from 'lucide-react';

export default function StorefrontClient({ 
  heroData, 
  products, 
  bundleOffers, 
  locale,
  userRole 
}: { 
  heroData: any; 
  products: any[]; 
  bundleOffers: any[]; 
  locale: string;
  userRole: string;
}) {
  const [scrollY, setScrollY] = useState(0);
  const t = useTranslations('Navbar');
  const t_consult = useTranslations('Consultation');
  const t_index = useTranslations('Index');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroConfig = heroData?.value || {
    title: "Elevate <br /> Your Daily <br /> <span class=\"italic font-serif text-accent\">Skin Ritual</span>",
    subtitle: "Step into a world of curated excellence where pure ingredients meet high-performance results for a glow that's uniquely yours.",
    bg_image_url: "/hero-skincare.png",
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
      
      {/* Premium Hero Section - Full Width Centered Cinematic Experience */}
      <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Dynamic Background Elements with Parallax */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-mesh"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />

          {/* Admin Managed Background Image Overlay (Main Visual Anchor) */}
          {heroConfig.bg_image_url && (
            <div 
              className="absolute inset-0 opacity-[0.35] dark:opacity-[0.45] transition-opacity duration-1000 grayscale-[0.3]"
              style={{ 
                backgroundImage: `url(${heroConfig.bg_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `translateY(${scrollY * 0.08}px) scale(${1.05 + scrollY * 0.0001})`
              }}
            />
          )}

          {/* Depth Overlays for Content Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background z-[1]" />
          <div className="absolute inset-0 bg-black/5 z-[1]" />
          
          {/* Atmospheric Ambient Light */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1000px] h-[600px] sm:h-[1000px] bg-accent/10 blur-[180px] rounded-full animate-pulse pointer-events-none"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          />
        </div>

        {/* Centered Cinematic Content */}
        <div className="relative z-10 px-6 sm:px-12 flex flex-col items-center max-w-7xl pb-32">
          <div className="space-y-12" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
            <div className="overflow-hidden">
              <span className="inline-block px-6 py-2 rounded-full bg-secondary/80 backdrop-blur-md text-primary text-[10px] font-black tracking-[0.4em] uppercase animate-text-reveal shadow-lg">
                {heroConfig.badge_text}
              </span>
            </div>

            <div className="space-y-6">
              {titleLines.map((line: string, i: number) => (
                <div key={i} className="py-2">
                  <h1 
                    className={`
                      ${locale === 'ar' ? 'text-4xl sm:text-6xl lg:text-7xl xl:text-8xl' : 'text-6xl sm:text-8xl lg:text-[11rem]'}
                      font-light tracking-tight text-foreground leading-[1.1] sm:leading-[0.9] animate-text-reveal uppercase px-4 pb-4
                    `}
                    style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </div>
              ))}
            </div>

            <div className="overflow-hidden flex justify-center px-4">
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl animate-text-reveal font-medium" style={{ animationDelay: '0.6s' }}>
                {heroConfig.subtitle}
              </p>
            </div>

            <div className="pt-12 overflow-hidden flex justify-center">
              <div className="animate-text-reveal" style={{ animationDelay: '0.7s' }}>
                <Link
                  className={`
                    group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground 
                    ${locale === 'ar' ? 'px-12 py-6 sm:px-16 sm:py-8 text-sm' : 'px-14 py-7 sm:px-20 sm:py-10 text-[10px] sm:text-xs'}
                    font-black tracking-[0.3em] uppercase transition-all hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(var(--primary),0.2)]
                  `}
                  href={heroConfig.button_link || "/#store"}
                >
                  <span className="relative z-10">{heroConfig.button_text}</span>
                  <div className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </div>
            </div>
          </div>
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


      {/* 🩺 Medical Consultation CTA Section */}
      <section className="relative w-full py-24 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30 dark:bg-primary/5 -skew-y-2 origin-right transform scale-110 -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
          <div className="glass p-12 sm:p-20 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden group">
            {/* Decorative background circle */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/10 blur-[100px] rounded-full group-hover:bg-accent/20 transition-colors duration-700" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl space-y-8 text-center md:text-left">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-[0.4em] uppercase mx-auto md:mx-0">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  {t_consult('badge')}
                </div>
                
                <h2 
                  className={`
                    ${locale === 'ar' ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl'}
                    font-light tracking-tighter text-foreground uppercase leading-[1.1]
                  `}
                  dangerouslySetInnerHTML={{ __html: t_consult('title') }}
                />
                
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                  {t_consult('subtitle')}
                </p>
              </div>

              <div className="shrink-0">
                <a 
                  href="https://dr-daniya.vercel.app/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground 
                    ${locale === 'ar' ? 'px-10 py-5 text-sm' : 'px-12 py-7 text-[10px]'}
                    font-black tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/5
                  `}
                >
                  <span className="relative z-10 font-black">{t_consult('button')}</span>
                  <div className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Product Showcase Section with Category Filter */}
      <section id="store" className="relative w-full py-24 overflow-hidden bg-white/30 dark:bg-transparent">
        
        {/* Background Ambient Flow - Luxe Gold Accents */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#9A8C73]/5 blur-[100px] rounded-full animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[100px] rounded-full animate-float-slower" style={{ animationDelay: '-8s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 px-6 sm:px-12 lg:px-24 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] rtl:text-xs font-black uppercase tracking-[0.4em] text-primary opacity-60">
                <span className="w-12 h-[1px] bg-current" />
                {t_index('highlights')}
              </div>
              <h2 className={`text-4xl sm:text-5xl ${locale === 'ar' ? 'text-3xl sm:text-4xl' : ''} font-light tracking-tighter text-foreground uppercase leading-none`}>
                {t_index('current')}
                <span className="italic">{t_index('favorites')}</span>
              </h2>
              <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                A moving collection of curated formulas for your specific skin intelligence.
              </p>
            </div>
            <Link 
              href="/products" 
              className={`group flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-md border border-border rounded-2xl ${locale === 'ar' ? 'text-sm' : 'text-xs'} font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5`}
            >
              {t_index('view_all')}
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <FilterableShowcase products={products || []} categories={uniqueCategories} userRole={userRole} />
        </div>
      </section>

    </div>
  );
}
