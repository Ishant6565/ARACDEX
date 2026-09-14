import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Cpu, Lock, CheckCircle } from 'lucide-react';
import { sound } from '../services/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in select-none p-3 sm:p-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
        <div className="relative w-full max-w-xl bg-[#09090b] border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden my-auto">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-48 h-28 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white tracking-tight">PRIVACY & POLICY</h3>
                <p className="text-[10px] font-mono text-cyan-400">DATA SOVEREIGNTY // ARCHITECTURE // INTEGRITY</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0 text-xs font-mono">
            {/* Privacy Commitments */}
            <div className="p-4 bg-white/[0.02] border border-cyan-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Lock className="w-4 h-4" />
                <span className="font-display tracking-tight text-sm text-white">DATA SOVEREIGNTY & PRIVACY</span>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                ARCADEX is engineered under a strict zero-telemetry philosophy. We value your privacy and believe that arcade games should respect player sovereignty.
              </p>
              <ul className="space-y-2 text-white/70 font-sans text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Client-Side Compute:</strong> Game physics, AI logic, and randomizers run entirely on your device with zero cloud dependency.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Third-Party Trackers:</strong> No marketing cookies, no advertisement trackers, and no third-party telemetry data collection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Local-First Storage:</strong> High scores, streak matrices, and level achievements are safely stored on your device via HTML5 localStorage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Optional Encrypted Cloud Sync:</strong> If you connect with Google or a Custom ID, your progress syncs securely via Supabase RLS policies.</span>
                </li>
              </ul>
            </div>

            {/* System Tech Stack */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Cpu className="w-4 h-4" />
                <span className="font-display tracking-tight text-sm text-white">SYSTEM ARCHITECTURE SPECIFICATIONS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 bg-[#0e0e12] border border-white/[0.06] rounded-lg">
                  <span className="text-white/40 block text-[9px]">ENGINE</span>
                  <span className="text-cyan-300 font-bold">React 19 Concurrent</span>
                </div>
                <div className="p-2.5 bg-[#0e0e12] border border-white/[0.06] rounded-lg">
                  <span className="text-white/40 block text-[9px]">AUDIO SYNTHESIZER</span>
                  <span className="text-cyan-300 font-bold">Web Audio API (0ms Lag)</span>
                </div>
                <div className="p-2.5 bg-[#0e0e12] border border-white/[0.06] rounded-lg">
                  <span className="text-white/40 block text-[9px]">BUNDLER</span>
                  <span className="text-cyan-300 font-bold">Vite 6 Fast Pipeline</span>
                </div>
                <div className="p-2.5 bg-[#0e0e12] border border-white/[0.06] rounded-lg">
                  <span className="text-white/40 block text-[9px]">TRANSFORMS</span>
                  <span className="text-cyan-300 font-bold">60-120 FPS GPU Render</span>
                </div>
              </div>
            </div>

            {/* Creator Credit & Licensing */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-widest block">CREATOR & ENGINEER</span>
                <span className="font-display font-bold text-sm text-white block">ISHANT GUPTA</span>
                <span className="text-[10px] text-white/50 block font-sans">Released under MIT Open Source License // 2026</span>
              </div>
              <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/40 rounded text-cyan-300 font-bold text-[10px]">
                ARCADEX V1.0
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-display text-xs tracking-wider rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
