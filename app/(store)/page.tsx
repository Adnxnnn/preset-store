"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(3);
      
      if (data) setFeatured(data);
    }
    loadFeatured();
  }, []);

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-widest uppercase text-gray-300">The New Master Collection is Live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] leading-[0.9] font-serif tracking-tighter mb-8 text-balance text-white">
            EDIT LESS.<br />
            <span className="text-gray-500 italic">CREATE MORE.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-balance mb-12">
            Premium presets made for creators who want their photos to feel different. 
            Achieve cinematic, editorial, and timeless looks in one click.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/store" 
              className="h-14 px-8 bg-white text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Explore Presets <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/collections/bundles" 
              className="h-14 px-8 bg-white/5 border border-white/10 text-white rounded-full font-medium flex items-center hover:bg-white/10 transition-colors"
            >
              View Bundles
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Marquee or Banner (Visual Divider) */}
      <div className="w-full border-y border-white/5 bg-[#080808] py-8 overflow-hidden">
        <div className="flex items-center justify-center gap-16 text-sm font-serif tracking-widest text-gray-500 uppercase opacity-50">
          <span>Lightroom Classic</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          <span>Lightroom Mobile</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          <span>Photoshop Camera Raw</span>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Featured Collections</h2>
              <p className="text-gray-400 max-w-md">Our most popular cinematic and editorial presets, curated for professional workflows.</p>
            </div>
            <Link href="/store" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-gray-300 transition-colors">
              View All <MoveRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.length > 0 ? (
              featured.map((preset) => (
                <Link key={preset.id} href={`/product/${preset.id}`} className="group block">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-white/5 border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={preset.after_image_url || preset.before_image_url} 
                      alt={preset.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-white">{preset.title}</h3>
                    <span className="text-gray-400 font-medium">₹{preset.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-1">{preset.description}</p>
                </Link>
              ))
            ) : (
              // Skeletons if no data yet (or empty state)
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-white/5 rounded-2xl mb-6" />
                  <div className="h-6 bg-white/5 w-1/2 rounded mb-2" />
                  <div className="h-4 bg-white/5 w-3/4 rounded" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Philosophy / Newsletter */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#080808]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">Elevate your aesthetic.</h2>
          <p className="text-xl text-gray-400 mb-12 text-balance">
            Join 10,000+ creators who use our tools to achieve a consistent, professional look across their entire portfolio.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full h-14 bg-white/5 border border-white/10 rounded-full px-6 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
            <button className="w-full sm:w-auto h-14 px-8 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
      {/* Newsletter Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-white mb-4">Join the Creator Club</h2>
          <p className="text-gray-400 mb-8">Get exclusive access to new preset drops, editing tutorials, and creative resources sent straight to your inbox.</p>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing! We'll be in touch soon."); }}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <input 
              type="email" 
              placeholder="Enter your email address"
              required
              className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white focus:outline-none focus:border-white/30"
            />
            <button 
              type="submit"
              className="h-14 px-8 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-4">We respect your privacy. No spam, ever.</p>
        </div>
      </section>
    </main>
  );
}
