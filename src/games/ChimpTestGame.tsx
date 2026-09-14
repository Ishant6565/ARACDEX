import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Brain, Award, AlertCircle, Layers, Trophy, CheckCircle } from 'lucide-react';

// Dynamic grid dimension based on level progression:
// Levels 1-20: 3x3 (9 cells)
// Levels 21-50: 4x4 (16 cells)
// Levels 51-80: 5x5 (25 cells)
// Levels 81-100: 6x6 (36 cells)
const getChimpGrid = (level: number) => {
  if (level <= 20) {
    return { dim: 3, label: '3×3 (9 BLOCKS)' };
  }
  if (level <= 50) {
    return { dim: 4, label: '4×4 (16 BLOCKS)' };
  }
  if (level <= 80) {
    return { dim: 5, label: '5×5 (25 BLOCKS)' };
  }
  return { dim: 6, label: '6×6 (36 BLOCKS)' };
};

export const ChimpTestGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('chimp'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const gridConfig = useMemo(() => getChimpGrid(level), [level]);
  const totalCells = gridConfig.dim * gridConfig.dim;

  // Number of targets scales with both level and grid capacity
  const tileCountForLevel = useMemo(() => {
    if (level <= 20) {
      return Math.min(6, 3 + Math.floor((level - 1) * 0.16));
    }
    if (level <= 50) {
      return Math.min(10, 5 + Math.floor((level - 21) * 0.17));
    }
    if (level <= 80) {
      return Math.min(16, 8 + Math.floor((level - 51) * 0.28));
    }
    return Math.min(22, 14 + Math.floor((level - 81) * 0.42));
  }, [level]);

  const [tiles, setTiles] = useState<(number | null)[]>(() => Array(totalCells).fill(null));
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [strikes, setStrikes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [victory, setVictory] = useState<boolean>(false);

  const startRound = useCallback((targetCount: number, cellsCount: number) => {
    const indices: number[] = [];
    while (indices.length < targetCount) {
      const idx = Math.floor(Math.random() * cellsCount);
      if (!indices.includes(idx)) indices.push(idx);
    }

    const newTiles = Array(cellsCount).fill(null);
    indices.forEach((cellIdx, numIdx) => {
      newTiles[cellIdx] = numIdx + 1;
    });

    setTiles(newTiles);
    setNextExpected(1);
    setIsMasked(false);
    setGameOver(false);
    setVictory(false);
  }, []);

  useEffect(() => {
    startRound(tileCountForLevel, totalCells);
  }, [level, tileCountForLevel, totalCells, startRound]);

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

      if (val === tileCountForLevel) {
        // Completed this level!
        sound.playSuccess();
        setVictory(true);
        const score = 100 * level + tileCountForLevel * 20 + totalCells * 5;
        recordGameWin('chimp', score, 'CHIMP TEST', level);
        onComplete?.(score);
      } else {
        setNextExpected(val + 1);
      }
    } else {
      // Wrong click
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      if (newStrikes >= 3) {
        sound.playDefeat();
        setGameOver(true);
      } else {
        sound.playError();
        // Re-show tiles and restart level
        setIsMasked(false);
        setTimeout(() => startRound(tileCountForLevel, totalCells), 900);
      }
    }
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('chimp', nextLvl);
    setStrikes(0);
    setVictory(false);
    setGameOver(false);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('chimp', targetLvl);
    setShowLevelPicker(false);
    setStrikes(0);
    setVictory(false);
    setGameOver(false);
  };

  const restartCurrentLevel = () => {
    sound.playClick();
    setStrikes(0);
    setVictory(false);
    setGameOver(false);
    startRound(tileCountForLevel, totalCells);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 04</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CHIMP TEST <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
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
            <span className="text-[9px] text-white/40 uppercase block">TARGET</span>
            <span className="text-sm font-bold text-cyan-400">{tileCountForLevel} TILES</span>
          </div>
          <button
            onClick={restartCurrentLevel}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Strikes indicator */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-white/50">
        <span className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/20">
            {gridConfig.label}
          </span>
          <span className="text-white font-bold">{tileCountForLevel} TARGETS</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">STRIKES:</span>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${
                s <= strikes ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#222]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div 
        className="relative grid gap-1.5 p-2 bg-[#070707] border border-cyan-500/30 rounded-[2px] w-full aspect-square max-w-[340px] shadow-[0_0_30px_rgba(6,182,212,0.12)]"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.dim}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridConfig.dim}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((val, idx) => {
          if (val === null) {
            return <div key={idx} className="w-full h-full bg-transparent rounded-[2px]" />;
          }

          const fontClass = gridConfig.dim === 3
            ? 'text-2xl sm:text-3xl'
            : gridConfig.dim === 4
            ? 'text-xl sm:text-2xl'
            : gridConfig.dim === 5
            ? 'text-base sm:text-lg'
            : 'text-xs sm:text-sm';

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(val, idx)}
              className={`w-full h-full flex items-center justify-center font-display font-bold ${fontClass} rounded-[2px] transition-all border ${
                isMasked
                  ? 'bg-[#181818] border-cyan-500/40 hover:bg-cyan-500/20 text-transparent shadow-md'
                  : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              }`}
            >
              {!isMasked && val}
            </button>
          );
        })}
      </div>

      {/* Victory Banner */}
      {victory && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-[340px] text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> LEVEL {level} RECALLED PERFECTLY!
          </div>
          <p className="text-white/60 mb-3">CONQUERED {tileCountForLevel} NUMERIC GLYPHS IN SPATIAL MATRIX.</p>
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
          <div className="text-red-400 font-bold mb-2">3 STRIKES REACHED</div>
          <p className="text-white/60 mb-3">LEVEL {level} EXCEEDED WORKING MEMORY THRESHOLD.</p>
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
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT CHIMP LEVEL
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
                100 progressive spatial memory levels (scaling up to 22 obscured numeric tiles).
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
