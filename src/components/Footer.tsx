import React from 'react';
import { ArrowUp, Code2, Heart } from 'lucide-react';
import { sound } from '../services/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.08] pt-16 pb-12 overflow-hidden relative">
      {/* Ghost Typography Watermark (Decorative - aria-hidden for a11y) */}
      <div 
        aria-hidden="true" 
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[18vw] font-display font-black text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none whitespace-nowrap"
      >
        ARCADEX
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-white text-black font-display font-black text-xs flex items-center justify-center rounded-[1px]">
                A
              </div>
              <span className="font-display font-bold text-white tracking-tight">ARCADEX</span>
              <span className="text-[9px] font-mono text-zinc-300 px-1.5 py-0.5 bg-white/[0.1] rounded-[1px]">
                V1.0
              </span>
            </div>
            <p className="text-xs font-sans text-zinc-300 max-w-sm leading-relaxed mb-4">
              A bespoke, zero-latency cognitive suite developed with the Midnight Editorial design system. 
              Pure digital luxury and cognitive clarity.
            </p>
            <div className="font-mono text-[10px] text-cyan-400 tracking-wider">
              DEVELOPED & CREATED BY ISHANT GUPTA
            </div>
          </div>

          {/* Architecture Details */}
          <div>
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.2em] block mb-3">
              STACK TECH
            </span>
            <ul className="space-y-1.5 font-mono text-xs text-zinc-300">
              <li>• React 19 Engine</li>
              <li>• Native Web Audio API</li>
              <li>• Vite Fast-Bundler</li>
              <li>• 60 FPS CSS Hardware Transforms</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col justify-between items-start md:items-end">
            <div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.2em] block mb-3">
                INTEGRITY
              </span>
              <div className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% CLIENT COMPUTE
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-white hover:text-black border border-white/[0.15] font-mono text-xs text-white transition-all rounded-[2px]"
            >
              BACK TO TOP <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-400 tracking-wider">
          <span>© 2026 ARCADEX COGNITIVE STUDIO. ALL RIGHTS RESERVED.</span>
          <span>DEVELOPED & CREATED BY ISHANT GUPTA</span>
        </div>
      </div>
    </footer>
  );
};
