"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Mail, RefreshCw, ShoppingCart } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    setLoading(true);
    try {
      // Aggregate purchasers from orders
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_email, customer_name, total_amount, status, created_at")
        .order("created_at", { ascending: false });

      if (orders) {
        const customerMap: Record<string, any> = {};
        orders.forEach((o) => {
          const email = o.customer_email || "guest@example.com";
          if (!customerMap[email]) {
            customerMap[email] = {
              email,
              name: o.customer_name || "Guest Customer",
              orderCount: 1,
              totalSpent: o.status === "paid" ? Number(o.total_amount) : 0,
              lastOrderDate: o.created_at,
            };
          } else {
            customerMap[email].orderCount += 1;
            if (o.status === "paid") {
              customerMap[email].totalSpent += Number(o.total_amount);
            }
          }
        });
        setCustomers(Object.values(customerMap));
      }
    } catch (err) {
      console.error("Customers aggregate load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-white mb-1">Purchaser Directory</h2>
          <p className="text-gray-400 text-xs">Customer emails aggregated from verified orders.</p>
        </div>
        <button
          onClick={loadCustomers}
          disabled={loading}
          className="h-10 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300 font-semibold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading customer records...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Users className="w-8 h-8 text-gray-600 mb-2" />
                      <p>No customer orders recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      {c.email}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{c.orderCount}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">₹{c.totalSpent}</td>
                    <td className="px-6 py-4 text-right text-gray-500 text-[11px]">
                      {new Date(c.lastOrderDate).toLocaleDateString()}
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
