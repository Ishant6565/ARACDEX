import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Award, CheckCircle, Layers, Trophy } from 'lucide-react';

// Dynamic grid size based on level progression:
// Levels 1-25: 3x3 (8-puzzle, 9 cells)
// Levels 26-65: 4x4 (15-puzzle, 16 cells)
// Levels 66-100: 5x5 (24-puzzle, 25 cells)
const getGridSize = (level: number): number => {
  if (level <= 25) return 3;
  if (level <= 65) return 4;
  return 5;
};

// Generate a deterministic solvable board by executing N valid random slides from solved state
function generateLevelBoard(level: number, size: number): number[] {
  const total = size * size;
  const board = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
  let zeroIdx = total - 1;

  let seed = level * 2654435761;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Scramble steps scale smoothly with level and grid size
  const steps = Math.min(220, 6 + (level - 1) * 2 + (size - 3) * 10);
  let lastMove = -1;

  for (let s = 0; s < steps; s++) {
    const r = Math.floor(zeroIdx / size);
    const c = zeroIdx % size;
    const neighbors: number[] = [];

    if (r > 0) neighbors.push(zeroIdx - size); // Up
    if (r < size - 1) neighbors.push(zeroIdx + size); // Down
    if (c > 0) neighbors.push(zeroIdx - 1); // Left
    if (c < size - 1) neighbors.push(zeroIdx + 1); // Right

    // Don't immediately undo previous move unless necessary
    const validCandidates = neighbors.filter(idx => idx !== lastMove);
    const chosen = validCandidates.length > 0 
      ? validCandidates[Math.floor(lcg() * validCandidates.length)]
      : neighbors[Math.floor(lcg() * neighbors.length)];

    board[zeroIdx] = board[chosen];
    board[chosen] = 0;
    lastMove = zeroIdx;
    zeroIdx = chosen;
  }

  // Ensure not accidentally already solved
  if (isSolved(board, size)) {
    const neighbors = [zeroIdx - 1, zeroIdx - size].filter(i => i >= 0);
    const swapTarget = neighbors[0];
    board[zeroIdx] = board[swapTarget];
    board[swapTarget] = 0;
  }

  return board;
}

function isSolved(board: number[], size: number): boolean {
  const total = size * size;
  for (let i = 0; i < total - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[total - 1] === 0;
}

export const Slide15Game: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('slide15'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const gridSize = useMemo(() => getGridSize(level), [level]);
  const totalCells = gridSize * gridSize;
  const maxTile = totalCells - 1;

  const initialBoard = useMemo(() => generateLevelBoard(level, gridSize), [level, gridSize]);
  const [board, setBoard] = useState<number[]>(() => [...initialBoard]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  const initGame = useCallback(() => {
    sound.playClick();
    setBoard([...initialBoard]);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  }, [initialBoard]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (isWon || board.length === 0) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon, board]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const zeroIndex = board.indexOf(0);
    const r1 = Math.floor(index / gridSize);
    const c1 = index % gridSize;
    const r2 = Math.floor(zeroIndex / gridSize);
    const c2 = zeroIndex % gridSize;

    // Must be adjacent
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return;

    sound.playSlide();
    const newBoard = [...board];
    [newBoard[index], newBoard[zeroIndex]] = [newBoard[zeroIndex], newBoard[index]];
    setBoard(newBoard);
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (isSolved(newBoard, gridSize)) {
      sound.playSuccess();
      setIsWon(true);
      const score = Math.max(20, 2000 - newMoves * 15 - timer * 5 + level * 30 + totalCells * 20);
      recordGameWin('slide15', score, `SLIDE ${maxTile} MATRIX`, level);
      onComplete?.(score);
    }
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('slide15', nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('slide15', targetLvl);
    setShowLevelPicker(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 11</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SLIDE {maxTile} <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{gridSize}×{gridSize}</span>
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
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-white">{moves}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-cyan-400">{timer}s</span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Level Info Header */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-white/50">
        <span>GRID: <span className="text-cyan-400 font-bold">{gridSize}×{gridSize} ({totalCells} CELLS)</span></span>
        <span>OBJECTIVE: <span className="text-white">1 TO {maxTile} ORDER</span></span>
      </div>

      {/* Grid Matrix */}
      <div 
        className="grid gap-1.5 p-2 bg-[#070707] border border-cyan-500/30 rounded-[2px] w-full aspect-square max-w-[340px] shadow-[0_0_30px_rgba(6,182,212,0.12)]"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {board.map((val, idx) => {
          const isCorrect = val === idx + 1;
          const isEmpty = val === 0;
          const fontSizeClass = gridSize === 3 
            ? 'text-2xl sm:text-3xl' 
            : gridSize === 4 
            ? 'text-xl sm:text-2xl' 
            : 'text-base sm:text-lg';

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={isEmpty || isWon}
              className={`flex items-center justify-center font-display font-bold ${fontSizeClass} rounded-[2px] transition-all ${
                isEmpty
                  ? 'bg-transparent border border-dashed border-white/[0.05] pointer-events-none'
                  : isCorrect
                  ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-[#121212] border border-white/10 text-white hover:bg-[#1a1a1a] hover:border-cyan-400/40 active:scale-95'
              }`}
            >
              {!isEmpty && val}
            </button>
          );
        })}
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-[340px] text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> CONVERGENCE ACHIEVED IN {moves} MOVES!
          </div>
          <p className="text-white/60 mb-3">CONGRATULATIONS! LEVEL {level} MASTERED.</p>
          <div className="flex gap-2">
            <button
              onClick={initGame}
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

      {/* 100 Levels Picker Modal */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-500/40 rounded-[2px] p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// ARCHIVAL CIPHER VAULT</span>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT SLIDE 15 LEVEL
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
                100 tiered levels with mathematically guaranteed solvability. Higher levels require deeper planning.
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
