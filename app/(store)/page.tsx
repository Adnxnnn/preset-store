"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Download, 
  Star, 
  ChevronRight, 
  SlidersHorizontal,
  FileCheck,
  Check,
  Smartphone,
  Laptop
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { INITIAL_PRESETS, PresetProduct } from "../lib/store";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { FastCheckoutModal } from "../components/FastCheckoutModal";

export default function HomePage() {
  const [presets, setPresets] = useState<PresetProduct[]>(INITIAL_PRESETS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [checkoutProduct, setCheckoutProduct] = useState<PresetProduct | null>(null);

  useEffect(() => {
    async function loadPresets() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setPresets(data);
        }
      } catch (err) {
        console.warn("Using fallback presets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPresets();
  }, []);

  const categories = ["All", "Cinematic", "Film & Vintage", "Portrait", "Landscape"];

  const filteredPresets = selectedCategory === "All"
    ? presets
    : presets.filter(p => (p.category || "").toLowerCase().includes(selectedCategory.toLowerCase().split(" ")[0]));

  const featuredPreset = presets.find(p => p.is_featured) || presets[0] || INITIAL_PRESETS[0];

  return (
    <main className="w-full overflow-hidden">
      {/* Checkout Modal */}
      <FastCheckoutModal
        product={checkoutProduct}
        isOpen={!!checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
      />

      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-6 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
                2026 Master Collections Live &bull; Instant Download
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] font-serif tracking-tight text-white mb-6">
              EDIT LESS.<br />
              <span className="text-gray-400 italic">CREATE MORE.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
              Cinema-grade color grading presets crafted for photographers, videographers, and creators. Transform RAW photos into editorial masterpieces in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href="/store"
                className="h-14 px-8 bg-white text-black font-semibold text-sm tracking-wide rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse All Presets <ArrowRight className="w-4 h-4" />
              </Link>
              {featuredPreset && (
                <button
                  onClick={() => setCheckoutProduct(featuredPreset)}
                  className="h-14 px-8 bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-white/10"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Quick Buy ({featuredPreset.title} &bull; ₹{featuredPreset.price})
                </button>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> No account required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Mobile & Desktop ready
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Instant .ZIP download
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Before/After Showcase */}
          <div className="lg:col-span-5 w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 rounded-[34px] blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />
              <div className="relative">
                <BeforeAfterSlider
                  beforeSrc={featuredPreset.before_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200"}
                  afterSrc={featuredPreset.after_image_url}
                  title={featuredPreset.title}
                  aspectRatio="aspect-[4/5]"
                />
                <div className="mt-4 flex items-center justify-between px-2 text-xs text-gray-400">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                    Interactive: Drag slider left & right
                  </span>
                  <span className="font-mono text-gray-500">Preset: {featuredPreset.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPATIBILITY STRIP */}
      <section className="w-full border-y border-white/5 bg-[#030303] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-xs sm:text-sm font-serif tracking-widest text-gray-400 uppercase">
          <span className="flex items-center gap-2 text-gray-300">
            <Laptop className="w-4 h-4 text-gray-500" /> Lightroom Classic
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="flex items-center gap-2 text-gray-300">
            <Smartphone className="w-4 h-4 text-gray-500" /> Lightroom Mobile (iOS & Android)
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="flex items-center gap-2 text-gray-300">
            <FileCheck className="w-4 h-4 text-gray-500" /> Photoshop Camera Raw (ACR)
          </span>
        </div>
      </section>

      {/* FEATURED & POPULAR PRESETS CATALOG SECTION */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Curated Catalog
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight">
                Featured Collections
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg mt-2">
                Engineered for maximum versatility across portrait, street, night, and landscape photography.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-white text-black shadow-lg"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-4 animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-white/5 rounded-2xl" />
                  <div className="h-6 bg-white/5 rounded w-2/3" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              ))
            ) : filteredPresets.length > 0 ? (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-3xl p-4 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail with quick hover comparison */}
                    <Link href={`/product/${preset.id}`} className="block relative aspect-[4/5] rounded-2xl overflow-hidden mb-5 bg-[#050505] border border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.after_image_url}
                        alt={preset.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {preset.is_featured && (
                          <span className="bg-white text-black text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
                            Bestseller
                          </span>
                        )}
                        {preset.compare_at_price && (
                          <span className="bg-emerald-500/90 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
                            Save {Math.round(((preset.compare_at_price - preset.price) / preset.compare_at_price) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Format pill */}
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] font-medium px-2.5 py-1 rounded-full">
                        {preset.format || ".XMP & .DNG"}
                      </div>
                    </Link>

                    {/* Meta info */}
                    <div className="px-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
                          {preset.category || "Preset Pack"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{preset.rating || 4.9}</span>
                          <span className="text-gray-600 text-[10px]">({preset.reviews_count || 32})</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-serif text-white group-hover:text-emerald-300 transition-colors mb-2">
                        <Link href={`/product/${preset.id}`}>{preset.title}</Link>
                      </h3>
                      
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Pricing */}
                  <div className="px-2 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-white">₹{preset.price}</div>
                      {preset.compare_at_price && (
                        <div className="text-xs text-gray-500 line-through">₹{preset.compare_at_price}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/product/${preset.id}`}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => setCheckoutProduct(preset)}
                        className="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-black" /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-gray-400">No presets found in this category.</p>
              </div>
            )}
          </div>

          {/* View Full Store CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all"
            >
              Explore Complete Preset Catalog ({presets.length} collections) <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* BEFORE & AFTER SHOWCASE SECTION */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2 block">
              Professional Grading Made Simple
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-4">
              The One-Click Transformation
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Every preset is calibrated with precision color grading curves, balanced highlight rolloff, and organic film grain to look stunning on any skin tone and lighting setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-white">Editorial Skin Tones</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Skin tones are protected via dedicated HSL luminance curves so they stay natural and radiant while backgrounds take on deep cinematic color contrasts.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-white">Desktop & Mobile Ready</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Receive both .XMP files for Lightroom Classic / ACR and .DNG files for the 100% free Lightroom Mobile application.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-white">Instant Account-Free Delivery</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  No passwords to remember. Checkout securely with Cashfree and download your files immediately on the success page and via your email.
                </p>
              </div>
            </div>

            <div>
              <BeforeAfterSlider
                beforeSrc={presets[1]?.before_image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200"}
                afterSrc={presets[1]?.after_image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&sat=-20"}
                title={presets[1]?.title || "Vintage Film"}
                aspectRatio="aspect-square"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-sm">Everything you need to know about our presets and downloads.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-semibold text-white">Do I need an account or subscription to purchase?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                No! We eliminated customer accounts entirely. You simply choose your preset, enter your email during checkout, and receive your instant download link immediately upon payment.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-semibold text-white">Do these presets work on the free Lightroom Mobile app?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Yes! Every pack includes .DNG preset files designed specifically for the 100% free Lightroom Mobile app (iOS & Android). A paid Adobe subscription is NOT required.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-semibold text-white">How do I receive my preset files after payment?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Immediately after your payment is verified by Cashfree, you are shown the download screen with a 1-click Download button. A backup receipt with your download link is also sent directly to your email.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-semibold text-white">What is included in each preset pack?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Each collection includes 10-15 distinct preset variations, both .XMP (Desktop) and .DNG (Mobile) formats, plus our step-by-step PDF & video installation guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0a0a0a] text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Instant Access
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif text-white tracking-tight">
            Ready to upgrade your editing workflow?
          </h2>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join thousands of creators using LUMA presets to achieve consistent, cinema-quality photography in seconds.
          </p>

          <div>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 h-14 px-10 bg-white text-black font-semibold text-sm rounded-2xl hover:bg-gray-200 transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              Explore All Presets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
