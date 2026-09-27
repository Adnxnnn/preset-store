"use client";

import { useEffect, useState } from "react";
import { 
  Download, 
  Search, 
  FileArchive, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

interface PresetItem {
  id: string;
  title: string;
  format?: string;
  after_image_url?: string;
  preset_count?: number;
  download_url?: string;
}

interface OrderRecord {
  id: string;
  order_reference: string;
  created_at: string;
  total_amount: number;
  items: PresetItem[];
}

export default function MyCollectionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [localPurchases, setLocalPurchases] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [guidePlatform, setGuidePlatform] = useState<"mobile" | "desktop">("mobile");

  // On mount, load local purchases from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("luma_purchases");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalPurchases(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read localStorage purchases:", e);
    }
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          setErrorMsg("");
        } else {
          setOrders([]);
          setErrorMsg("No paid orders found matching that email or order ID. Please double-check the spelling.");
        }
      } else {
        setErrorMsg(data.error || "Failed to search orders. Please try again.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setErrorMsg("Unable to reach server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleTriggerDownload(url: string, id: string) {
    if (!url) return;
    setDownloadingId(id);
    window.open(url, "_blank");
    setTimeout(() => setDownloadingId(null), 2000);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-6 selection:bg-white/20">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PackageCheck className="w-3.5 h-3.5" /> Instant Customer Library
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
            My Preset Collection
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Access, download, and install your purchased Lightroom presets anytime without logging in.
          </p>
        </div>

        {/* Search / Email Lookup Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs uppercase tracking-widest font-semibold text-gray-300">
              Lookup Your Purchases
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your checkout email (e.g. name@example.com) or Order ID"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="h-14 px-8 bg-white text-black font-semibold text-sm rounded-2xl hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Find My Presets</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Tip: Enter the exact email address you provided at checkout to retrieve all your past purchases.
            </p>
          </form>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Database Search Results */}
        {orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Found {orders.reduce((acc, o) => acc + o.items.length, 0)} Preset Packages</span>
            </h2>

            <div className="grid gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>Order:</span>
                      <span className="font-mono text-gray-200 bg-white/5 px-2 py-0.5 rounded border border-white/5">{order.order_reference}</span>
                    </div>
                    <div>
                      Purchased on: <span className="text-gray-200">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.after_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800"}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-xl shrink-0 border border-white/10"
                          />
                          <div className="min-w-0">
                            <h3 className="text-lg font-medium text-white truncate">{item.title}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                              <FileArchive className="w-3.5 h-3.5 text-gray-500" /> {item.format || ".XMP & .DNG Files"} &bull; {item.preset_count || 12} Presets
                            </p>
                            <span className="inline-block mt-2 text-[11px] font-medium text-emerald-400">
                              ✓ Lifetime Access Ready
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => setActiveGuide(activeGuide === item.id ? null : item.id)}
                            className="h-12 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Guide
                          </button>

                          <button
                            onClick={() => handleTriggerDownload(item.download_url || "", item.id)}
                            disabled={downloadingId === item.id}
                            className="h-12 px-6 bg-white text-black hover:bg-gray-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Download className={`w-4 h-4 ${downloadingId === item.id ? "animate-bounce" : ""}`} />
                            {downloadingId === item.id ? "Downloading..." : "Download (.ZIP)"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accordion Guide if open */}
                  {activeGuide && order.items.some(it => it.id === activeGuide) && (
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 mt-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                        <h4 className="text-sm font-semibold text-white">Installation Guide</h4>
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
                          <button
                            onClick={() => setGuidePlatform("mobile")}
                            className={`px-3 py-1 rounded-lg ${guidePlatform === "mobile" ? "bg-white text-black font-semibold" : "text-gray-400"}`}
                          >
                            Mobile
                          </button>
                          <button
                            onClick={() => setGuidePlatform("desktop")}
                            className={`px-3 py-1 rounded-lg ${guidePlatform === "desktop" ? "bg-white text-black font-semibold" : "text-gray-400"}`}
                          >
                            Desktop
                          </button>
                        </div>
                      </div>

                      {guidePlatform === "mobile" ? (
                        <div className="grid sm:grid-cols-3 gap-3 text-xs text-gray-300">
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">1. Download ZIP</span>
                            Save the .zip file to your Files app and tap to unpack the .DNG files.
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">2. Add to Lightroom</span>
                            Open Lightroom Mobile and import the .DNG files as new photos.
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">3. Save Preset</span>
                            Open any imported preset photo, tap (•••) &rarr; &quot;Create Preset&quot;.
                          </div>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-3 gap-3 text-xs text-gray-300">
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">1. Extract .XMP</span>
                            Unzip the package on your PC/Mac to locate the .XMP preset files.
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">2. Open Presets Panel</span>
                            In Lightroom Classic/CC Develop module, open Presets tab on left.
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl">
                            <span className="font-bold text-white block mb-1">3. Import Presets</span>
                            Click (+) &rarr; &quot;Import Presets&quot; and select your .XMP files.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Purchases Section (if no query or query didn't return) */}
        {orders.length === 0 && localPurchases.length > 0 && !searched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-white">Recent Purchases on this Device</h2>
              <span className="text-xs text-gray-400">Stored locally in your browser</span>
            </div>

            <div className="grid gap-4">
              {localPurchases.map((purchase, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={purchase.productImage || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800"}
                      alt={purchase.productTitle}
                      className="w-16 h-16 object-cover rounded-xl shrink-0 border border-white/10"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-white">{purchase.productTitle}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Order ID: {purchase.orderId}</p>
                      <p className="text-xs text-emerald-400 mt-1">✓ Verified Purchase</p>
                    </div>
                  </div>

                  <Link
                    href={`/payment-success?order_id=${purchase.orderId}&product_id=${purchase.productId}`}
                    className="h-11 px-6 bg-white text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Access Download Page
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zero State if empty */}
        {orders.length === 0 && localPurchases.length === 0 && searched && (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <HelpCircle className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-serif text-white">Need help finding your presets?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If you used a different email during payment, search with that address above or check your email inbox for your order confirmation receipt.
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 h-11 px-6 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
              >
                Browse Store Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
