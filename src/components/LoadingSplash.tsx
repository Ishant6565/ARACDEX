import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Zap, Sparkles } from 'lucide-react';

const DIAGNOSTICS = [
  'INITIALIZING NEURAL SUITE // PROTOCOL V1.0',
  'CALIBRATING SPATIAL LOGIC MATRICES...',
  'CONNECTING SUPABASE EDGE NETWORK...',
  'SYNTHESIZING 100-LEVEL ARCHIVES...',
  'SYSTEM ONLINE // READY FOR OPERATOR',
];

export const LoadingSplash: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [progress, setProgress] = useState<number>(0);
  const [diagIndex, setDiagIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFading(true);
          setTimeout(onFinish, 400);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const bounded = Math.min(100, next);
        const idx = Math.min(
          DIAGNOSTICS.length - 1,
          Math.floor((bounded / 100) * DIAGNOSTICS.length)
        );
        setDiagIndex(idx);
        return bounded;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#050507] flex flex-col items-center justify-center select-none transition-opacity duration-400 p-6 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Glowing Monolith Logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-[4px] bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center font-display font-black text-3xl shadow-[0_0_40px_rgba(6,182,212,0.8)] animate-pulse">
            A
          </div>
          <div className="absolute -inset-2 rounded-[6px] border border-cyan-400/40 animate-ping pointer-events-none" />
        </div>

        {/* Brand Typography */}
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-widest text-white mb-1">
          ARCADEX
        </h1>
        <p className="font-mono text-[10px] text-cyan-400/80 tracking-[0.3em] uppercase mb-8">
          COGNITIVE SUITE & MATRIX OPERATOR
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#111116] border border-white/[0.12] p-1 rounded-[3px] mb-3 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <div
            className="h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 rounded-[2px] transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress & Diagnostics readout */}
        <div className="w-full flex items-center justify-between font-mono text-[11px] text-white/50 mb-4 px-0.5">
          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Terminal className="w-3 h-3 text-cyan-400 animate-pulse" />
            LOADING MATRIX
          </span>
          <span className="text-cyan-400 font-bold tracking-wider">{progress}%</span>
        </div>

        {/* Diagnostic Status Line */}
        <div className="h-6 flex items-center justify-center">
          <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase animate-fade-in truncate">
            {DIAGNOSTICS[diagIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};
