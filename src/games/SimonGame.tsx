import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Volume2, Trophy, Award, Layers, CheckCircle } from 'lucide-react';

const ALL_PADS = [
  { id: 0, color: 'bg-cyan-400', active: 'bg-cyan-300 shadow-[0_0_35px_rgba(34,211,238,1)]', freq: 329.63, name: 'CYAN' },
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-400 shadow-[0_0_35px_rgba(96,165,250,1)]', freq: 261.63, name: 'COBALT' },
  { id: 2, color: 'bg-emerald-500', active: 'bg-emerald-400 shadow-[0_0_35px_rgba(52,211,153,1)]', freq: 392.00, name: 'EMERALD' },
  { id: 3, color: 'bg-rose-500', active: 'bg-rose-400 shadow-[0_0_35px_rgba(244,63,94,1)]', freq: 523.25, name: 'CRIMSON' },
  { id: 4, color: 'bg-amber-400', active: 'bg-amber-300 shadow-[0_0_35px_rgba(251,191,36,1)]', freq: 440.00, name: 'AMBER' },
  { id: 5, color: 'bg-purple-500', active: 'bg-purple-400 shadow-[0_0_35px_rgba(168,85,247,1)]', freq: 587.33, name: 'PURPLE' },
  { id: 6, color: 'bg-lime-400', active: 'bg-lime-300 shadow-[0_0_35px_rgba(163,230,53,1)]', freq: 659.25, name: 'LIME' },
  { id: 7, color: 'bg-fuchsia-500', active: 'bg-fuchsia-400 shadow-[0_0_35px_rgba(217,70,239,1)]', freq: 698.46, name: 'MAGENTA' },
  { id: 8, color: 'bg-orange-500', active: 'bg-orange-400 shadow-[0_0_35px_rgba(249,115,22,1)]', freq: 783.99, name: 'ORANGE' },
];

const getSimonConfig = (level: number) => {
  if (level <= 30) {
    return { count: 4, cols: 2, label: '2×2 (4 PADS)' };
  }
  if (level <= 65) {
    return { count: 6, cols: 3, label: '2×3 (6 PADS)' };
  }
  return { count: 9, cols: 3, label: '3×3 (9 PADS)' };
};

