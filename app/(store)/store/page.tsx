"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { Search, SlidersHorizontal } from "lucide-react";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (data) setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div className="w-full min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-serif text-white mb-4">All Presets</h1>
            <p className="text-gray-400">Discover tools to transform your creative workflow.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full md:w-64 h-10 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <button className="h-10 px-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Loading Skeletons
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-white/5 rounded-2xl mb-4" />
                <div className="h-5 bg-white/5 w-2/3 rounded mb-2" />
                <div className="h-4 bg-white/5 w-1/4 rounded" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((preset) => (
              <Link key={preset.id} href={`/product/${preset.id}`} className="group block">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-white/5 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={preset.after_image_url || preset.before_image_url} 
                    alt={preset.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  {preset.compare_at_price && (
                    <div className="absolute top-3 left-3 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-serif text-white mb-1 group-hover:text-gray-300 transition-colors">{preset.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">₹{preset.price}</span>
                  {preset.compare_at_price && (
                    <span className="text-sm text-gray-500 line-through">₹{preset.compare_at_price}</span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-gray-500">No presets found. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
