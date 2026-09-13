import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Smartphone, Check, X, Share2, PlusSquare } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      sound.playWin();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    sound.playClick();
    haptics.medium();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        sound.playWin();
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6 select-none">
      <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
        <div className="relative w-full max-w-md bg-[#0a0a0c] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden my-auto">
          {/* Glow ambient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon */}
          <div className="flex items-center gap-4 mb-4 shrink-0 pr-8">
            <div className="w-12 h-12 bg-[#111115] border border-cyan-400/40 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
              <img src="/icons/icon-192.png" alt="ARCADEX App Icon" className="w-9 h-9 rounded-lg object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans text-white tracking-tight leading-snug">INSTALL ARCADEX APP</h3>
              <p className="text-[10px] text-cyan-400 font-mono">STANDALONE COGNITIVE ARCADE</p>
            </div>
          </div>

          {/* Scrollable Modal Body */}
          <div className="overflow-y-auto pr-1 flex-1 min-h-0 space-y-4">

        {isInstalled ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-white font-bold text-base mb-1">APP ALREADY INSTALLED!</p>
            <p className="text-xs text-white/60">ARCADEX is running or installed on your device. Launch it directly from your home screen.</p>
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-4 text-sm text-white/80 py-2">
            <p className="text-xs text-white/60">To install on iPhone / iPad:</p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5 font-sans">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">1</span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share2 className="w-4 h-4 text-cyan-400 inline" /> <strong>Share</strong> button in Safari toolbar.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="flex items-center gap-1.5">
                  Scroll down and tap <PlusSquare className="w-4 h-4 text-cyan-400 inline" /> <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">3</span>
                <span>Open <strong>ARCADEX</strong> directly from your home screen without URL bars!</span>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Desktop Chrome / Edge Install Flow */
          <div className="space-y-4 py-2">
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Zero browser address bars (Native App full-screen experience)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Works 100% offline — play without active internet</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Instant launch with zero loading lag</span>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-display text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              INSTALL TO HOME SCREEN
            </button>
          </div>
        )}
        </div>

        {/* Footer (Always Visible at bottom) */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[11px] text-white/40 font-mono shrink-0">
          <span>VERSION 1.1 // STANDALONE READY</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="hover:text-white transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
  );
};


