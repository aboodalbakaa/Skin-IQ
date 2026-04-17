import { createClient } from '@/utils/supabase/server';
import ProductTable from '@/components/admin/ProductTable';

export default async function AdminProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm mt-1 opacity-75">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <ProductTable products={products || []} />
    </div>
  );
}
