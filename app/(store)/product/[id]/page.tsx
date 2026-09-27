"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  FileArchive, 
  Star, 
  Zap, 
  Check, 
  Lock, 
  Smartphone, 
  Laptop, 
  Tag, 
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { INITIAL_PRESETS, PresetProduct } from "../../../lib/store";
import { BeforeAfterSlider } from "../../../components/BeforeAfterSlider";
import { FastCheckoutModal } from "../../../components/FastCheckoutModal";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<PresetProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<PresetProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      if (!id) return;
      setLoading(true);

      try {
        // 1. Fetch main product
        const { data: dbProduct } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        const selected = dbProduct || INITIAL_PRESETS.find((p) => p.id === id) || null;
        setProduct(selected);

        // 2. Fetch related presets
        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .neq("id", id)
          .limit(3);

        if (related && related.length > 0) {
          setRelatedProducts(related);
        } else {
          setRelatedProducts(INITIAL_PRESETS.filter((p) => p.id !== id).slice(0, 3));
        }
      } catch (err) {
        console.warn("Using fallback product details:", err);
        const fallback = INITIAL_PRESETS.find((p) => p.id === id) || null;
        setProduct(fallback);
        setRelatedProducts(INITIAL_PRESETS.filter((p) => p.id !== id).slice(0, 3));
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading preset package...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-serif text-white mb-3">Preset Not Found</h1>
        <p className="text-gray-400 text-sm mb-6">The requested preset collection may have been archived or removed.</p>
        <Link
          href="/store"
          className="h-12 px-6 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
        >
          Return to Store Catalog
        </Link>
      </div>
    );
  }

  const defaultIncludes = [
    `${product.preset_count || 12} Custom Preset Variations (.XMP & .DNG)`,
    "Mobile One-Click DNG Files (Free Lightroom Mobile App)",
    "Desktop XMP Files (Lightroom Classic, CC & Photoshop ACR)",
    "Step-by-Step PDF Installation Guide & Video Walkthrough",
    "Free Lifetime Updates & Re-downloads"
  ];

  const defaultCompatibility = [
    "Lightroom Mobile (iOS & Android) — Free App, No Subscription Required",
    "Lightroom Classic (v7.3 and newer)",
    "Lightroom CC (Desktop)",
    "Adobe Photoshop Camera Raw (ACR)"
  ];

  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      {/* Fast Checkout Modal */}
      <FastCheckoutModal
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Presets
          </Link>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Interactive Slider & Previews */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-28">
            <div className="relative group">
              <BeforeAfterSlider
                beforeSrc={product.before_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200"}
                afterSrc={product.after_image_url}
                title={product.title}
                aspectRatio="aspect-[4/5]"
              />
            </div>
            
            <div className="flex items-center justify-between px-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Interactive RAW comparison
              </span>
              <span>Drag slider to see true RAW grading</span>
            </div>
          </div>

          {/* Right: Product Details & Purchase CTA */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            
            {/* Title & Category & Rating */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {product.category || "Preset Collection"}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold">{product.rating || 4.9}</span>
                  <span className="text-gray-500">({product.reviews_count || 48} verified reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-4 mt-4">
                <span className="text-4xl font-bold text-white">₹{product.price}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-gray-500 line-through">₹{product.compare_at_price}</span>
                )}
                {product.compare_at_price && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-6">
              <p>{product.description}</p>
              {product.full_description && (
                <p className="text-xs text-gray-400">{product.full_description}</p>
              )}
            </div>

            {/* Instant Buy CTA Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full h-16 bg-white text-black font-semibold text-lg rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2.5 shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
              >
                <Zap className="w-5 h-5 text-black" />
                <span>Instant Buy — ₹{product.price}</span>
              </button>

              <p className="text-center text-xs text-gray-400">
                ⚡ Instant download after checkout &bull; No account creation required
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Secure Checkout</span>
                <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5 text-cyan-400" /> Instant .ZIP Delivery</span>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> What&apos;s Included In This Pack
              </h3>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {(product.includes && product.includes.length > 0 ? product.includes : defaultIncludes).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Software Compatibility */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" /> Software & App Compatibility
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                {(product.compatibility && product.compatibility.length > 0 ? product.compatibility : defaultCompatibility).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Related Presets */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif text-white">You May Also Like</h3>
                <p className="text-xs text-gray-400 mt-1">Explore other complimentary color palettes.</p>
              </div>
              <Link href="/store" className="text-xs text-gray-400 hover:text-white transition-colors">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-3xl p-4 transition-all duration-300 block"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-[#050505]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.after_image_url}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {rel.format || ".XMP & .DNG"}
                    </div>
                  </div>
                  <h4 className="text-base font-serif text-white group-hover:text-emerald-300 transition-colors mb-1">{rel.title}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400">{rel.category || "Preset"}</span>
                    <span className="font-bold text-white">₹{rel.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
