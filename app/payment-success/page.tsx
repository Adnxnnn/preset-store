"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  FileArchive, 
  Smartphone, 
  Laptop, 
  AlertCircle,
  Sparkles,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const token = searchParams.get("token");
  const productId = searchParams.get("product_id");
  const status = searchParams.get("status");

  const [productData, setProductData] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    async function verifyAndFetchDownload() {
      if (status === "failed") {
        setLoading(false);
        return;
      }

      if (!orderId) {
        setErrorMsg("Missing order reference.");
        setLoading(false);
        return;
      }

      try {
        const queryParams = new URLSearchParams({
          order_id: orderId,
          ...(token ? { token } : {}),
          ...(productId ? { product_id: productId } : {})
        });

        const res = await fetch(`/api/payment/verify-download?${queryParams.toString()}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setProductData(data.product);
          setDownloadUrl(data.downloadUrl);
        } else {
          setErrorMsg(data.error || "Unable to locate verified purchase.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setErrorMsg("Failed to verify transaction. Please contact support.");
      } finally {
        setLoading(false);
      }
    }

    verifyAndFetchDownload();
  }, [orderId, token, productId, status]);

  function handleDownloadClick() {
    if (!downloadUrl) return;
    setDownloading(true);
    window.open(downloadUrl, "_blank");
    setTimeout(() => setDownloading(false), 2500);
  }

  if (status === "failed" || errorMsg) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Payment Verification Incomplete</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {errorMsg || "We could not verify a successful transaction for this order. No charges were made or verification timed out."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/store"
              className="w-full sm:w-auto h-12 px-8 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Success Header Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
          </span>

          <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Thank you for your order. Your digital preset package is ready for instant download below. We also sent a receipt to your email.
          </p>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400">Securing your download package...</p>
            </div>
          ) : productData ? (
            <div className="space-y-6">
              {/* Product Preview Card */}
              <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex items-center gap-4 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productData.after_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800"}
                  alt={productData.title}
                  className="w-20 h-20 object-cover rounded-xl shrink-0 border border-white/5"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white truncate">{productData.title}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <FileArchive className="w-3.5 h-3.5 text-gray-500" /> {productData.format || ".XMP & .DNG Files"}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ Includes {productData.preset_count || 12} Presets + Installation Guide
                  </p>
                </div>
              </div>

              {/* Instant Download Button */}
              <button
                onClick={handleDownloadClick}
                disabled={downloading || !downloadUrl}
                className="w-full h-16 bg-white text-black font-semibold text-lg rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className={`w-6 h-6 ${downloading ? "animate-bounce" : ""}`} />
                {downloading ? "Starting Download..." : "Download Preset Files (.ZIP)"}
              </button>

              {/* Order Reference */}
              {orderId && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>Order Reference:</span>
                  <span className="font-mono text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{orderId}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Installation Guide Accordion */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">How to Install Your Presets</h3>
                <p className="text-xs text-gray-400">Quick 2-minute setup instructions</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "mobile" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
              <button
                onClick={() => setActiveTab("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "desktop" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Desktop
              </button>
            </div>
          </div>

          {activeTab === "mobile" ? (
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">1</span>
                <h4 className="font-medium text-white">Unzip Download</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Download the .zip file on your phone (Files app on iOS or File Manager on Android) and tap to extract the .DNG files.
                </p>
              </div>
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">2</span>
                <h4 className="font-medium text-white">Import to Lightroom</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open the free Lightroom Mobile app, tap &quot;Add Photos&quot; and select the extracted .DNG preset images.
                </p>
              </div>
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">3</span>
                <h4 className="font-medium text-white">Create Preset</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open any imported preset photo, tap the three dots (&bull;&bull;&bull;) &rarr; &quot;Create Preset&quot; and save to your presets list!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">1</span>
                <h4 className="font-medium text-white">Extract .XMP Files</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Extract the downloaded ZIP package on your Mac or Windows PC to locate the .XMP preset files.
                </p>
              </div>
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">2</span>
                <h4 className="font-medium text-white">Open Presets Tab</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open Lightroom Classic or CC, switch to the Develop module, and navigate to the Presets panel on the left.
                </p>
              </div>
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">3</span>
                <h4 className="font-medium text-white">Click Import</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Click the &quot;+&quot; icon &rarr; &quot;Import Presets&quot; and select the .XMP files or the ZIP folder directly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Support & Continue Shopping */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <span>Need assistance with your files? We are here to help anytime.</span>
          </div>
          <Link
            href="/store"
            className="flex items-center gap-1.5 text-white hover:underline font-medium"
          >
            Explore More Presets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
