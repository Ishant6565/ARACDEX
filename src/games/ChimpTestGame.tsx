import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Brain, Award, AlertCircle } from 'lucide-react';

const GRID_ROWS = 6;
const GRID_COLS = 5;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

export const ChimpTestGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(4); // number of tiles (4 to 12)
  const [tiles, setTiles] = useState<(number | null)[]>(Array(TOTAL_CELLS).fill(null));
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [strikes, setStrikes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [victory, setVictory] = useState<boolean>(false);

  const startRound = useCallback((targetLevel: number) => {
    const indices: number[] = [];
    while (indices.length < targetLevel) {
      const idx = Math.floor(Math.random() * TOTAL_CELLS);
      if (!indices.includes(idx)) indices.push(idx);
    }

    const newTiles = Array(TOTAL_CELLS).fill(null);
    indices.forEach((cellIdx, numIdx) => {
      newTiles[cellIdx] = numIdx + 1;
    });

    setTiles(newTiles);
    setNextExpected(1);
    setIsMasked(false);
  }, []);

  useEffect(() => {
    startRound(4);
  }, [startRound]);

  const handleCellClick = (val: number | null, index: number) => {
    if (val === null || gameOver || victory) return;

    if (val === nextExpected) {
      sound.playClick();
      // Mask all remaining numbers upon first click
      if (val === 1) {
        setIsMasked(true);
      }

      // Hide clicked cell
      const newTiles = [...tiles];
      newTiles[index] = null;
      setTiles(newTiles);

      if (val === level) {
        // Completed this level!
        sound.playSuccess();
        if (level >= 10) {
          setVictory(true);
          recordGameWin('chimp', level);
          onComplete?.(level);
        } else {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          recordGameWin('chimp', level);
          setTimeout(() => startRound(nextLvl), 600);
        }
      } else {
        setNextExpected(val + 1);
      }
    } else {
      // Wrong click
      sound.playError();
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      if (newStrikes >= 3) {
        setGameOver(true);
      } else {
        // Re-show tiles and restart level
        setIsMasked(false);
        setTimeout(() => startRound(level), 900);
      }
    }
  };

  const restartAll = () => {
    sound.playClick();
    setLevel(4);
    setStrikes(0);
    setGameOver(false);
    setVictory(false);
    startRound(4);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 04</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CHIMP MEMORY <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">AYUMU</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">LEVEL</span>
            <span className="text-sm font-bold text-amber-400">{level} TILES</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">STRIKES</span>
            <span className="text-sm font-bold text-red-400">{strikes}/3</span>
          </div>
          <button
            onClick={restartAll}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs font-mono text-white/50 mb-3 w-full text-left">
        Memorize positions. Click 1, then tap remaining masked blocks in ascending sequence.
      </p>

      {/* Grid 6x5 */}
      <div className="relative p-3 bg-[#070707] border border-white/20 rounded-[2px] grid grid-cols-5 gap-2 w-full aspect-[5/6] shadow-2xl">
        {tiles.map((val, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(val, idx)}
            disabled={val === null}
            className={`flex items-center justify-center font-mono text-lg font-bold border rounded-[2px] transition-all ${
              val !== null
                ? isMasked
                  ? 'bg-white text-transparent border-white hover:bg-neutral-200'
                  : 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#0d0d0d] border-transparent cursor-default'
            }`}
          >
            {val !== null ? (isMasked ? '' : val) : ''}
          </button>
        ))}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-1">CAPACITY REACHED</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">WORKING MEMORY: LVL {level}</h3>
            <p className="text-xs font-mono text-white/50 mb-6">Primate benchmark baseline surpassed.</p>
            <button
              onClick={restartAll}
              className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px]"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {victory && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Award className="w-10 h-10 text-amber-400 mb-3" />
            <span className="text-xs font-mono tracking-[0.25em] text-amber-400 uppercase mb-1">PRODIGY STATUS</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">LEVEL 10 MASTERED</h3>
            <p className="text-xs font-mono text-white/50 mb-6">Exceptional spatial working memory recorded.</p>
            <button
              onClick={restartAll}
              className="px-6 py-2.5 bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all rounded-[2px]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
