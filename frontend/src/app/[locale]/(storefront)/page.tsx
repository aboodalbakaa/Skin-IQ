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
