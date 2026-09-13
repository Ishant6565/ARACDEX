import React from 'react';
import { ArrowDown, Play, Sparkles, Terminal } from 'lucide-react';
import { sound } from '../services/audio';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Light Leaks */}
      <div className="light-leak-amber" />
      <div className="light-leak-blue" />

      {/* Top Editorial Metadata Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-white/50 uppercase">
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

      {/* Main Visual Centerpiece & Massive Typography */}
      <div className="my-auto py-8 relative flex flex-col items-center justify-center text-center">
        {/* Massive Background Typography */}
        <h1 className="text-[13vw] font-display font-extrabold tracking-tighter text-white leading-none select-none pointer-events-none opacity-90 drop-shadow-2xl">
          ARCADEX
        </h1>

        {/* Overlapping Hero Monolith Visual Container */}
        <div className="relative -mt-[6vw] sm:-mt-[8vw] z-10 w-full max-w-2xl px-4 group">
          <div className="relative border border-white/20 bg-black/60 backdrop-blur-md rounded-[2px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-[1.01]">
            <img
              src="/hero_monolith.jpg"
              alt="ARCADEX Monolith Core"
              className="w-full h-48 sm:h-72 object-cover object-center rounded-[1px] brightness-95 contrast-110 filter"
              loading="eager"
            />
            {/* Tech overlay badge on image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-widest text-white/80 uppercase bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-[1px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-amber-400" />
                NEURAL ARTIFACT // COGNITIVE REPOSITORY
              </span>
              <span className="text-white/50">6 PROTOCOLS LOADED</span>
            </div>
          </div>
        </div>

        {/* Tagline & Subheading */}
        <div className="mt-8 max-w-xl mx-auto z-10 px-4">
          <p className="text-sm sm:text-base text-white/70 font-sans font-light leading-relaxed">
            A bespoke, lag-free cognitive arcade blending high-end fashion editorial aesthetics with 
            pure mathematical rigor. Synthesized in real-time. Zero fluff.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 z-10">
          <button
            onClick={() => {
              sound.playClick();
              onStartClick();
            }}
            className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            ENTER MATRIX
          </button>
          <a
            href="#catalog"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#0d0d0d] hover:bg-[#151515] border border-white/[0.12] text-white font-mono text-xs uppercase tracking-widest transition-all rounded-[2px]"
          >
            EXPLORE PROTOCOLS
          </a>
        </div>
      </div>

      {/* Bottom Scroll Anchor */}
      <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[10px] text-white/40 uppercase tracking-widest">
        <span>PRESS SPACE OR ARROW KEYS TO NAVIGATE</span>
        <a href="#catalog" className="flex items-center gap-1 hover:text-white transition-colors">
          SCROLL TO CATALOG <ArrowDown className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
};
