import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, CheckCircle, AlertTriangle, Palette } from 'lucide-react';

const GRID_SIZE = 12;
const MAX_MOVES = 22;

const PALETTE = [
  { id: 0, color: '#ef4444', name: 'Crimson' },
  { id: 1, color: '#3b82f6', name: 'Cobalt' },
  { id: 2, color: '#f59e0b', name: 'Amber' },
  { id: 3, color: '#10b981', name: 'Emerald' },
  { id: 4, color: '#a855f7', name: 'Purple' },
];

export const ColorFloodGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);
  const [filledRatio, setFilledRatio] = useState<number>(0);

  const initGame = useCallback(() => {
    const newGrid: number[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(Math.floor(Math.random() * PALETTE.length));
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setMoves(0);
    setIsWon(false);
    setIsLost(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Calculate percentage filled by connected component from [0,0]
  useEffect(() => {
    if (grid.length === 0) return;
    const targetColor = grid[0][0];
    const visited = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;
    let count = 0;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      count++;
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          if (!visited[nr][nc] && grid[nr][nc] === targetColor) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
    }

    const ratio = Math.round((count / (GRID_SIZE * GRID_SIZE)) * 100);
    setFilledRatio(ratio);

    if (ratio === 100 && !isWon) {
      setIsWon(true);
      sound.playSuccess();
      const score = (MAX_MOVES - moves) * 100;
      recordGameWin('flood', score);
      onComplete?.(score);
    }
  }, [grid, isWon, moves, onComplete]);

  const flood = (newColorIdx: number) => {
    if (isWon || isLost) return;
    const startColor = grid[0][0];
    if (newColorIdx === startColor) return;

    sound.playPop();
    const newMoves = moves + 1;
    setMoves(newMoves);

    // BFS Flood fill
    const newGrid = grid.map(r => [...r]);
    const visited = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;
    newGrid[0][0] = newColorIdx;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          if (!visited[nr][nc] && grid[nr][nc] === startColor) {
            visited[nr][nc] = true;
            newGrid[nr][nc] = newColorIdx;
            queue.push([nr, nc]);
          }
        }
      }
    }

    setGrid(newGrid);

    if (newMoves >= MAX_MOVES && filledRatio < 100) {
      setIsLost(true);
      sound.playError();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 05</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            COLOR FLOOD <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">CHROMATIC</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">MOVES</span>
            <span className="text-sm font-bold text-white">{moves}/{MAX_MOVES}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">DOMINANCE</span>
            <span className="text-sm font-bold text-amber-400">{filledRatio}%</span>
          </div>
          <button
            onClick={initGame}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-2 bg-[#070707] border border-white/20 rounded-[2px] grid grid-cols-12 gap-0.5 w-full aspect-square shadow-2xl">
        {grid.map((row, r) =>
          row.map((colorIdx, c) => (
            <div
              key={`${r}-${c}`}
              className="w-full h-full rounded-[1px] transition-colors duration-200"
              style={{ backgroundColor: PALETTE[colorIdx]?.color }}
            />
          ))
        )}
      </div>

      {/* Palette Selector Bar */}
      <div className="flex gap-2 w-full mt-4 justify-between">
        {PALETTE.map(item => (
          <button
            key={item.id}
            onClick={() => flood(item.id)}
            style={{ backgroundColor: item.color }}
            className="flex-1 h-12 rounded-[2px] border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center"
          >
            <span className="sr-only">{item.name}</span>
          </button>
        ))}
      </div>

      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 text-emerald-300 font-mono text-xs">
          <CheckCircle className="w-4 h-4" />
          CHROMATIC CONVERGENCE ACHIEVED IN {moves} MOVES!
        </div>
      )}

      {isLost && (
        <div className="mt-4 p-3 bg-red-950/50 border border-red-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 text-red-300 font-mono text-xs">
          <AlertTriangle className="w-4 h-4" />
          MOVE QUOTA EXHAUSTED AT {filledRatio}% DOMINANCE.
        </div>
      )}
    </div>
  );
};
