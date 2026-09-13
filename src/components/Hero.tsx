import React from 'react';
import { ArrowDown, Play, Terminal } from 'lucide-react';
import { sound } from '../services/audio';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Ambient Atmospheric Light Leaks */}
      <div className="light-leak-amber" />
      <div className="light-leak-blue" />

      {/* Top Editorial Metadata Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-white/50 uppercase z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white">SYSTEM: ONLINE</span>
          <span className="text-white/30">|</span>
          <span>LATENCY: 0.0MS (CLIENT-SIDE)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>EDITION 01.2026</span>
          <span className="text-white/30">|</span>
          <span className="text-amber-400">ARCHITECT: ISHANT</span>
        </div>
      </div>

      {/* Main Centerpiece: Monolith in Background, ARCADEX fully unobstructed in Foreground */}
      <div className="my-auto py-12 relative flex flex-col items-center justify-center text-center">
        {/* Monolith Centerpiece Layered Behind (Background Layer) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
          <div className="relative w-full max-w-3xl aspect-[16/9] sm:aspect-[21/9] rounded-[2px] overflow-hidden opacity-30 filter blur-[0.5px] scale-105">
            <img
              src="/hero_monolith.jpg"
              alt=""
              className="w-full h-full object-cover object-center brightness-90 contrast-125"
            />
            {/* Atmospheric Vignette Gradients for seamless luxury blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-[#050505]/20" />
          </div>
        </div>

        {/* Foreground Content: 100% Unobstructed and Legible */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Studio Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/[0.15] rounded-[2px] font-mono text-[10px] sm:text-xs tracking-[0.25em] text-amber-400 uppercase mb-4 shadow-lg">
            <Terminal className="w-3 h-3" />
            NEURAL ARTIFACT // COGNITIVE REPOSITORY
          </div>

          {/* Massive ARCADEX Heading (Completely visible & clear) */}
          <h1 className="text-[15vw] sm:text-[13vw] font-display font-black tracking-tighter text-white leading-none select-none drop-shadow-[0_15px_40px_rgba(255,255,255,0.18)]">
            ARCADEX
          </h1>

          {/* Editorial Subtitle */}
          <p className="mt-6 max-w-xl text-sm sm:text-base text-white/80 font-sans font-light leading-relaxed px-4 drop-shadow-md">
            A bespoke, lag-free cognitive arcade blending high-end fashion editorial aesthetics with 
            pure mathematical rigor. 9 complete protocols synthesized in real-time. Zero fluff.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onStartClick();
              }}
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px] shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              ENTER MATRIX
            </button>
            <a
              href="#catalog"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.15] text-white font-mono text-xs uppercase tracking-widest transition-all rounded-[2px] hover:border-white/30"
            >
              EXPLORE 9 PROTOCOLS
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Anchor */}
      <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[10px] text-white/40 uppercase tracking-widest z-10">
        <span>PRESS SPACE OR ARROW KEYS TO NAVIGATE</span>
        <a href="#catalog" className="flex items-center gap-1 hover:text-white transition-colors">
          SCROLL TO CATALOG <ArrowDown className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
};
