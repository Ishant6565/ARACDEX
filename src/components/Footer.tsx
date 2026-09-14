import React, { useState } from 'react';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { sound } from '../services/audio';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export const Footer: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-[#0a0a0a] border-t border-white/[0.08] pt-14 pb-10 overflow-hidden relative select-none">
        {/* Ghost Typography Watermark (Decorative) */}
        <div 
          aria-hidden="true" 
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[18vw] font-display font-black text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none whitespace-nowrap"
        >
          ARCADEX
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          {/* Central Creator Attribution */}
          <div className="mb-2">
            <div className="font-display font-black text-base sm:text-xl tracking-wider text-white">
              DEVELOPED & CREATED BY <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">ISHANT GUPTA</span>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-white/40 tracking-[0.25em] uppercase mt-1">
              ZERO-LATENCY COGNITIVE ARCADE & MATRIX ARCHITECTURE
            </p>
          </div>

          {/* Action Buttons: Privacy Policy + Back to Top */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-6 font-mono text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setIsPrivacyOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-cyan-500/10 border border-white/[0.15] hover:border-cyan-400/50 text-zinc-300 hover:text-cyan-300 rounded-[2px] transition-all active:scale-95 shadow-sm"
              title="View Data Privacy Policy & System Specs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRIVACY & POLICY</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-white hover:text-black border border-white/[0.15] font-mono text-xs text-zinc-300 transition-all rounded-[2px] active:scale-95"
              title="Return to Top"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="pt-6 border-t border-white/[0.06] w-full flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-zinc-500 tracking-wider">
            <span>© 2026 ARCADEX COGNITIVE STUDIO. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-2 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% CLIENT COMPUTE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy & System Architecture Modal */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
};
