import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Award, CheckCircle, ArrowUp } from 'lucide-react';

const SIZE = 4; // 4x4 grid

// Check if a 15-puzzle permutation is solvable
function isSolvable(arr: number[]): boolean {
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== 0 && arr[j] !== 0 && arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  const zeroIndex = arr.indexOf(0);
  const zeroRowFromBottom = SIZE - Math.floor(zeroIndex / SIZE);
  if (zeroRowFromBottom % 2 === 0) {
    return inversions % 2 !== 0;
  } else {
    return inversions % 2 === 0;
  }
}

function generateSolvableBoard(): number[] {
  let board: number[];
  do {
    board = Array.from({ length: 16 }, (_, i) => i);
    // Shuffle
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board) || isSolved(board));
  return board;
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < 15; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[15] === 0;
}

export const Slide15Game: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  const initGame = useCallback(() => {
    sound.playClick();
    setBoard(generateSolvableBoard());
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  }, []);

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
    const r1 = Math.floor(index / SIZE);
    const c1 = index % SIZE;
    const r2 = Math.floor(zeroIndex / SIZE);
    const c2 = zeroIndex % SIZE;

    // Must be adjacent
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return;

    sound.playSlide();
    const newBoard = [...board];
    [newBoard[index], newBoard[zeroIndex]] = [newBoard[zeroIndex], newBoard[index]];
    setBoard(newBoard);
    setMoves(m => m + 1);

    if (isSolved(newBoard)) {
      sound.playSuccess();
      setIsWon(true);
      const score = Math.max(10, 1500 - moves * 10 - timer * 5);
      recordGameWin('slide15', score);
      onComplete?.(score);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 07</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            15-PUZZLE <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">CLASSIC</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-white">{moves}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-amber-400">{timer}s</span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4x4 Tiles Grid */}
      <div className="relative p-2.5 bg-[#080808] border border-white/20 rounded-[2px] grid grid-cols-4 gap-2 w-64 aspect-square shadow-2xl">
        {board.map((val, idx) => (
          <button
            key={idx}
            onClick={() => handleTileClick(idx)}
            disabled={val === 0 || isWon}
            className={`flex items-center justify-center font-mono text-base font-bold rounded-[2px] transition-all duration-150 ${
              val === 0
                ? 'bg-[#0d0d0d] border border-transparent cursor-default'
                : 'bg-white text-black border border-white hover:bg-neutral-200 active:scale-95 shadow-sm'
            }`}
          >
            {val !== 0 ? val : ''}
          </button>
        ))}
      </div>

      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-amber-400" /> CONVERGENCE ACHIEVED IN {moves} MOVES!
        </div>
      )}
    </div>
  );
};
