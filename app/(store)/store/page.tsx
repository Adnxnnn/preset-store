"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, Zap, ArrowUpDown, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { INITIAL_PRESETS, PresetProduct } from "../../lib/store";
import { FastCheckoutModal } from "../../components/FastCheckoutModal";

function StoreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [products, setProducts] = useState<PresetProduct[]>(INITIAL_PRESETS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [checkoutProduct, setCheckoutProduct] = useState<PresetProduct | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("Using fallback presets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Update selectedCategory if query param changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const categories = ["All", "Cinematic", "Film & Vintage", "Portrait", "Landscape"];

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      const catKey = selectedCategory.toLowerCase().split(" ")[0];
      list = list.filter((p) => (p.category || "").toLowerCase().includes(catKey));
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else {
      // Featured
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-6">
      {/* Checkout Modal */}
      <FastCheckoutModal
        product={checkoutProduct}
        isOpen={!!checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant Digital Delivery
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif text-white tracking-tight">
              Preset Catalog
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-lg">
              Explore professional color grading packs for Lightroom Mobile, Desktop, and ACR. No account required to purchase.
            </p>
          </div>

          {/* Search bar & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search presets, LUTs, tags..."
                className="w-full sm:w-64 h-11 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto h-11 bg-white/5 border border-white/10 rounded-2xl px-4 text-xs text-gray-300 focus:outline-none focus:border-white/30 transition-colors appearance-none pr-8 cursor-pointer"
              >
                <option value="featured" className="bg-[#0a0a0a]">Featured Collections</option>
                <option value="newest" className="bg-[#0a0a0a]">Newest First</option>
                <option value="price-asc" className="bg-[#0a0a0a]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0a0a0a]">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase().includes(cat.toLowerCase().split(" ")[0]) || (selectedCategory === "All" && cat === "All")
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-4 animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-white/5 rounded-2xl" />
                <div className="h-5 bg-white/5 rounded w-2/3" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((preset) => (
              <div
                key={preset.id}
                className="group bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-3xl p-4 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${preset.id}`}
                    className="block relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-[#050505] border border-white/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.after_image_url}
                      alt={preset.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {preset.is_featured && (
                        <span className="bg-white text-black text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md">
                          Featured
                        </span>
                      )}
                      {preset.compare_at_price && (
                        <span className="bg-emerald-500/90 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md">
                          Save {Math.round(((preset.compare_at_price - preset.price) / preset.compare_at_price) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {preset.format || ".XMP & .DNG"}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">
                        {preset.category || "Preset"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{preset.rating || 4.9}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-serif text-white group-hover:text-emerald-300 transition-colors mb-1.5">
                      <Link href={`/product/${preset.id}`}>{preset.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-1 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-bold text-white">₹{preset.price}</div>
                    {preset.compare_at_price && (
                      <div className="text-[11px] text-gray-500 line-through">₹{preset.compare_at_price}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/product/${preset.id}`}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => setCheckoutProduct(preset)}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-bold transition-all shadow flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-black" /> Buy
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-gray-400 text-sm mb-4">No preset packs match your search query.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-medium hover:bg-white/15 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <StoreContent />
    </Suspense>
  );
}
