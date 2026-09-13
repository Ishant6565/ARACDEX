import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, PenTool, CheckCircle, HelpCircle } from 'lucide-react';

type Grid = number[][];

// Pre-validated curated puzzles for instant lag-free load
const PUZZLE_EASY = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION_EASY = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export const SudokuGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [initial] = useState<Grid>(PUZZLE_EASY);
  const [solution] = useState<Grid>(SOLUTION_EASY);
  const [grid, setGrid] = useState<Grid>(() => PUZZLE_EASY.map(r => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Timer
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (r: number, c: number) => {
    sound.playClick();
    setSelectedCell([r, c]);
  };

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || isComplete) return;
    const [r, c] = selectedCell;
    if (initial[r][c] !== 0) return; // cannot edit fixed clues

    const key = `${r}-${c}`;

    if (pencilMode) {
      sound.playClick();
      setNotes(prev => {
        const currentNotes = prev[key] || [];
        const exists = currentNotes.includes(num);
        const newNotes = exists
          ? currentNotes.filter(n => n !== num)
          : [...currentNotes, num].sort((a, b) => a - b);
        return { ...prev, [key]: newNotes };
      });
      return;
    }

    sound.playPop();
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);

    // Validate conflict
    if (solution[r][c] !== num && num !== 0) {
      sound.playError();
      setConflicts(prev => Array.from(new Set([...prev, key])));
    } else {
      setConflicts(prev => prev.filter(k => k !== key));
    }

    // Check complete
    let done = true;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newGrid[row][col] !== solution[row][col]) {
          done = false;
          break;
        }
      }
      if (!done) break;
    }

    if (done) {
      setIsComplete(true);
      sound.playSuccess();
      recordGameWin('sudoku', Math.max(1, 1000 - timerSeconds));
      onComplete?.(Math.max(1, 1000 - timerSeconds));
    }
  }, [selectedCell, isComplete, initial, pencilMode, grid, solution, timerSeconds, onComplete]);

  // Keyboard number listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(0);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNumberInput]);

  const resetGame = () => {
    sound.playClick();
    setGrid(PUZZLE_EASY.map(r => [...r]));
    setSelectedCell(null);
    setNotes({});
    setConflicts([]);
    setIsComplete(false);
    setTimerSeconds(0);
  };

  const isHighlighted = (r: number, c: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    if (sr === r && sc === c) return false; // self handled separately
    if (sr === r || sc === c) return true; // same row/col
    const blockR = Math.floor(sr / 3) * 3;
    const blockC = Math.floor(sc / 3) * 3;
    if (r >= blockR && r < blockR + 3 && c >= blockC && c < blockC + 3) return true;
    // Same number highlight
    const selVal = grid[sr][sc];
    if (selVal !== 0 && grid[r][c] === selVal) return true;
    return false;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 02</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            SUDOKU <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">CLASSICAL</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px]">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">ELAPSED</span>
            <span className="text-sm font-bold text-amber-400">{formatTime(timerSeconds)}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9x9 Sudoku Grid */}
      <div className="p-1 bg-[#070707] border-2 border-white/20 rounded-[2px] grid grid-cols-9 w-full aspect-square shadow-2xl">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
            const highlighted = isHighlighted(r, c);
            const isFixed = initial[r][c] !== 0;
            const key = `${r}-${c}`;
            const hasConflict = conflicts.includes(key);
            const cellNotes = notes[key] || [];

            // Border classes for 3x3 subgrids
            const borderR = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-white/30' : 'border-b border-b-white/[0.06]';
            const borderC = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-white/30' : 'border-r border-r-white/[0.06]';

            return (
              <button
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center font-mono text-sm sm:text-base transition-colors ${borderR} ${borderC} ${
                  isSelected
                    ? 'bg-white text-black font-bold'
                    : hasConflict
                    ? 'bg-red-950/40 text-red-400'
                    : highlighted
                    ? 'bg-white/[0.05] text-white'
                    : 'bg-transparent text-white/90'
                } ${isFixed ? 'font-bold' : 'font-light text-amber-200'}`}
              >
                {val !== 0 ? (
                  val
                ) : cellNotes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5 text-[8px] text-white/40 leading-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span key={n} className="flex items-center justify-center">
                        {cellNotes.includes(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Control Actions & Input Bar */}
      <div className="flex items-center justify-between w-full mt-4">
        <button
          onClick={() => setPencilMode(!pencilMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border rounded-[2px] transition-all ${
            pencilMode
              ? 'bg-amber-400 text-black border-amber-400 font-bold'
              : 'bg-[#0d0d0d] text-white/70 border-white/[0.08] hover:bg-[#151515]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          {pencilMode ? 'PENCIL ACTIVE' : 'PENCIL OFF'}
        </button>

        <button
          onClick={() => handleNumberInput(0)}
          className="px-3 py-1.5 font-mono text-xs text-white/70 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
        >
          CLEAR
        </button>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-9 gap-1.5 w-full mt-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="py-3 bg-[#0d0d0d] hover:bg-white hover:text-black border border-white/[0.08] font-mono text-base font-bold text-white transition-colors rounded-[2px]"
          >
            {num}
          </button>
        ))}
      </div>

      {isComplete && (
        <div className="mt-4 p-3 bg-white/10 border border-white/30 rounded-[2px] w-full text-center flex items-center justify-center gap-2 text-white font-mono text-xs">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          SUDOKU RESOLVED IN {formatTime(timerSeconds)}! ACCURACY REGISTERED.
        </div>
      )}
    </div>
  );
};
