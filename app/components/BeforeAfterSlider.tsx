"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  title?: string;
  aspectRatio?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  title,
  aspectRatio = "aspect-[4/5]",
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(offsetX, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setSliderPosition(percentage);
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    calculatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full ${aspectRatio} rounded-3xl overflow-hidden cursor-ew-resize select-none bg-[#0a0a0a] border border-white/10 shadow-2xl ${className}`}
      style={{ touchAction: isDragging ? "none" : "pan-y" }}
    >
      {/* 1. After image (Full background layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={title ? `${title} after preset` : "After edit"}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        loading="lazy"
        draggable={false}
      />

      {/* 2. Before image (Clipped with instant 0ms hardware accelerated CSS clip-path) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={title ? `${title} before preset` : "Before edit"}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none will-change-[clip-path]"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
        loading="lazy"
        draggable={false}
      />

      {/* 3. Slider Divider Line & Handle (Zero CSS transition delay for instant 120fps tracking) */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white pointer-events-none transform -translate-x-1/2 shadow-[0_0_12px_rgba(0,0,0,0.8)] will-change-transform"
        style={{ left: `${sliderPosition}%` }}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-black/20 ${
            isDragging ? "scale-110" : ""
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-black" />
        </div>
      </div>

      {/* 4. Overlay Labels */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
        Original (RAW)
      </div>
      <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/20 pointer-events-none">
        LUMA Preset
      </div>
    </div>
  );
}
