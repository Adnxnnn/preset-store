"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, Menu, X, ShieldCheck, Zap, Download } from "lucide-react";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/luma.png"
              alt="LUMA Presets"
              className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback text if image fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="text-2xl tracking-[0.2em] font-serif text-white group-hover:text-gray-300 transition-colors hidden">
              LUMA<span className="text-emerald-400 font-sans text-xs ml-0.5">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-gray-400">
            <Link href="/store" className="hover:text-white transition-colors">All Presets</Link>
            <Link href="/store?category=Cinematic" className="hover:text-white transition-colors">Cinematic</Link>
            <Link href="/store?category=Film" className="hover:text-white transition-colors">Film & Vintage</Link>
            <Link href="/store?category=Portrait" className="hover:text-white transition-colors">Portraits</Link>
            <Link href="/collection" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold">
              <Download className="w-3.5 h-3.5" /> My Collection
            </Link>
          </div>
        </div>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/collection"
            className="flex items-center gap-2 text-xs text-gray-300 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Downloads</span>
          </Link>
          <Link
            href="/store"
            className="h-10 px-5 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-full hover:bg-gray-200 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Presets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <Link
            href="/collection"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-base font-semibold text-emerald-400 py-2 border-b border-white/5"
          >
            <Download className="w-4 h-4" /> My Collection & Downloads
          </Link>
          <Link
            href="/store"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-white hover:text-emerald-400 transition-colors py-2 border-b border-white/5"
          >
            All Presets
          </Link>
          <Link
            href="/store?category=Cinematic"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-gray-300 hover:text-emerald-400 transition-colors py-2 border-b border-white/5"
          >
            Cinematic
          </Link>
          <Link
            href="/store?category=Film"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-gray-300 hover:text-emerald-400 transition-colors py-2 border-b border-white/5"
          >
            Film & Vintage
          </Link>
          <Link
            href="/store?category=Portrait"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-gray-300 hover:text-emerald-400 transition-colors py-2 border-b border-white/5"
          >
            Portraits
          </Link>
          <div className="pt-2">
            <Link
              href="/store"
              onClick={() => setMobileOpen(false)}
              className="w-full h-12 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              Browse All Presets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030303] pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-gray-400 text-sm">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/luma.png"
              alt="LUMA Presets"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="max-w-sm leading-relaxed text-gray-400 text-sm">
            Professional color grading and preset tools tailored for photographers, filmmakers, and digital creators worldwide. Instant secure downloads without account friction.
          </p>
          <div className="flex items-center gap-6 pt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Secure Checkout</span>
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-cyan-400" /> Instant Download</span>
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-4 tracking-widest text-xs uppercase">Collections</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/store" className="hover:text-white transition-colors">All Presets</Link></li>
            <li><Link href="/store?category=Cinematic" className="hover:text-white transition-colors">Cinematic & Moody</Link></li>
            <li><Link href="/store?category=Film" className="hover:text-white transition-colors">35mm Vintage Film</Link></li>
            <li><Link href="/store?category=Portrait" className="hover:text-white transition-colors">Editorial Portraits</Link></li>
            <li><Link href="/store?category=Landscape" className="hover:text-white transition-colors">Outdoor & Landscape</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-4 tracking-widest text-xs uppercase">Store & Support</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/collection" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">My Collection / Downloads</Link></li>
            <li><Link href="/store" className="hover:text-white transition-colors">Browse Catalog</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition-colors">Installation FAQ</Link></li>
            <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">Creator Admin ↗</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-8 gap-4">
        <p>&copy; {new Date().getFullYear()} LUMA Presets Inc. All rights reserved. Lightroom is a trademark of Adobe Inc.</p>
        <div className="flex items-center gap-6">
          <span className="text-gray-400">Powered by Cashfree & Supabase</span>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 font-sans selection:bg-white/20">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
