import React from 'react';
import { ArrowDown, Play, Terminal, Sparkles, Layers } from 'lucide-react';
import { sound } from '../services/audio';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[88vh] flex flex-col justify-between pt-[calc(7rem+env(safe-area-inset-top,0px))] sm:pt-[calc(9rem+env(safe-area-inset-top,0px))] pb-12 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden select-none">
      {/* Atmospheric Light Leaks (Electric Cyan & Neon Blue) */}
      <div className="light-leak-cyan" />
      <div className="light-leak-blue" />

      {/* Main Centerpiece: ARCADEX with central Play button */}
      <div className="my-auto py-12 relative flex flex-col items-center justify-center text-center z-20">
        {/* ARCADEX Main Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-clash font-bold tracking-wide text-white leading-none select-none max-w-full px-2 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]">
          ARCADEX
        </h1>

        {/* Central Glowing Arcade Play Button */}
        <div className="mt-12 flex flex-col items-center justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onStartClick();
            }}
            className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-400 text-black shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:shadow-[0_0_75px_rgba(6,182,212,1)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Play Games"
            title="Play Games"
          >
            {/* Pulsing Outer Neon Ring */}
            <span className="absolute -inset-1.5 rounded-full border-2 border-cyan-400/50 animate-ping pointer-events-none" />
            <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-black translate-x-0.5 group-hover:scale-105 transition-transform" />
          </button>
          <span className="mt-4 font-mono font-bold text-xs sm:text-sm uppercase tracking-[0.3em] text-cyan-400 group-hover:text-cyan-300">
            PLAY NOW
          </span>
        </div>
      </div>

      {/* Bottom Scroll Anchor */}
      <div className="flex items-center justify-between border-t border-white/[0.12] pt-4 font-mono text-[10px] text-zinc-300 uppercase tracking-widest z-10 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-[2px]">
        <span className="hidden sm:inline">PRESS SPACE OR ARROW KEYS TO NAVIGATE</span>
        <span className="sm:hidden">TOUCH TO EXPLORE // 13 PROTOCOLS</span>
        <a href="#catalog" className="flex items-center gap-1.5 hover:text-white transition-colors text-cyan-400">
          SCROLL TO GAMES <ArrowDown className="w-3 h-3 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
