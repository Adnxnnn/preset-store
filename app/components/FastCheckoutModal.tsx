"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, Zap, Lock, Tag, ArrowRight, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PresetProduct } from "../lib/store";

interface FastCheckoutModalProps {
  product: PresetProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FastCheckoutModal({ product, isOpen, onClose }: FastCheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Ensure Cashfree SDK is loaded
    if (typeof window !== "undefined" && !(window as any).Cashfree) {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen || !product) return null;

  const originalPrice = Number(product.price);
  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = Math.max(1, originalPrice - discountAmount);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoMessage(null);

    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("discount_percentage")
        .eq("code", promoCode.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (data && data.discount_percentage) {
        setDiscountPercent(Number(data.discount_percentage));
        setPromoMessage({
          text: `🎉 Code applied! ${data.discount_percentage}% discount saved.`,
          isError: false,
        });
      } else {
        setDiscountPercent(0);
        setPromoMessage({
          text: "Invalid or expired promo code.",
          isError: true,
        });
      }
    } catch {
      setPromoMessage({ text: "Could not verify coupon.", isError: true });
    }
  }

  async function handleSubmitCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address for delivery.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          customerEmail: email.trim().toLowerCase(),
          customerName: name.trim() || undefined,
          customerPhone: phone.trim() || undefined,
          promoCode: discountPercent > 0 ? promoCode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize secure checkout session");
      }

      // 2. Open Cashfree payment sheet
      // @ts-ignore
      if (typeof window !== "undefined" && window.Cashfree) {
        // @ts-ignore
        const cashfree = window.Cashfree({
          mode: data.environment || "sandbox",
        });

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self",
        });
      } else {
        // Fallback standard redirect
        window.location.href = `/api/payment/verify?order_id=${data.orderId}&product_id=${product?.id}`;
      }
    } catch (err: any) {
      console.error("Checkout initiation failed:", err);
      alert(err.message || "Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Zap className="w-3 h-3" /> Direct Instant Download
          </span>
          <h2 className="text-2xl font-serif text-white">Instant Checkout</h2>
          <p className="text-xs text-gray-400 mt-1">
            No account required. Enter your email to receive your secure files and receipt.
          </p>
        </div>

        {/* Product Snapshot */}
        <div className="bg-[#050505] rounded-2xl p-4 border border-white/5 flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.after_image_url}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{product.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{product.format || ".XMP & .DNG"} &bull; {product.preset_count || 12} Presets</p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-white">₹{finalPrice.toFixed(2)}</div>
            {discountPercent > 0 && (
              <div className="text-xs text-emerald-400 line-through">₹{originalPrice}</div>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmitCheckout} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Email Address <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Carter"
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PROMO CODE"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 text-xs uppercase tracking-wider text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 h-11 bg-white/10 hover:bg-white/15 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p className={`text-xs mt-2 ${promoMessage.isError ? "text-red-400" : "text-emerald-400"}`}>
                {promoMessage.text}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-14 mt-4 bg-white text-black font-semibold text-base rounded-2xl hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Secure Gateway...</span>
              </div>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{finalPrice.toFixed(2)} & Instant Download</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
          </span>
          <span>&bull;</span>
          <span>Cashfree Verified</span>
          <span>&bull;</span>
          <span>Instant Download</span>
        </div>
      </div>
    </div>
  );
}
