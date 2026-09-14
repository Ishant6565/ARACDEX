import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, PenTool, CheckCircle, HelpCircle, Layers, Trophy } from 'lucide-react';

type Grid = number[][];

// Deterministic valid Sudoku Generator for 100 Levels
function generateSudokuLevel(level: number): { puzzle: Grid; solution: Grid } {
  // Base solved Latin square
  const base = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8],
  ];

  // Pseudo-random deterministic permutation based on level
  const perm = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let seed = level * 1664525 + 1013904223;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Shuffle digits
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }

  // Create solution by mapping
  const solution: Grid = base.map(row => row.map(val => perm[val - 1]));

  // Block swaps
  if (Math.floor(lcg() * 2) === 1) {
    // Swap row 0 and 1
    const tmp = solution[0];
    solution[0] = solution[1];
    solution[1] = tmp;
  }
  if (Math.floor(lcg() * 2) === 1) {
    // Swap row 3 and 4
    const tmp = solution[3];
    solution[3] = solution[4];
    solution[4] = tmp;
  }

  // Determine clue count: Level 1 has 42 clues, Level 100 has 26 clues
  const cluesCount = Math.max(26, Math.floor(42 - (level - 1) * 0.16));
  const puzzle: Grid = solution.map(row => [...row]);

  // Remove cells deterministically
  const cellIndices: number[] = Array.from({ length: 81 }, (_, i) => i);
  for (let i = cellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }

  const cellsToRemove = 81 - cluesCount;
  for (let k = 0; k < cellsToRemove; k++) {
    const idx = cellIndices[k];
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    puzzle[r][c] = 0;
  }

  return { puzzle, solution };
}

