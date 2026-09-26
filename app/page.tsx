"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, SlidersHorizontal, ChevronRight, CheckCircle2 } from "lucide-react";
import { getPresets, Preset } from "./lib/store";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self";
      }) => void;
    };
  }
}

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

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      className="relative w-full aspect-[4/5] sm:aspect-video rounded-2xl overflow-hidden cursor-ew-resize group shadow-2xl"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* After Image (Base) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={afterSrc} 
        alt="After edit" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* Before Image (Overlay) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={beforeSrc} 
          alt="Before edit" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transform -translate-x-1/2"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
          <SlidersHorizontal className="w-4 h-4 text-gray-900" />
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
        AFTER
      </div>
    </div>
  );
}

export default function Home() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  useEffect(() => {
    async function loadPresets() {
      const data = await getPresets();
      setPresets(data);
    }
    loadPresets();
  }, []);

  const buyPreset = async (presetId: string) => {
    try {
      setLoadingPayment(presetId);

      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presetId })
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.paymentSessionId || !data.environment) {
        throw new Error(data.error || "Unable to create order");
      }

      const { paymentSessionId, environment } = data;

      const existingScript = document.querySelector(
        'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
      );

      const startCheckout = () => {
        const CashfreeCheckout = window.Cashfree;
        if (!CashfreeCheckout) {
          throw new Error("Cashfree Checkout did not initialize");
        }

        const cashfree = CashfreeCheckout({
          mode: environment,
        });

        cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      };

      if (existingScript) {
        startCheckout();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => startCheckout();
      script.onerror = () => {
        alert("Unable to load Cashfree Checkout.");
        setLoadingPayment(null);
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong");
      setLoadingPayment(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Luma<span className="text-white/50">Presets</span></span>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="space-y-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Elevate your photography in one click.
            </h1>
            <p className="text-lg text-gray-400">
              Discover professional Lightroom presets created by top photographers. Slide to see the magic, buy securely with Cashfree.
            </p>
          </div>

          <div className="grid gap-16">
            {presets.map((preset) => (
              <div key={preset.id} className="grid lg:grid-cols-2 gap-12 items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 border border-indigo-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Verified Creator
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{preset.name}</h2>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {preset.description}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 font-medium">Price</span>
                      <span className="text-3xl font-bold">₹{preset.price}</span>
                    </div>
                    
                    <button
                      onClick={() => buyPreset(preset.id)}
                      disabled={loadingPayment === preset.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed h-14 rounded-2xl font-bold text-lg transition-colors"
                    >
                      {loadingPayment === preset.id ? (
                        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>Get this preset <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    Secured by <img src="https://cashfreelogo.cashfree.com/cashfree-dark.png" alt="Cashfree" className="h-4 opacity-50 grayscale" />
                  </p>
                </div>
                
                <div className="order-1 lg:order-2">
                  <ImageSlider beforeSrc={preset.beforeImg} afterSrc={preset.afterImg} />
                </div>
              </div>
            ))}
            
            {presets.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No presets found. Check back later!
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
