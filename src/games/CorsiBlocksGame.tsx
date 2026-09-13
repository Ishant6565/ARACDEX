import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Activity, Award, CheckCircle } from 'lucide-react';

const FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];

// 9 spatial positions spread across canvas
const BLOCKS = [
  { id: 0, x: 15, y: 15 },
  { id: 1, x: 50, y: 20 },
  { id: 2, x: 80, y: 15 },
  { id: 3, x: 25, y: 50 },
  { id: 4, x: 55, y: 55 },
  { id: 5, x: 85, y: 50 },
  { id: 6, x: 18, y: 82 },
  { id: 7, x: 48, y: 85 },
  { id: 8, x: 78, y: 80 },
];

export const CorsiBlocksGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [spanLength, setSpanLength] = useState<number>(4);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('OBSERVE SEQUENCE');
  const [bestSpan, setBestSpan] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_corsi') || '4');
  });
  const [gameOver, setGameOver] = useState<boolean>(false);

  const generateAndPlaySequence = useCallback((length: number) => {
    setIsShowingSequence(true);
    setPlayerInput([]);
    setStatusMessage('OBSERVE SEQUENCE');

    const newSeq: number[] = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSeq);

    // Play sequence with audio-visual pulses
    newSeq.forEach((blockId, idx) => {
      setTimeout(() => {
        setActiveHighlight(blockId);
        sound.playNote(FREQUENCIES[blockId], 0.25);
        setTimeout(() => {
          setActiveHighlight(null);
          if (idx === newSeq.length - 1) {
            setIsShowingSequence(false);
            setStatusMessage('REPLICATE SEQUENCE');
          }
        }, 350);
      }, (idx + 1) * 650);
    });
  }, []);

  useEffect(() => {
    generateAndPlaySequence(4);
  }, [generateAndPlaySequence]);

  const handleBlockClick = (blockId: number) => {
    if (isShowingSequence || gameOver) return;

    sound.playNote(FREQUENCIES[blockId], 0.15);
    setActiveHighlight(blockId);
    setTimeout(() => setActiveHighlight(null), 200);

    const nextExpected = sequence[playerInput.length];
    if (blockId === nextExpected) {
      const updatedInput = [...playerInput, blockId];
      setPlayerInput(updatedInput);

      if (updatedInput.length === sequence.length) {
        // Success!
        sound.playSuccess();
        setStatusMessage('SEQUENCE SYNCHRONIZED');
        const nextSpan = spanLength + 1;
        setSpanLength(nextSpan);
        if (nextSpan > bestSpan) {
          setBestSpan(nextSpan);
          localStorage.setItem('arcadex_best_corsi', String(nextSpan));
        }
        recordGameWin('corsi', nextSpan);
        onComplete?.(nextSpan);

        setTimeout(() => {
          generateAndPlaySequence(nextSpan);
        }, 1000);
      }
    } else {
      // Mistake
      sound.playError();
      setStatusMessage('COGNITIVE DESYNC');
      setGameOver(true);
    }
  };

  const restart = () => {
    sound.playClick();
    setSpanLength(4);
    setGameOver(false);
    generateAndPlaySequence(4);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 06</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CORSI SPAN <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">SPATIAL</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">SPAN</span>
            <span className="text-sm font-bold text-amber-400">{spanLength}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">BEST</span>
            <span className="text-sm font-bold text-white">{bestSpan}</span>
          </div>
          <button
            onClick={restart}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-3 py-1.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] font-mono text-xs">
        <span className="text-white/60 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" /> {statusMessage}
        </span>
        <span className="text-white/40">{playerInput.length} / {sequence.length}</span>
      </div>

      {/* Spatial Field */}
      <div className="relative w-full aspect-square bg-[#070707] border border-white/20 rounded-[2px] shadow-2xl overflow-hidden">
        {/* Subtle coordinate lines */}
        <div className="absolute inset-0 bg-grid-editorial pointer-events-none" />

        {BLOCKS.map(block => {
          const isActive = activeHighlight === block.id;
          return (
            <button
              key={block.id}
              onClick={() => handleBlockClick(block.id)}
              disabled={isShowingSequence || gameOver}
              style={{
                left: `${block.x}%`,
                top: `${block.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-14 h-14 rounded-[2px] border transition-all duration-150 flex items-center justify-center font-mono text-xs ${
                isActive
                  ? 'bg-amber-400 border-amber-300 text-black scale-110 shadow-[0_0_25px_rgba(245,158,11,0.8)] z-10 font-bold'
                  : 'bg-[#121212] hover:bg-[#1c1c1c] border-white/20 text-white/40'
              }`}
            >
              {block.id + 1}
            </button>
          );
        })}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-1">SEQUENCE BREACH</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">MAX SPAN: {spanLength - 1}</h3>
            <p className="text-xs font-mono text-white/50 mb-6">Adult average spatial memory span is 5.4.</p>
            <button
              onClick={restart}
              className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px]"
            >
              RE-ATTEMPT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
