import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { shareAchievement } from '../services/share';
import { RotateCcw, Award, CheckCircle, Undo2, Layers, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Hash, Share2 } from 'lucide-react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type ArrowTile = {
  id: number;
  row: number;
  col: number;
  direction: Direction;
  isEscaped: boolean;
  isEscaping: boolean;
  isBlocked: boolean;
};

// Generates 100% solvable Arrow Escape levels with progressive grid scaling and unlimited levels
export function generateArrowLevel(level: number): { gridSize: number; tiles: ArrowTile[] } {
  // Grid size grows dynamically as level increases:
  // 1-5: 3x3
  // 6-15: 4x4
  // 16-30: 5x5
  // 31-55: 6x6
  // 56-85: 7x7
  // 86-125: 8x8
  // 126-175: 9x9
  // 176+: 10x10 (with increasing complexity)
  let gridSize = 3;
  let targetTileCount = 4;

  if (level <= 5) {
    gridSize = 3;
    targetTileCount = 3 + Math.floor((level - 1) * 0.5);
  } else if (level <= 15) {
    gridSize = 4;
    targetTileCount = 6 + Math.floor((level - 6) * 0.45);
  } else if (level <= 30) {
    gridSize = 5;
    targetTileCount = 11 + Math.floor((level - 16) * 0.4);
  } else if (level <= 55) {
    gridSize = 6;
    targetTileCount = 17 + Math.floor((level - 31) * 0.35);
  } else if (level <= 85) {
    gridSize = 7;
    targetTileCount = 25 + Math.floor((level - 56) * 0.3);
  } else if (level <= 125) {
    gridSize = 8;
    targetTileCount = 34 + Math.floor((level - 86) * 0.28);
  } else if (level <= 175) {
    gridSize = 9;
    targetTileCount = 45 + Math.floor((level - 126) * 0.24);
  } else {
    gridSize = 10;
    targetTileCount = Math.min(72, 57 + Math.floor((level - 176) * 0.2));
  }

  // Cap at 72% grid capacity to guarantee navigable paths
  targetTileCount = Math.min(Math.floor(gridSize * gridSize * 0.72), targetTileCount);

  // Deterministic LCG based on level
  let seed = level * 1664525 + 1013904223;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Reverse Construction Algorithm (Guaranteed 100% Solvability):
  const board: (ArrowTile | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  const allCoords: [number, number][] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      allCoords.push([r, c]);
    }
  }

  // Shuffle coordinates
  for (let i = allCoords.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
  }

  const placedTiles: ArrowTile[] = [];
  let tileIdCounter = 1;

  for (const [r, c] of allCoords) {
    if (placedTiles.length >= targetTileCount) break;

    // Check which directions are clear to boundary right now
    const validDirections: Direction[] = [];

    // UP
    let upClear = true;
    for (let checkR = r - 1; checkR >= 0; checkR--) {
      if (board[checkR][c] !== null) {
        upClear = false;
        break;
      }
    }
    if (upClear) validDirections.push('UP');

    // DOWN
    let downClear = true;
    for (let checkR = r + 1; checkR < gridSize; checkR++) {
      if (board[checkR][c] !== null) {
        downClear = false;
        break;
      }
    }
    if (downClear) validDirections.push('DOWN');

    // LEFT
    let leftClear = true;
    for (let checkC = c - 1; checkC >= 0; checkC--) {
      if (board[r][checkC] !== null) {
        leftClear = false;
        break;
      }
    }
    if (leftClear) validDirections.push('LEFT');

    // RIGHT
    let rightClear = true;
    for (let checkC = c + 1; checkC < gridSize; checkC++) {
      if (board[r][checkC] !== null) {
        rightClear = false;
        break;
      }
    }
    if (rightClear) validDirections.push('RIGHT');

    if (validDirections.length > 0) {
      const chosenDir = validDirections[Math.floor(lcg() * validDirections.length)];
      const tile: ArrowTile = {
        id: tileIdCounter++,
        row: r,
        col: c,
        direction: chosenDir,
        isEscaped: false,
        isEscaping: false,
        isBlocked: false,
      };
      board[r][c] = tile;
      placedTiles.push(tile);
    }
  }

  if (placedTiles.length < 3) {
    const fallbacks: ArrowTile[] = [
      { id: 1, row: 0, col: 0, direction: 'UP', isEscaped: false, isEscaping: false, isBlocked: false },
      { id: 2, row: 0, col: 1, direction: 'RIGHT', isEscaped: false, isEscaping: false, isBlocked: false },
      { id: 3, row: 1, col: 0, direction: 'LEFT', isEscaped: false, isEscaping: false, isBlocked: false },
      { id: 4, row: 1, col: 1, direction: 'DOWN', isEscaped: false, isEscaping: false, isBlocked: false },
    ];
    return { gridSize: 2, tiles: fallbacks };
  }

  return { gridSize, tiles: placedTiles };
}