export const SimonGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('simon'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const config = useMemo(() => getSimonConfig(level), [level]);
  const activePads = useMemo(() => ALL_PADS.slice(0, config.count), [config.count]);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const timeoutsRef = useRef<number[]>([]);

  const targetSequenceLength = 2 + Math.min(18, Math.floor(level / 5));

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const playPad = (padId: number, duration = 0.22) => {
    const pad = ALL_PADS[padId];
    if (!pad) return;
    setActivePad(padId);
    sound.playNote(pad.freq, duration);
    const t = window.setTimeout(() => setActivePad(null), duration * 1000);
    timeoutsRef.current.push(t);
  };

  const playSequence = useCallback((seq: number[], curLvl: number) => {
    clearAllTimeouts();
    setIsPlayingSeq(true);
    const pace = Math.max(190, 480 - (curLvl - 1) * 2.8);

    seq.forEach((padId, index) => {
      const t1 = window.setTimeout(() => {
        playPad(padId, Math.max(0.12, 0.24 - (curLvl * 0.001)));
        if (index === seq.length - 1) {
          const t2 = window.setTimeout(() => setIsPlayingSeq(false), pace * 0.6);
          timeoutsRef.current.push(t2);
        }
      }, (index + 1) * pace);
      timeoutsRef.current.push(t1);
    });
  }, [clearAllTimeouts]);

  const generateLevelSequence = useCallback((lvl: number) => {
    const len = 2 + Math.min(18, Math.floor(lvl / 5));
    const cfg = getSimonConfig(lvl);
    const newSeq: number[] = [];
    for (let i = 0; i < len; i++) {
      newSeq.push(Math.floor(Math.random() * cfg.count));
    }
    setSequence(newSeq);
    setPlayerStep(0);
    setIsGameOver(false);
    setIsLevelWon(false);
    playSequence(newSeq, lvl);
  }, [playSequence]);

  const startGame = useCallback(() => {
    sound.playClick();
    clearAllTimeouts();
    setScore(0);
    generateLevelSequence(level);
  }, [level, generateLevelSequence, clearAllTimeouts]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handlePadClick = (padId: number) => {
    if (isPlayingSeq || isGameOver || isLevelWon) return;

    playPad(padId, 0.18);

    if (padId === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Level Complete!
        sound.playSuccess();
        const newScore = score + targetSequenceLength * 15 + config.count * 20;
        setScore(newScore);
        setIsLevelWon(true);
        recordGameWin('simon', newScore, 'SIMON MATRIX', level);
        onComplete?.(newScore);
      }
    } else {
      // Mistake
      sound.playDefeat();
      setIsGameOver(true);
    }
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('simon', nextLvl);
    generateLevelSequence(nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('simon', targetLvl);
    setShowLevelPicker(false);
    generateLevelSequence(targetLvl);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08] gap-2">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 05</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SIMON <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
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
            <span className="text-[9px] text-white/40 uppercase block">SCORE</span>
            <span className="text-base font-bold text-cyan-400">{score}</span>
          </div>
          <button
            onClick={() => generateLevelSequence(level)}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Replay sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sequence Info */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-white/50">
        <span className="flex items-center gap-1.5 text-white">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          {isPlayingSeq ? 'TRANSMITTING AUDITORY TONES...' : 'REPLICATE TONE PATTERN'}
        </span>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/20">
            {config.label}
          </span>
          <span className="text-cyan-400 font-bold">
            {playerStep}/{targetSequenceLength} NOTES
          </span>
        </div>
      </div>

      {/* Simon Dynamic Pad Matrix */}
      <div 
        className="relative p-2 bg-[#070707] border border-cyan-500/30 rounded-[2px] grid gap-2.5 w-64 sm:w-72 aspect-square shadow-[0_0_35px_rgba(6,182,212,0.12)]"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
        }}
      >
        {activePads.map(pad => {
          const isActive = activePad === pad.id;
          const fontSize = config.count === 9 ? 'text-[9px]' : 'text-[10px]';

          return (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad.id)}
              disabled={isPlayingSeq || isGameOver || isLevelWon}
              className={`w-full h-full rounded-[2px] transition-all duration-100 flex items-center justify-center font-mono ${fontSize} font-bold tracking-widest ${
                isActive
                  ? `${pad.active} scale-98 text-black`
                  : `${pad.color} opacity-60 hover:opacity-85 text-black/70 active:scale-95`
              }`}
            >
              {pad.name}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-64 sm:w-72 h-1.5 bg-[#151515] border border-white/[0.08] mt-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${(playerStep / targetSequenceLength) * 100}%` }}
        />
      </div>

      {/* Win Banner */}
      {isLevelWon && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-sm text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> SEQUENCE HARMONIZED!
          </div>
          <p className="text-white/60 mb-3">LEVEL {level} OF 100 COMPLETED.</p>
          <div className="flex gap-2">
            <button
              onClick={() => generateLevelSequence(level)}
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
      {isGameOver && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-[2px] w-full max-w-sm text-center font-mono text-xs text-white">
          <div className="text-red-400 font-bold mb-2">ACOUSTIC FREQUENCY MISMATCH</div>
          <p className="text-white/60 mb-3">LEVEL {level} SEQUENCE NOT MATCHED.</p>
          <button
            onClick={() => generateLevelSequence(level)}
            className="px-6 py-2 bg-white text-black font-bold uppercase rounded-[2px]"
          >
            TRY LEVEL {level} AGAIN
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
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT SIMON LEVEL
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
                100 progressive levels with accelerating acoustic pulses and longer memory chains.
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