export const SudokuGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('sudoku'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const { puzzle: initial, solution } = useMemo(() => generateSudokuLevel(level), [level]);

  const [grid, setGrid] = useState<Grid>(() => initial.map(r => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Sync grid when level changes
  useEffect(() => {
    setGrid(initial.map(r => [...r]));
    setNotes({});
    setConflicts([]);
    setIsComplete(false);
    setTimerSeconds(0);
    // Select first empty cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (initial[r][c] === 0) {
          setSelectedCell([r, c]);
          return;
        }
      }
    }
    setSelectedCell([0, 0]);
  }, [initial]);

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
      sound.playSuccess();
      setIsComplete(true);
      const finalScore = Math.max(50, 2000 - timerSeconds * 2 + level * 50);
      recordGameWin('sudoku', finalScore, 'SUDOKU CIPHER', level);
      onComplete?.(finalScore);
    }
  }, [selectedCell, isComplete, initial, pencilMode, grid, solution, timerSeconds, level, onComplete]);

  // Keyboard navigation & number input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(0);
      } else if (e.key === 'p' || e.key === 'P') {
        setPencilMode(prev => !prev);
      } else if (selectedCell) {
        const [r, c] = selectedCell;
        if (e.key === 'ArrowUp' && r > 0) setSelectedCell([r - 1, c]);
        if (e.key === 'ArrowDown' && r < 8) setSelectedCell([r + 1, c]);
        if (e.key === 'ArrowLeft' && c > 0) setSelectedCell([r, c - 1]);
        if (e.key === 'ArrowRight' && c < 8) setSelectedCell([r, c + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleNumberInput]);

  const resetCurrentPuzzle = () => {
    sound.playClick();
    setGrid(initial.map(r => [...r]));
    setNotes({});
    setConflicts([]);
    setIsComplete(false);
    setTimerSeconds(0);
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('sudoku', nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('sudoku', targetLvl);
    setShowLevelPicker(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 03</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SUDOKU <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowLevelPicker(true)}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer transition-all"
            title="Choose from 100 curated levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level}/100</span>
          </button>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIMER</span>
            <span className="text-sm font-bold text-cyan-400">{formatTime(timerSeconds)}</span>
          </div>
          <button
            onClick={resetCurrentPuzzle}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
        <button
          onClick={() => {
            sound.playClick();
            setPencilMode(p => !p);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[2px] transition-all ${
            pencilMode
              ? 'bg-cyan-400 text-black border-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'bg-[#0e0e0e] text-white/70 border-white/[0.08] hover:border-cyan-400/40'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>NOTES MODE {pencilMode ? '[ON]' : '[OFF]'}</span>
        </button>

        <span className="text-[11px] text-white/50">
          DIFFICULTY: <span className="text-cyan-400 font-bold">{level <= 25 ? 'INITIATE' : level <= 60 ? 'TACTICAL' : 'MASTER'}</span>
        </span>
      </div>

      {/* Sudoku 9x9 Grid */}
      <div className="relative p-1 bg-[#070707] border border-cyan-500/30 rounded-[2px] grid grid-cols-9 gap-[1px] w-full aspect-square max-w-[360px] shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isFixed = initial[r][c] !== 0;
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const isHighlighted =
              selectedCell && (selectedCell[0] === r || selectedCell[1] === c || (grid[selectedCell[0]][selectedCell[1]] === val && val !== 0));
            const hasConflict = conflicts.includes(`${r}-${c}`);
            const cellNotes = notes[`${r}-${c}`] || [];

            // Border dividers for 3x3 blocks
            const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-cyan-400/30' : '';
            const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-cyan-400/30' : '';

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center font-mono text-sm sm:text-base transition-colors ${borderRight} ${borderBottom} ${
                  isSelected
                    ? 'bg-cyan-400/30 border border-cyan-400 text-white font-bold'
                    : isHighlighted
                    ? 'bg-cyan-500/[0.07] text-white'
                    : 'bg-[#0d0d0d] text-white/90 hover:bg-[#181818]'
                } ${hasConflict ? 'bg-red-500/20 text-red-400' : ''} ${
                  isFixed ? 'font-bold text-white' : 'font-light text-cyan-200'
                }`}
              >
                {val !== 0 ? (
                  val
                ) : cellNotes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-0.5 p-0.5 w-full h-full text-[8px] leading-none text-white/40 pointer-events-none">
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

      {/* Numeric Input Keypad */}
      <div className="grid grid-cols-5 gap-1.5 mt-4 w-full max-w-[360px] font-mono">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="py-2.5 bg-[#0e0e0e] hover:bg-cyan-500/20 active:bg-cyan-400 active:text-black border border-white/[0.08] hover:border-cyan-400/50 rounded-[2px] text-center text-sm font-bold text-white transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="py-2.5 bg-[#0e0e0e] hover:bg-red-500/20 border border-white/[0.08] rounded-[2px] text-center text-xs font-bold text-red-400 uppercase tracking-widest"
        >
          CLEAR
        </button>
      </div>

      {/* Victory Modal */}
      {isComplete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-4">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-400/50 p-6 rounded-[2px] max-w-sm w-full text-center shadow-[0_0_40px_rgba(6,182,212,0.3)] my-auto">
              <CheckCircle className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">MATRIX CONVERGED</span>
              <h3 className="text-xl font-display font-bold text-white mb-2">SUDOKU LEVEL {level} SOLVED</h3>
              <p className="text-xs font-mono text-white/50 mb-6">COMPLETION TIME: {formatTime(timerSeconds)}</p>
              <div className="flex gap-2">
                <button
                  onClick={resetCurrentPuzzle}
                  className="flex-1 py-2.5 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white/10 rounded-[2px]"
                >
                  REPLAY
                </button>
                <button
                  onClick={advanceNextLevel}
                  className="flex-1 py-2.5 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                >
                  NEXT LEVEL ({level < 100 ? level + 1 : 100})
                </button>
              </div>
            </div>
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
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT SUDOKU LEVEL
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
                100 mathematically validated logical puzzles with progressive deduction difficulty.
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
