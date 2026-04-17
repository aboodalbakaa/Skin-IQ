"use client";

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useState, useTransition } from 'react';
import { submitSpotOrder } from './actions';
import { Loader2, CheckCircle2, ChevronRight, ShoppingBag, MapPin, Ticket, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'percentage' | 'fixed' | null>(null);
  const [promoValue, setPromoValue] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const discountAmount = promoType === 'percentage' 
    ? (cartTotal * promoValue) / 100 
    : promoType === 'fixed' 
      ? promoValue 
      : 0;
      
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        setGoogleMapsLink(link);
        setLocationLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please check permissions.");
        setLocationLoading(false);
      }
    );
  };

  const handleVerifyPromo = async () => {
    if (!promoCode) return;
    setIsVerifying(true);
    setPromoError(null);
    
    try {
      const supabase = createClient();
      const { data, error: pgError } = await supabase
        .from('promo_codes')
        .select('discount_type, discount_value')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (pgError || !data) {
        setPromoError("Invalid or expired promo code");
        setPromoType(null);
        setPromoValue(0);
      } else {
        setPromoType(data.discount_type);
        setPromoValue(Number(data.discount_value));
        setPromoError(null);
      }
    } catch (err) {
      setPromoError("Error verifying code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    const formData = new FormData(e.currentTarget);
    const contact_name = formData.get('contact_name') as string;
    const contact_phone = formData.get('contact_phone') as string;
    const address = formData.get('address') as string;

    setError(null);
    startTransition(async () => {
      const result = await submitSpotOrder({
        contact_name,
        contact_phone,
        address,
        google_maps_link: googleMapsLink,
        promo_code: promoType ? promoCode.toUpperCase() : null,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        items: items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price }))
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        if (result.orderId) setOrderId(result.orderId);
        clearCart();
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen py-24 px-4 bg-background flex items-center justify-center">
        <div className="bg-white dark:bg-[#0D1518] rounded-3xl shadow-xl border border-border p-8 md:p-12 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Order Received!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for your spot order. Your order ID is <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">{orderId}</span>. 
            Our team will contact you shortly to confirm delivery.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-3.5 bg-primary text-white rounded-xl font-medium transition-all hover:opacity-90">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Redirect or empty state if cart empty
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen py-24 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white dark:bg-[#0D1518] rounded-2xl shadow-sm border border-border p-12">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6">You need to add items to your cart before checking out.</p>
            <Link href="/#store" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium transition-colors hover:opacity-90">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#0D1518] rounded-3xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Contact Details</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                  {error}
                </div>
              )}

              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      name="contact_name" 
                      type="text" 
                      placeholder="e.g. Sara Ahmed"
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      name="contact_phone" 
                      type="tel" 
                      placeholder="+964 780 000 0000"
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Address <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      name="address" 
                      rows={3}
                      placeholder="Street, Building, Apartment number, Landmark..."
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 resize-none" 
                    />
                  </div>
                </div>

                <div className="pt-4">
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Google Maps Location</p>
                   {googleMapsLink ? (
                     <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium truncate">
                           <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                           Location Captured Successfully
                        </div>
                        <button type="button" onClick={() => setGoogleMapsLink('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-full transition-colors">
                           <X className="w-4 h-4 text-emerald-600" />
                        </button>
                     </div>
                   ) : (
                    <button 
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium w-full justify-center"
                    >
                      {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      {locationLoading ? "Fetching..." : "Share My Accurate Location for Delivery"}
                    </button>
                   )}
                   <p className="text-[10px] text-slate-400 mt-2 italic px-1">Highly recommended for faster delivery in residential areas.</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button 
                    disabled={isPending}
                    type="submit" 
                    className="flex w-full items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Place Order (IQD ${finalTotal.toLocaleString()})`}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">
                    By placing this order, you agree to allow us to contact you regarding fulfillment.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-border p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      IQD {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-slate-200 font-medium">Subtotal</span>
                  <span className="text-foreground dark:text-slate-100 font-bold">IQD {cartTotal.toLocaleString()}</span>
                </div>
                
                {/* Promo Code Input */}
                <div className="py-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="PROMO CODE"
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold tracking-widest focus:outline-none focus:border-primary uppercase transition-all"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleVerifyPromo}
                      disabled={isVerifying || !promoCode}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-500 mt-1 font-medium">{promoError}</p>}
                  {promoType && <p className="text-[10px] text-emerald-500 mt-1 font-bold tracking-wider">
                     {promoType === 'percentage' ? `SAVED ${promoValue}% SUCCESSFULLY!` : `SAVED ${promoValue.toLocaleString()} IQD SUCCESSFULLY!`}
                  </p>}
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount ({promoType === 'percentage' ? `${promoValue}%` : 'Fixed'})</span>
                    <span>- IQD {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-slate-200 font-medium">Delivery</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs uppercase text-muted-foreground dark:text-slate-300 font-bold tracking-tighter">Estimated Total</span>
                  <span className="text-3xl font-bold text-primary dark:text-accent">
                    {finalTotal.toLocaleString()} <span className="text-xs">IQD</span>
                  </span>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
