"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { SlidersHorizontal, ArrowLeft, Download, ShieldCheck, FileImage } from "lucide-react";
import Link from "next/link";

function ImageSlider({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const stopDragging = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchend', stopDragging);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      return () => {
        window.removeEventListener('mouseup', stopDragging);
        window.removeEventListener('touchend', stopDragging);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [stopDragging, handleMouseMove, handleTouchMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="After edit" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${sliderPosition}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="Before edit" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }} />
      </div>

      <div className="absolute inset-y-0 w-1 bg-white pointer-events-none transform -translate-x-1/2" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <SlidersHorizontal className="w-5 h-5 text-black" />
        </div>
      </div>
      
      <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">BEFORE</div>
      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">AFTER</div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setProduct(data);
      setLoading(false);
    }
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-serif mb-4">Product not found</h1>
        <Link href="/store" className="text-gray-400 hover:text-white underline">Return to store</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/store" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Interactive Slider */}
          <div className="sticky top-32">
            <ImageSlider 
              beforeSrc={product.before_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'} 
              afterSrc={product.after_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&sat=150'} 
            />
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <h1 className="text-5xl font-serif text-white mb-6 leading-tight">{product.title}</h1>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-medium text-white">₹{product.price}</span>
              {product.compare_at_price && (
                <span className="text-xl text-gray-500 line-through mb-1">₹{product.compare_at_price}</span>
              )}
            </div>

            <p className="text-lg text-gray-400 mb-12 leading-relaxed">
              {product.description || "Premium Lightroom presets designed to transform your photos with one click."}
            </p>

            <button className="w-full h-16 bg-white text-black font-medium text-lg rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-8">
              Buy Now — ₹{product.price}
            </button>

            <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-8 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <FileImage className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Format</p>
                  <p className="font-medium">{product.format || '.XMP & .DNG'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Download className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Includes</p>
                  <p className="font-medium">{product.preset_count || 10} Presets</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-white">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="font-medium">Secure Checkout</span>
              </div>
              <p className="text-sm text-gray-400">
                Your payment information is processed securely. You will receive an instant download link via email after purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
