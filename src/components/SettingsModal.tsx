import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, VolumeX, Music, Smartphone, Sparkles, Sliders, RotateCcw, Check } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [bgmVol, setBgmVol] = useState<number>(() => Math.round(sound.getBgmVolume() * 100));
  const [sfxVol, setSfxVol] = useState<number>(() => Math.round(sound.getSfxVolume() * 100));
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => sound.enabled);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => haptics.isEnabled());
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(() => sound.isBgmPlaying);
  const [copiedReset, setCopiedReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleBgmSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBgmVol(val);
    sound.setBgmVolume(val / 100);
  };

  const handleSfxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    sound.setSfxVolume(val / 100);
  };

  const handleToggleSfx = () => {
    const next = sound.toggleSound();
    setSfxEnabled(next);
  };

  const handleToggleBgm = () => {
    const next = sound.toggleBGM();
    setIsBgmPlaying(next);
    sound.playClick();
  };

  const handleToggleHaptics = () => {
    const next = haptics.toggle();
    setHapticsEnabled(next);
    if (next) {
      haptics.medium();
    }
  };

  const handleTestHaptics = () => {
    haptics.streak();
    sound.playStreak();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in select-none p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
        <div className="relative w-full max-w-md bg-[#0a0a0c] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden my-auto">
          {/* Glow Ambient */}
          <div className="absolute top-0 right-1/4 w-40 h-24 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Header (Always Visible at top) */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-sans text-white tracking-tight">SYSTEM SETTINGS</h3>
                <p className="text-[10px] font-mono text-cyan-400">AUDIO // HAPTICS // CALIBRATION</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0">
          {/* Background Music (BGM) Controls */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white font-display tracking-tight">BACKGROUND MUSIC</span>
              </div>
              <button
                onClick={handleToggleBgm}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                  isBgmPlaying
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-white/10 text-white/50 hover:text-white'
                }`}
              >
                {isBgmPlaying ? 'PLAYING' : 'PAUSED'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60 font-mono">
                <span>VOLUME</span>
                <span className="text-cyan-400">{bgmVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVol}
                onChange={handleBgmSlider}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Sound Effects (SFX) Controls */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
                <span className="text-sm font-bold text-white font-display tracking-tight">SOUND EFFECTS (SFX)</span>
              </div>
              <button
                onClick={handleToggleSfx}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                  sfxEnabled
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-white/10 text-white/50 hover:text-white'
                }`}
              >
                {sfxEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60 font-mono">
                <span>MASTER VOLUME</span>
                <span className="text-cyan-400">{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={handleSfxSlider}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Mobile Haptic Feedback */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-display tracking-tight">MOBILE HAPTICS</p>
                <p className="text-[10px] text-white/50">Tactile physical phone vibration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestHaptics}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white/60 hover:text-white font-mono"
                title="Trigger test vibration pulse"
              >
                TEST
              </button>
              <button
                onClick={handleToggleHaptics}
                className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider transition-all ${
                  hapticsEnabled
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {hapticsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* System Telemetry & Performance Info */}
          <div className="p-3 bg-[#0e0e12] border border-cyan-500/20 rounded-xl text-xs space-y-1 font-mono text-white/70">
            <div className="flex justify-between">
              <span className="text-white/40">TYPOGRAPHY:</span>
              <span className="text-cyan-300 font-bold">SUPERCELL CLASH (ACTIVE)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">OFFLINE PWA:</span>
              <span className="text-green-400">READY // CACHE INSTALLED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">PROTOCOLS:</span>
              <span className="text-white">13 ACTIVE // 100+ LEVELS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-display text-xs tracking-wider rounded-xl transition-transform active:scale-95"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
  );
};


