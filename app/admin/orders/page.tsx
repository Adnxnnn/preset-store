"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ShoppingCart, RefreshCw, CheckCircle, Clock } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        payment_session_id,
        profiles (email, full_name),
        order_items (
          product_id,
          price_at_purchase,
          products (title)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-white mb-1">Orders & Transactions</h2>
          <p className="text-gray-400 text-sm">Real-time payment and order fulfillment records.</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="h-10 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-300 font-medium">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Order ID / Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product(s)</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-6">
                      <ShoppingCart className="w-10 h-10 text-gray-600 mb-2" />
                      <p>No customer orders recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">
                      {order.payment_session_id || order.id.substring(0, 13)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{order.profiles?.email || 'Guest Customer'}</p>
                      {order.profiles?.full_name && (
                        <p className="text-xs text-gray-500">{order.profiles.full_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.order_items?.map((item: any, idx: number) => (
                        <span key={idx} className="block text-white text-xs">
                          {item.products?.title || 'Preset Pack'}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'paid'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {order.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