export const ArrowEscapeGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('arrow-escape'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const [levelPage, setLevelPage] = useState<number>(() => Math.floor((getGameLevel('arrow-escape') - 1) / 50));
  const [customLevelInput, setCustomLevelInput] = useState<string>('');

  const { gridSize, tiles: initialTiles } = useMemo(() => generateArrowLevel(level), [level]);
  const [tiles, setTiles] = useState<ArrowTile[]>(() => initialTiles.map(t => ({ ...t })));
  const [history, setHistory] = useState<ArrowTile[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Sync state when level changes
  useEffect(() => {
    setTiles(initialTiles.map(t => ({ ...t })));
    setHistory([]);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  }, [initialTiles]);

  // Timer
  useEffect(() => {
    if (isWon || tiles.length === 0) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon, tiles]);

  // Check if tile has an unblocked escape path to the border
  const checkCanEscape = (tile: ArrowTile, currentTiles: ArrowTile[]): boolean => {
    const activeTiles = currentTiles.filter(t => !t.isEscaped);

    if (tile.direction === 'UP') {
      for (let r = tile.row - 1; r >= 0; r--) {
        if (activeTiles.some(t => t.row === r && t.col === tile.col)) return false;
      }
      return true;
    }
    if (tile.direction === 'DOWN') {
      for (let r = tile.row + 1; r < gridSize; r++) {
        if (activeTiles.some(t => t.row === r && t.col === tile.col)) return false;
      }
      return true;
    }
    if (tile.direction === 'LEFT') {
      for (let c = tile.col - 1; c >= 0; c--) {
        if (activeTiles.some(t => t.row === tile.row && t.col === c)) return false;
      }
      return true;
    }
    if (tile.direction === 'RIGHT') {
      for (let c = tile.col + 1; c < gridSize; c++) {
        if (activeTiles.some(t => t.row === tile.row && t.col === c)) return false;
      }
      return true;
    }
    return false;
  };

  const handleTileClick = (tileId: number) => {
    if (isWon) return;

    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.isEscaped || tile.isEscaping) return;

    const canEscape = checkCanEscape(tile, tiles);

    if (canEscape) {
      // Save for Undo
      setHistory(prev => [...prev, tiles.map(t => ({ ...t }))]);
      sound.playPop();

      // Launch escape animation
      setTiles(prev =>
        prev.map(t => (t.id === tileId ? { ...t, isEscaping: true, isBlocked: false } : t))
      );
      setMoves(m => m + 1);

      setTimeout(() => {
        setTiles(prev => {
          const updated = prev.map(t =>
            t.id === tileId ? { ...t, isEscaping: false, isEscaped: true } : t
          );

          // Check if all escaped!
          const allEscaped = updated.every(t => t.isEscaped);
          if (allEscaped) {
            sound.playWin();
            setIsWon(true);
            const score = Math.max(50, 1800 - moves * 20 - timer * 4 + level * 35);
            recordGameWin('arrow-escape', score, 'ARROW ESCAPE', level);
            onComplete?.(score);
          }

          return updated;
        });
      }, 240);
    } else {
      // Blocked!
      sound.playError();
      setTiles(prev =>
        prev.map(t => (t.id === tileId ? { ...t, isBlocked: true } : t))
      );

      setTimeout(() => {
        setTiles(prev =>
          prev.map(t => (t.id === tileId ? { ...t, isBlocked: false } : t))
        );
      }, 350);
    }
  };

  const undoLastMove = () => {
    if (history.length === 0 || isWon) return;
    sound.playClick();
    const previous = history[history.length - 1];
    setTiles(previous);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setMoves(m => Math.max(0, m - 1));
  };

  const resetCurrentLevel = () => {
    sound.playClick();
    setTiles(initialTiles.map(t => ({ ...t })));
    setHistory([]);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = level + 1; // UNLIMITED LEVELS!
    setLevel(nextLvl);
    setGameLevel('arrow-escape', nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    const safeTarget = Math.max(1, targetLvl);
    setLevel(safeTarget);
    setGameLevel('arrow-escape', safeTarget);
    setShowLevelPicker(false);
  };

  const handleCustomLevelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customLevelInput, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      selectLevel(parsed);
      setCustomLevelInput('');
    }
  };

  const escapedCount = tiles.filter(t => t.isEscaped).length;
  const totalCount = tiles.length;

  const renderArrowIcon = (direction: Direction) => {
    switch (direction) {
      case 'UP': return <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'DOWN': return <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'LEFT': return <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'RIGHT': return <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getEscapeTransform = (tile: ArrowTile) => {
    if (!tile.isEscaping) return '';
    switch (tile.direction) {
      case 'UP': return '-translate-y-24 opacity-0 scale-90';
      case 'DOWN': return 'translate-y-24 opacity-0 scale-90';
      case 'LEFT': return '-translate-x-24 opacity-0 scale-90';
      case 'RIGHT': return 'translate-x-24 opacity-0 scale-90';
    }
  };

  const getBlockedShake = (tile: ArrowTile) => {
    if (!tile.isBlocked) return '';
    switch (tile.direction) {
      case 'UP': return '-translate-y-1.5 bg-red-500/30 border-red-400 text-red-300';
      case 'DOWN': return 'translate-y-1.5 bg-red-500/30 border-red-400 text-red-300';
      case 'LEFT': return '-translate-x-1.5 bg-red-500/30 border-red-400 text-red-300';
      case 'RIGHT': return 'translate-x-1.5 bg-red-500/30 border-red-400 text-red-300';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 13</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            ARROW ESCAPE <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">UNLIMITED</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => {
              setLevelPage(Math.floor((level - 1) / 50));
              setShowLevelPicker(true);
            }}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer transition-all"
            title="Choose from Unlimited Levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level} / ∞</span>
          </button>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">GRID</span>
            <span className="text-sm font-bold text-white">{gridSize}x{gridSize}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-cyan-400">{timer}s</span>
          </div>
          <button
            onClick={resetCurrentLevel}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Reset level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={undoLastMove}
            disabled={history.length === 0 || isWon}
            className={`px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 border transition-all ${
              history.length > 0 && !isWon
                ? 'bg-[#121212] hover:bg-[#1e1e1e] text-white border-white/10 hover:border-cyan-400/40 cursor-pointer'
                : 'bg-[#090909] text-white/20 border-white/[0.04] cursor-not-allowed'
            }`}
            title="Undo last tap"
          >
            <Undo2 className="w-3.5 h-3.5" /> UNDO
          </button>
          <span className="text-[11px] text-white/50">
            MOVES: <span className="text-white font-bold">{moves}</span>
          </span>
        </div>

        <div className="text-right text-[11px] text-white/50">
          ESCAPED: <span className="text-cyan-400 font-bold">{escapedCount}/{totalCount} ARROWS</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[400px] h-1.5 bg-[#151515] border border-white/[0.08] mb-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${totalCount > 0 ? (escapedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Arrow Escape Matrix Board - Responsive adapt for larger sizes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
        className="relative gap-1 p-2.5 bg-[#070707] border border-cyan-500/30 rounded-[2px] w-full aspect-square max-w-[390px] shadow-[0_0_35px_rgba(6,182,212,0.12)] overflow-hidden"
      >
        {/* Subtle background grid lines */}
        <div className="absolute inset-0 grid pointer-events-none opacity-10"
             style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
          {Array.from({ length: gridSize * gridSize }).map((_, i) => (
            <div key={i} className="border border-cyan-400/20" />
          ))}
        </div>

        {/* Tiles */}
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((_, c) => {
            const tile = tiles.find(t => t.row === r && t.col === c);

            if (!tile || tile.isEscaped) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="w-full h-full rounded-[1px] bg-white/[0.01] border border-dashed border-white/[0.03]"
                />
              );
            }

            const escapeAnim = getEscapeTransform(tile);
            const blockedAnim = getBlockedShake(tile);

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={isWon || tile.isEscaping}
                className={`relative w-full h-full rounded-[2px] flex items-center justify-center font-bold transition-all duration-200 border cursor-pointer ${
                  tile.isEscaping
                    ? `${escapeAnim}`
                    : tile.isBlocked
                    ? `${blockedAnim} shadow-[0_0_15px_rgba(239,68,68,0.5)]`
                    : 'bg-cyan-950/30 hover:bg-cyan-500/20 active:bg-cyan-400 active:text-black border-cyan-400/50 text-cyan-300 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                }`}
                title={`Tap to launch ${tile.direction}`}
              >
                {renderArrowIcon(tile.direction)}
              </button>
            );
          })
        )}
      </div>

      <div className="text-center font-mono text-[10px] text-cyan-400/60 mt-3">
        OBJECTIVE: TAP ARROWS WHOSE EXIT ROUTE TO THE BORDER IS UNOBSTRUCTED
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-[390px] text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> ALL ARROWS ESCAPED!
          </div>
          <p className="text-white/60 mb-3">
            LEVEL {level} ({gridSize}x{gridSize}) UNTANGLED IN {moves} TAPS & {timer} SECONDS.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              haptics.medium();
              shareAchievement({
                gameTitle: 'Arrow Escape: Untangle Puzzle',
                level: level,
                score: Math.max(50, 500 - moves * 5),
                customNote: `Solved Level ${level} (${gridSize}x${gridSize}) in ${moves} taps!`,
              });
            }}
            className="w-full mb-2.5 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 font-mono font-bold text-xs uppercase rounded-[2px] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-98"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            SHARE TO WHATSAPP / BRAG 🚀
          </button>

          <div className="flex gap-2">
            <button
              onClick={resetCurrentLevel}
              className="flex-1 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white/10 rounded-[2px]"
            >
              REPLAY
            </button>
            <button
              onClick={advanceNextLevel}
              className="flex-1 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              NEXT LEVEL ({level + 1}) →
            </button>
          </div>
        </div>
      )}

      {/* Unlimited Levels Picker Modal */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-500/40 rounded-[2px] p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// INFINITE ARCHIVE</span>
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-cyan-400" /> SELECT ARROW LEVEL
                </h3>
              </div>
              <button
                onClick={() => setShowLevelPicker(false)}
                className="px-2.5 py-1 text-xs font-mono text-white/50 hover:text-white border border-white/10 rounded-[2px]"
              >
                ESC
              </button>
            </div>

            {/* Jump to specific level input */}
            <form onSubmit={handleCustomLevelSubmit} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  placeholder="Enter any level (e.g. 50, 100, 500)..."
                  value={customLevelInput}
                  onChange={e => setCustomLevelInput(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 focus:border-cyan-400 text-white font-mono text-xs pl-8 pr-3 py-1.5 rounded-[2px] outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px]"
              >
                JUMP
              </button>
            </form>

            {/* Page navigation for infinite levels */}
            <div className="flex items-center justify-between py-1 mb-2 font-mono text-xs text-white/60">
              <button
                onClick={() => setLevelPage(p => Math.max(0, p - 1))}
                disabled={levelPage === 0}
                className="flex items-center gap-1 hover:text-cyan-400 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> PREV 50
              </button>
              <span className="text-cyan-400 font-bold">
                LEVELS {levelPage * 50 + 1} - {(levelPage + 1) * 50}
              </span>
              <button
                onClick={() => setLevelPage(p => p + 1)}
                className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer"
              >
                NEXT 50 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Level Buttons Grid */}
            <div className="grid grid-cols-10 gap-1.5 overflow-y-auto pr-1 py-1 max-h-[42vh] font-mono text-xs">
              {Array.from({ length: 50 }, (_, i) => levelPage * 50 + i + 1).map(lvl => (
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

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono text-white/40">
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


