import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Activity, Award, CheckCircle, Layers, Trophy } from 'lucide-react';

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
  const [level, setLevel] = useState<number>(() => getGameLevel('corsi'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const spanLength = useMemo(() => {
    return 3 + Math.min(12, Math.floor((level - 1) / 8));
  }, [level]);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('OBSERVE SEQUENCE');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [victory, setVictory] = useState<boolean>(false);
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const generateAndPlaySequence = useCallback((curLvl: number, len: number) => {
    clearAllTimeouts();
    setIsShowingSequence(true);
    setPlayerInput([]);
    setStatusMessage('OBSERVE SEQUENCE');
    setGameOver(false);
    setVictory(false);

    const newSeq: number[] = [];
    for (let i = 0; i < len; i++) {
      newSeq.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSeq);

    const pace = Math.max(300, 650 - (curLvl - 1) * 3.5);

    // Play sequence with audio-visual pulses
    newSeq.forEach((blockId, idx) => {
      const t1 = window.setTimeout(() => {
        setActiveHighlight(blockId);
        sound.playNote(FREQUENCIES[blockId], 0.22);
        const t2 = window.setTimeout(() => {
          setActiveHighlight(null);
          if (idx === newSeq.length - 1) {
            setIsShowingSequence(false);
            setStatusMessage('REPLICATE SEQUENCE');
          }
        }, pace * 0.55);
        timeoutsRef.current.push(t2);
      }, (idx + 1) * pace);
      timeoutsRef.current.push(t1);
    });
  }, [clearAllTimeouts]);

  useEffect(() => {
    generateAndPlaySequence(level, spanLength);
  }, [level, spanLength, generateAndPlaySequence]);

  const handleBlockClick = (blockId: number) => {
    if (isShowingSequence || gameOver || victory) return;

    sound.playNote(FREQUENCIES[blockId], 0.15);
    setActiveHighlight(blockId);
    const t = window.setTimeout(() => setActiveHighlight(null), 200);
    timeoutsRef.current.push(t);

    const nextExpected = sequence[playerInput.length];
    if (blockId === nextExpected) {
      const updatedInput = [...playerInput, blockId];
      setPlayerInput(updatedInput);

      if (updatedInput.length === sequence.length) {
        // Success!
        sound.playSuccess();
        setStatusMessage('SEQUENCE SYNCHRONIZED');
        setVictory(true);
        const score = 100 * level + spanLength * 25;
        recordGameWin('corsi', score, 'CORSI BLOCKS', level);
        onComplete?.(score);
      }
    } else {
      // Mistake
      sound.playDefeat();
      setStatusMessage('COGNITIVE DESYNC');
      setGameOver(true);
    }
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('corsi', nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('corsi', targetLvl);
    setShowLevelPicker(false);
  };

  const restartCurrentLevel = () => {
    sound.playClick();
    generateAndPlaySequence(level, spanLength);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 08</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CORSI SPAN <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowLevelPicker(true)}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer transition-all"
            title="Select from 100 levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level}/100</span>
          </button>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">SPAN</span>
            <span className="text-sm font-bold text-cyan-400">{spanLength} BLOCKS</span>
          </div>
          <button
            onClick={restartCurrentLevel}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action / Status Bar */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-white/50">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-bold">{statusMessage}</span>
        </div>
        <span className="text-cyan-400 font-bold">
          {playerInput.length}/{spanLength} STEPS
        </span>
      </div>

      {/* Spatial Board */}
      <div className="relative w-full aspect-square max-w-[340px] bg-[#070707] border border-cyan-500/30 rounded-[2px] overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {/* Spatial background grid lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-cyan-400/20" />
          ))}
        </div>

        {BLOCKS.map(block => {
          const isHighlighted = activeHighlight === block.id;

          return (
            <button
              key={block.id}
              onClick={() => handleBlockClick(block.id)}
              disabled={isShowingSequence || gameOver || victory}
              style={{
                left: `${block.x}%`,
                top: `${block.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-12 h-12 rounded-[2px] flex items-center justify-center font-mono text-xs transition-all duration-100 ${
                isHighlighted
                  ? 'bg-cyan-400 border-cyan-300 text-black scale-110 shadow-[0_0_25px_rgba(34,211,238,0.9)] z-10 font-bold'
                  : 'bg-[#121212] border border-white/20 text-white/40 hover:border-cyan-400/50 hover:bg-[#1a1a1a] active:scale-95'
              }`}
            >
              {block.id + 1}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[340px] h-1.5 bg-[#151515] border border-white/[0.08] mt-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${(playerInput.length / spanLength) * 100}%` }}
        />
      </div>

      {/* Victory Banner */}
      {victory && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-[340px] text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> SPATIAL SEQUENCE SYNCHRONIZED!
          </div>
          <p className="text-white/60 mb-3">LEVEL {level} OF 100 REPLICATED WITH HIGH FIDELITY.</p>
          <div className="flex gap-2">
            <button
              onClick={restartCurrentLevel}
              className="flex-1 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white/10 rounded-[2px]"
            >
              REPLAY
            </button>
            <button
              onClick={advanceNextLevel}
              className="flex-1 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              NEXT LEVEL ({level < 100 ? level + 1 : 100})
            </button>
          </div>
        </div>
      )}

      {/* Game Over Banner */}
      {gameOver && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-[2px] w-full max-w-[340px] text-center font-mono text-xs text-white">
          <div className="text-red-400 font-bold mb-2">SEQUENCE FRACTURE</div>
          <p className="text-white/60 mb-3">LEVEL {level} SEQUENCE NOT MATCHED.</p>
          <button
            onClick={restartCurrentLevel}
            className="px-6 py-2 bg-white text-black font-bold uppercase rounded-[2px]"
          >
            RETRY LEVEL {level}
          </button>
        </div>
      )}

      {/* 100 Levels Picker Modal */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-500/40 rounded-[2px] p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// ARCHIVAL SELECTION</span>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT CORSI LEVEL
                  </h3>
                </div>
                <button
                  onClick={() => setShowLevelPicker(false)}
                  className="px-2.5 py-1 text-xs font-mono text-white/50 hover:text-white border border-white/10 rounded-[2px]"
                >
                  ESC
                </button>
              </div>

              <p className="text-xs font-mono text-white/60 mb-3 shrink-0">
                100 tiered spatial sequence levels with accelerating pulses and extended memory spans.
              </p>

              <div className="grid grid-cols-10 gap-1.5 overflow-y-auto pr-1 py-1 max-h-[50vh] font-mono text-xs flex-1 min-h-0">
                {Array.from({ length: 100 }, (_, i) => i + 1).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => selectLevel(lvl)}
                    className={`h-9 rounded-[2px] flex items-center justify-center text-xs font-bold border transition-all ${
                      level === lvl
                        ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.7)]'
                        : 'bg-[#141414] text-white/70 hover:text-white border-white/[0.08] hover:border-cyan-400/50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono text-white/40 shrink-0">
                <span>ACTIVE: LEVEL {level}</span>
                <button
                  onClick={() => setShowLevelPicker(false)}
                  className="px-4 py-1.5 bg-white text-black font-bold uppercase rounded-[2px]"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
