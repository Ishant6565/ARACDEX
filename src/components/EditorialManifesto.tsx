import React from 'react';
import { Terminal, Shield, Zap, Cpu } from 'lucide-react';

export const EditorialManifesto: React.FC = () => {
  return (
    <section id="manifesto" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-b border-white/[0.08]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Heading */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase block mb-3">
              // PHILOSOPHY & BLUEPRINT
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tighter leading-tight">
              ZERO SLOP. ZERO CLOUD DEPENDENCY.
            </h2>
          </div>

          <div className="mt-8 p-4 bg-[#080808] border border-white/[0.08] rounded-[2px] font-mono text-xs text-white/50 space-y-2">
            <div className="flex items-center gap-2 text-white">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>CORE RUNTIME SPECIFICATION</span>
            </div>
            <p>Framework: React 19 + TypeScript + Tailwind</p>
            <p>Acoustic Engine: Web Audio API Oscillator (0KB MP3s)</p>
            <p>Rendering: Hardware Accelerated CSS3 & SVG</p>
          </div>
        </div>

        {/* Right Column: Narrative Grid */}
        <div className="lg:col-span-7 space-y-8 font-sans text-white/70 leading-relaxed">
          <p className="text-lg sm:text-xl font-light text-white leading-relaxed">
            Modern puzzle applications have degenerated into ad-infested, laggy freemium traps. 
            <strong className="font-semibold text-white"> ARCADEX</strong> is an architectural rebellion. 
            Designed as a high-contrast editorial suite, each logic game executes 100% locally with immediate acoustic response.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-mono text-xs">
            <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
              <div className="text-white font-bold mb-1 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                TACTILE HARDWARE FEEL
              </div>
              <p className="text-white/50 text-[11px] leading-normal">
                Every swipe, keypress, and number entry triggers a micro-synthesizer tone generated directly by your browser's audio processor.
              </p>
            </div>

            <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
              <div className="text-white font-bold mb-1 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                SOVEREIGN DATA
              </div>
              <p className="text-white/50 text-[11px] leading-normal">
                Your brain streaks and cognitive scores are stored directly in your browser's local sandbox. No telemetry, no accounts required.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-white/[0.08] font-mono text-[10px] text-white/40 uppercase">
            <span>STUDIO ARCADEX // ISHANT VERIFIED</span>
            <span>BUILD 2026.09.1</span>
          </div>
        </div>
      </div>
    </section>
  );
};
