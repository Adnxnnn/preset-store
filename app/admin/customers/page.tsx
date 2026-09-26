"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Mail, RefreshCw, UserCheck } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCustomers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-white mb-1">Customers & Users</h2>
          <p className="text-gray-400 text-sm">View all registered customers and creator accounts.</p>
        </div>
        <button
          onClick={loadCustomers}
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
                <th className="px-6 py-4 rounded-tl-2xl">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Users className="w-10 h-10 text-gray-600 mb-2" />
                      <p>No customers recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
                          {(customer.full_name || customer.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">
                          {customer.full_name || 'Customer'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      {customer.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        customer.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        <UserCheck className="w-3 h-3" />
                        {customer.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
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
