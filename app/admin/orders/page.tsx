"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  ShoppingCart, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Download, 
  Mail, 
  ExternalLink,
  X,
  ShieldCheck,
  FileArchive
} from "lucide-react";
import { useUI } from "../../components/UIFeedback";

export default function AdminOrdersPage() {
  const { showToast } = useUI();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [supportSignedUrl, setSupportSignedUrl] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);

  async function loadOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_reference,
          customer_email,
          customer_name,
          customer_phone,
          total_amount,
          status,
          payment_session_id,
          download_token,
          created_at,
          order_items (
            product_id,
            price_at_purchase,
            products (id, title, file_url, after_image_url)
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err: any) {
      console.error("Orders load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  async function generateSupportDownloadLink(order: any) {
    setGeneratingLink(true);
    setSupportSignedUrl(null);

    try {
      const productId = order.order_items?.[0]?.products?.id || order.order_items?.[0]?.product_id;
      const fileUrl = order.order_items?.[0]?.products?.file_url;

      if (fileUrl) {
        const { data, error } = await supabase.storage
          .from("product-files")
          .createSignedUrl(fileUrl, 60 * 60 * 24); // 24 hours

        if (error) throw error;
        if (data?.signedUrl) {
          setSupportSignedUrl(data.signedUrl);
          showToast("Support download link generated (valid 24h)", "success");
        }
      } else {
        // Fetch product file url directly
        const { data: prod } = await supabase
          .from("products")
          .select("file_url")
          .eq("id", productId)
          .single();

        if (prod?.file_url) {
          const { data, error } = await supabase.storage
            .from("product-files")
            .createSignedUrl(prod.file_url, 60 * 60 * 24);

          if (error) throw error;
          if (data?.signedUrl) {
            setSupportSignedUrl(data.signedUrl);
            showToast("Support download link generated (valid 24h)", "success");
          }
        } else {
          showToast("Product file path not found for this order.", "error");
        }
      }
    } catch (err: any) {
      showToast(err.message || "Could not create signed download URL", "error");
    } finally {
      setGeneratingLink(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (order.customer_email || "").toLowerCase().includes(q) ||
      (order.order_reference || "").toLowerCase().includes(q) ||
      (order.customer_name || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white">Orders & Transactions</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time payments verified by Cashfree with secure download fulfillment.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium border border-white/5 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer email or order reference..."
            className="w-full h-10 bg-[#080808] border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#080808] border border-white/10 rounded-xl">
          {["all", "paid", "pending", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-white text-black font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300 font-semibold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Order Reference</th>
                <th className="px-6 py-4">Customer Email</th>
                <th className="px-6 py-4">Item(s)</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No customer transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Order Ref */}
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      {order.order_reference || order.payment_session_id || order.id.substring(0, 10)}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-white font-medium">{order.customer_email}</span>
                      </div>
                      {order.customer_name && order.customer_name !== "Guest Customer" && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">{order.customer_name}</span>
                      )}
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item: any, idx: number) => (
                          <span key={idx} className="block text-gray-300 truncate max-w-[200px]">
                            {item.products?.title || "Preset Pack"}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Preset Pack</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-semibold text-white">
                      ₹{order.total_amount}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : order.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {order.status === "paid" && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === "pending" && <Clock className="w-3 h-3" />}
                        {order.status === "failed" && <AlertCircle className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-gray-500 text-[11px]">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => { setSelectedOrder(null); setSupportSignedUrl(null); }}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mb-1 block">
                Order Details
              </span>
              <h3 className="text-xl font-serif text-white font-bold">
                {selectedOrder.order_reference || selectedOrder.id}
              </h3>
            </div>

            <div className="bg-[#050505] rounded-2xl p-4 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Email:</span>
                <span className="text-white font-medium">{selectedOrder.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{selectedOrder.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-semibold uppercase text-white">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Timestamp:</span>
                <span className="text-gray-300">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              {selectedOrder.payment_session_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway Session:</span>
                  <span className="text-gray-400 font-mono text-[10px] truncate max-w-[200px]">
                    {selectedOrder.payment_session_id}
                  </span>
                </div>
              )}
            </div>

            {/* Support Download Generator */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Customer Support Fulfillment
              </h4>
              
              {!supportSignedUrl ? (
                <button
                  onClick={() => generateSupportDownloadLink(selectedOrder)}
                  disabled={generatingLink}
                  className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {generatingLink ? "Generating Secure Link..." : "Generate Temporary Download Link (24h)"}
                </button>
              ) : (
                <div className="space-y-2">
                  <a
                    href={supportSignedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-12 rounded-xl bg-emerald-500 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 hover:bg-emerald-400"
                  >
                    <Download className="w-4 h-4" /> Open / Download Preset File (.ZIP)
                  </a>
                  <p className="text-[10px] text-gray-500 text-center">
                    Link signed with private Supabase key. Expires automatically in 24 hours.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
