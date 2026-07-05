import { createAdminClient } from '@/utils/supabase/admin';
import BundleOfferTable from '@/components/admin/BundleOfferTable';

export default async function AdminBundleOffers() {
  const supabase = createAdminClient();

  const { data: offers, error } = await supabase
    .from('bundle_offers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          <p className="font-medium">Error loading bundle offers</p>
          <p className="text-sm mt-1 opacity-75">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <BundleOfferTable offers={offers || []} />
    </div>
  );
}
