import {getTranslations, setRequestLocale} from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import StorefrontClient from '@/components/store/StorefrontClient';

export const dynamic = 'force-dynamic';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
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

  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, retail_price, wholesale_price, discount_retail_price, discount_wholesale_price, image_url, images, video_url, specs, how_to_use, category, is_active, is_out_of_stock, created_at, title_en, description_en, category_en')
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

  return (
    <StorefrontClient 
      heroData={heroData} 
      products={products || []} 
      bundleOffers={bundleOffers || []} 
      locale={locale}
      userRole={userRole}
    />
  );
}
