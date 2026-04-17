"use client";

import { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Search, 
  X, 
  ExternalLink,
  ShoppingBag,
  Ticket
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  google_maps_link: string | null;
  promo_code: string | null;
  discount_amount: number;
  app_users: {
    full_name: string | null;
    business_name: string | null;
    phone_number: string | null;
  } | null;
  order_items: OrderItem[];
}

interface OrderManagementProps {
  initialOrders: Order[];
}

export default function OrderManagement({ initialOrders }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = initialOrders.filter(order => {
    const name = order.app_users?.full_name || order.contact_name || '';
    const phone = order.app_users?.phone_number || order.contact_phone || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || phone.toLowerCase().includes(query) || order.id.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200';
      case 'DEBT': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200';
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      finalPhone = `964${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith('964') && cleanPhone.length === 10) {
       finalPhone = `964${cleanPhone}`;
    }
    window.open(`https://wa.me/${finalPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by customer name, phone or order ID..." 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0D1518] border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#0D1518] rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer / Partner</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {order.app_users?.full_name || order.contact_name || 'Guest Customer'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.app_users?.business_name || order.contact_phone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 italic">
                      IQD {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                        {order.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> :
                         order.status === 'DEBT' ? <AlertCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic text-sm">No orders matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0D1518] shadow-2xl z-[110] overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-[#0D1518]/95 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Order Details</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">ID: {selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Customer Info Card */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Package className="w-24 h-24" />
                </div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Customer Info</h3>
                <div className="space-y-4 relative z-10">
                  <div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedOrder.app_users?.full_name || selectedOrder.contact_name}
                    </div>
                    {selectedOrder.app_users?.business_name && (
                      <div className="text-sm text-accent font-bold">{selectedOrder.app_users.business_name}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => openWhatsApp(selectedOrder.app_users?.phone_number || selectedOrder.contact_phone)}
                      className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-xs"
                    >
                      <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted border border-border text-foreground rounded-2xl text-xs font-bold">
                      <Phone className="w-4 h-4 text-slate-400" /> {selectedOrder.app_users?.phone_number || selectedOrder.contact_phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Delivery Address</h3>
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-primary rounded-xl flex-shrink-0 h-fit">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedOrder.address || "No address provided"}
                    </p>
                    {selectedOrder.google_maps_link && (
                      <a 
                        href={selectedOrder.google_maps_link.includes('?q=') 
                          ? selectedOrder.google_maps_link.replace('?q=', '/search/?api=1&query=') 
                          : selectedOrder.google_maps_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                      >
                       <ExternalLink className="w-4 h-4" /> Open Capture in Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Ordered Items</h3>
                <div className="border border-border rounded-2xl overflow-hidden bg-white dark:bg-slate-900/30">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-border text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3 text-center">Qty</th>
                        <th className="px-6 py-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                                 {item.products?.image_url ? (
                                   <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-slate-300" /></div>
                                 )}
                               </div>
                               <span className="font-bold">{item.products?.name || "Unknown Product"}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-mono text-xs">IQD {Number(item.unit_price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span className="font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold">IQD {(Number(selectedOrder.total_amount) + Number(selectedOrder.discount_amount)).toLocaleString()}</span>
                </div>
                {selectedOrder.promo_code && (
                   <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span className="flex items-center gap-1 uppercase tracking-widest text-[10px]"><Ticket className="w-3 h-3" /> Discount ({selectedOrder.promo_code})</span>
                    <span>- IQD {Number(selectedOrder.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t-2 border-dotted border-border">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Total Charged</span>
                  <span className="text-2xl font-bold text-primary italic">IQD {Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
