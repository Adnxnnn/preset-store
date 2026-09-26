"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import { CheckCircle2, Download, Package, ArrowRight, ShieldCheck, FileArchive } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const productId = searchParams.get("product_id");
  const status = searchParams.get("status");

  const [product, setProduct] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadOrderAndProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch product details
        const { data: prod } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (prod) {
          setProduct(prod);

          // Generate signed download URL (valid for 24 hours)
          if (prod.file_url) {
            if (prod.file_url.startsWith("http")) {
              setDownloadUrl(prod.file_url);
            } else {
              const { data: signedData } = await supabase.storage
                .from("product-files")
                .createSignedUrl(prod.file_url, 60 * 60 * 24);

              if (signedData?.signedUrl) {
                setDownloadUrl(signedData.signedUrl);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading product download:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrderAndProduct();
  }, [productId]);

  function handleInstantDownload() {
    if (!downloadUrl) {
      alert("Generating download link, please wait...");
      return;
    }
    setDownloading(true);
    window.open(downloadUrl, "_blank");
    setTimeout(() => setDownloading(false), 2000);
  }

  if (status === "failed") {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
            ✕
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Payment Incomplete</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            We could not complete your transaction. No charges were made. Please try again.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Return to Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl backdrop-blur-xl">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Thank you for your purchase. Your digital preset files are ready for instant download below.
        </p>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-400">Preparing your download package...</p>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex items-center gap-4 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.after_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800"}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-xl shrink-0 border border-white/5"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
                <h3 className="text-lg font-medium text-white truncate">{product.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <FileArchive className="w-3.5 h-3.5 text-gray-500" /> {product.format || ".XMP & .DNG Files"}
                </p>
              </div>
            </div>

            {/* Instant Download Button */}
            <button
              onClick={handleInstantDownload}
              disabled={downloading}
              className="w-full h-14 bg-white text-black font-semibold text-base rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2.5 shadow-xl disabled:opacity-50"
            >
              <Download className={`w-5 h-5 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? "Starting Download..." : "Download Preset Files (.ZIP)"}
            </button>

            {/* Order Reference */}
            {orderId && (
              <p className="text-xs text-gray-500 font-mono">
                Order ID: <span className="text-gray-400">{orderId}</span>
              </p>
            )}

            {/* Secondary Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/account"
                className="w-full sm:w-auto h-11 px-6 bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4 text-gray-400" /> View in My Library
              </Link>
              <Link
                href="/store"
                className="w-full sm:w-auto h-11 px-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-400">
              Your payment of Order <span className="font-mono text-white">{orderId}</span> has been confirmed.
            </p>
            <Link
              href="/account"
              className="w-full h-12 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Access Your Downloads in Account Library
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
