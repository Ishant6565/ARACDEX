import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Volume2, Trophy, Award } from 'lucide-react';

const PADS = [
  { id: 0, color: 'bg-amber-400', active: 'bg-amber-300 shadow-[0_0_35px_rgba(251,191,36,1)]', freq: 329.63, name: 'AMBER' },
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-400 shadow-[0_0_35px_rgba(96,165,250,1)]', freq: 261.63, name: 'COBALT' },
  { id: 2, color: 'bg-emerald-500', active: 'bg-emerald-400 shadow-[0_0_35px_rgba(52,211,153,1)]', freq: 392.00, name: 'EMERALD' },
  { id: 3, color: 'bg-rose-500', active: 'bg-rose-400 shadow-[0_0_35px_rgba(244,63,94,1)]', freq: 523.25, name: 'CRIMSON' },
];

export const SimonGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_simon') || '0');
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const playPad = (padId: number, duration = 0.25) => {
    setActivePad(padId);
    sound.playNote(PADS[padId].freq, duration);
    setTimeout(() => setActivePad(null), duration * 1000);
  };

  const playSequence = useCallback((seq: number[]) => {
    setIsPlayingSeq(true);
    seq.forEach((padId, index) => {
      setTimeout(() => {
        playPad(padId, 0.3);
        if (index === seq.length - 1) {
          setTimeout(() => setIsPlayingSeq(false), 350);
        }
      }, (index + 1) * 550);
    });
  }, []);

  const startNextRound = useCallback((currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  }, [playSequence]);

  const startGame = useCallback(() => {
    sound.playClick();
    setScore(0);
    setIsGameOver(false);
    startNextRound([]);
  }, [startNextRound]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handlePadClick = (padId: number) => {
    if (isPlayingSeq || isGameOver) return;

    playPad(padId, 0.2);

    if (padId === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Round Complete!
        const newScore = sequence.length;
        setScore(newScore);

        if (newScore > bestStreak) {
          setBestStreak(newScore);
          localStorage.setItem('arcadex_best_simon', String(newScore));
        }

        recordGameWin('simon', newScore);
        onComplete?.(newScore);

        setTimeout(() => {
          sound.playSuccess();
          setTimeout(() => startNextRound(sequence), 600);
        }, 300);
      }
    } else {
      // Mistake
      sound.playError();
      setIsGameOver(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 05</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SIMON RHYTHM <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">AUDIO</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">STREAK</span>
            <span className="text-base font-bold text-amber-400">{score}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">BEST</span>
            <span className="text-base font-bold text-white">{bestStreak}</span>
          </div>
          <button
            onClick={startGame}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs font-mono text-white/50 mb-4 w-full text-center">
        {isPlayingSeq ? 'OBSERVE & LISTEN TO HARMONIC SEQUENCE...' : 'YOUR TURN: REPEAT SEQUENCE'}
      </p>

      {/* 4 Quadrants Pad */}
      <div className="relative p-3 bg-[#080808] border border-white/20 rounded-[2px] grid grid-cols-2 gap-3 w-full aspect-square shadow-2xl">
        {PADS.map(pad => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad.id)}
              disabled={isPlayingSeq || isGameOver}
              className={`w-full h-full rounded-[2px] border border-white/20 transition-all duration-100 flex items-center justify-center font-mono text-xs font-bold ${
                isActive
                  ? pad.active + ' scale-102 text-black z-10'
                  : 'bg-[#141414] hover:bg-[#202020] text-white/40'
              }`}
            >
              {pad.name}
            </button>
          );
        })}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30">
            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase mb-1">RHYTHMIC DESYNC</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">SEQUENCE BROKEN</h3>
            <p className="text-xs font-mono text-white/50 mb-6">FINAL HARMONIC STREAK: {score}</p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px]"
            >
              RE-SYNC SEQUENCE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
