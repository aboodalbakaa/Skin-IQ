'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface CheckoutPayload {
  contact_name: string;
  contact_phone: string;
  address: string;
  google_maps_link?: string;
  promo_code?: string | null;
  discount_amount?: number;
  total_amount: number;
  items: { id: string; quantity: number; price: number }[];
}

export async function submitSpotOrder({ 
  contact_name, 
  contact_phone, 
  address,
  google_maps_link,
  promo_code,
  discount_amount,
  total_amount, 
  items 
}: CheckoutPayload) {
  // Use the admin client for guests to ensure we can verify the inserted ID
  // regardless of RLS visibility on the anonymous session
  const supabase = createAdminClient();
  
  // Try to get user_id if they are logged in (using regular client for the auth check)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  
  // CRITICAL: Ensure userId is either a valid UUID or NULL. 
  // Never allow the string "undefined" to reach the database.
  const userId = (user && user.id && user.id !== 'undefined') ? user.id : null;

  // 1. Create the Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      contact_name,
      contact_phone,
      address,
      google_maps_link,
      promo_code,
      discount_amount: discount_amount || 0,
      total_amount,
      status: 'PENDING'
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { error: "Failed to create order. Please try again." };
  }

  // 2. Create Order Items
  const orderItemsData = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { error: "Failed to add items to order." };
  }

  return { success: true, orderId: order.id };
}
