import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, ArrowLeft, ArrowRight, RotateCw, Zap, Layers, Trophy, CheckCircle } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#22d3ee' },
  O: { shape: [[1, 1], [1, 1]], color: '#38bdf8' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#c084fc' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#4ade80' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#60a5fa' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#06b6d4' },
};

type Piece = {
  shape: number[][];
  color: string;
  x: number;
  y: number;
};

export const TetrisGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(() => getGameLevel('tetris'));
  const [linesInLevel, setLinesInLevel] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const [levelClearedMessage, setLevelClearedMessage] = useState<boolean>(false);
  const [clearingLines, setClearingLines] = useState<number[]>([]);

  // Keep references to prevent stale closures
  const gridRef = useRef<string[][]>(grid);
  gridRef.current = grid;
  const pieceRef = useRef<Piece | null>(currentPiece);
  pieceRef.current = currentPiece;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const getRandomPiece = (): Piece => {
    const keys = Object.keys(TETROMINOES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const tet = TETROMINOES[key];
    return {
      shape: tet.shape,
      color: tet.color,
      x: Math.floor((COLS - tet.shape[0].length) / 2),
      y: 0,
    };
  };

  const checkCollision = (piece: Piece, testGrid: string[][], offsetX = 0, offsetY = 0): boolean => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && testGrid[newY][newX] !== '') return true;
        }
      }
    }
    return false;
  };

  const rotatePiece = (piece: Piece): number[][] => {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const rotated: number[][] = [];
    for (let c = 0; c < cols; c++) {
      const newRow: number[] = [];
      for (let r = rows - 1; r >= 0; r--) {
        newRow.push(piece.shape[r][c]);
      }
      rotated.push(newRow);
    }
    return rotated;
  };

  // Synchronous atomic lock function with line clear laser effect
  const lockPieceAndAdvance = useCallback((pieceToLock: Piece, currentGrid: string[][]) => {
    sound.playDrop();

    const newGrid = currentGrid.map(row => [...row]);
    pieceToLock.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val !== 0) {
          const py = pieceToLock.y + r;
          const px = pieceToLock.x + c;
          if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
            newGrid[py][px] = pieceToLock.color;
          }
        }
      });
    });

    // Check full lines
    const fullRowIndices: number[] = [];
    newGrid.forEach((row, r) => {
      if (row.every(cell => cell !== '')) {
        fullRowIndices.push(r);
      }
    });

    if (fullRowIndices.length > 0) {
      sound.playSuccess();
      haptics.streak();
      setClearingLines(fullRowIndices);
      setGrid(newGrid);
      gridRef.current = newGrid;
      setCurrentPiece(null);

      setTimeout(() => {
        const clearedLines = fullRowIndices.length;
        const filteredGrid = newGrid.filter((_, idx) => !fullRowIndices.includes(idx));
        while (filteredGrid.length < ROWS) {
          filteredGrid.unshift(Array(COLS).fill(''));
        }

        const points = [0, 100, 300, 500, 800][clearedLines] * level;
        setScore(s => s + points);
        setLines(l => l + clearedLines);

        setLinesInLevel(curr => {
          const nextLines = curr + clearedLines;
          if (nextLines >= 2) {
            setLevel(prevLvl => {
              const nextLvl = Math.min(100, prevLvl + 1);
              setGameLevel('tetris', nextLvl);
              recordGameWin('tetris', score + points, 'TETRIS MATRIX', prevLvl);
              onComplete?.(score + points);
              setLevelClearedMessage(true);
              setTimeout(() => setLevelClearedMessage(false), 2000);
              return nextLvl;
            });
            return 0;
          }
          return nextLines;
        });

        setGrid(filteredGrid);
        gridRef.current = filteredGrid;
        setClearingLines([]);

        const nextPiece = getRandomPiece();
        if (checkCollision(nextPiece, filteredGrid)) {
          sound.playDefeat();
          setIsGameOver(true);
          setCurrentPiece(null);
        } else {
          setCurrentPiece(nextPiece);
        }
      }, 200);
      return;
    }

    setGrid(newGrid);
    gridRef.current = newGrid;

    const nextPiece = getRandomPiece();
    if (checkCollision(nextPiece, newGrid)) {
      sound.playDefeat();
      setIsGameOver(true);
      setCurrentPiece(null);
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [level, score, onComplete]);

  // Instant Hard Drop
  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    const currentGrid = gridRef.current;
    if (!piece || isGameOverRef.current || isPausedRef.current || clearingLines.length > 0) return;

    let dropOffset = 0;
    while (!checkCollision(piece, currentGrid, 0, dropOffset + 1)) {
      dropOffset++;
    }
    const finalPiece = { ...piece, y: piece.y + dropOffset };
    lockPieceAndAdvance(finalPiece, currentGrid);
  }, [lockPieceAndAdvance, clearingLines.length]);

  // Calculate Ghost Piece position
  const getGhostY = (): number => {
    if (!currentPiece) return 0;
    let offset = 0;
    while (!checkCollision(currentPiece, grid, 0, offset + 1)) {
      offset++;
    }
    return currentPiece.y + offset;
  };

  const resetGame = useCallback(() => {
    sound.playClick();
    const emptyGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(''));
    setGrid(emptyGrid);
    gridRef.current = emptyGrid;
    setCurrentPiece(getRandomPiece());
    setScore(0);
    setLines(0);
    setLinesInLevel(0);
    setClearingLines([]);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const selectSpecificLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('tetris', targetLvl);
    setShowLevelPicker(false);
    resetGame();
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Gravity interval scales smoothly from level 1 (700ms) to level 100 (60ms)
  useEffect(() => {
    if (isGameOver || isPaused || showLevelPicker || !currentPiece || clearingLines.length > 0) return;

    const dropSpeed = Math.max(60, 700 - (level - 1) * 6.5);
    const interval = setInterval(() => {
      const piece = pieceRef.current;
      const currentGrid = gridRef.current;
      if (!piece || clearingLines.length > 0) return;

      if (!checkCollision(piece, currentGrid, 0, 1)) {
        setCurrentPiece(p => (p ? { ...p, y: p.y + 1 } : null));
      } else {
        lockPieceAndAdvance(piece, currentGrid);
      }
    }, dropSpeed);

    return () => clearInterval(interval);
  }, [level, isGameOver, isPaused, showLevelPicker, currentPiece, clearingLines.length, lockPieceAndAdvance]);

  const moveLeft = () => {
    if (!currentPiece || isGameOver || isPaused || clearingLines.length > 0) return;
    if (!checkCollision(currentPiece, grid, -1, 0)) {
      sound.playMove();
      setCurrentPiece({ ...currentPiece, x: currentPiece.x - 1 });
    }
  };

  const moveRight = () => {
    if (!currentPiece || isGameOver || isPaused || clearingLines.length > 0) return;
    if (!checkCollision(currentPiece, grid, 1, 0)) {
      sound.playMove();
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + 1 });
    }
  };

  const moveDown = () => {
    if (!currentPiece || isGameOver || isPaused || clearingLines.length > 0) return;
    if (!checkCollision(currentPiece, grid, 0, 1)) {
      sound.playMove();
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    }
  };

  const rotate = () => {
    if (!currentPiece || isGameOver || isPaused || clearingLines.length > 0) return;
    const rotated = rotatePiece(currentPiece);
    if (!checkCollision({ ...currentPiece, shape: rotated }, grid)) {
      sound.playRotate();
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelPicker) return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        moveLeft();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        moveRight();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        moveDown();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        rotate();
      } else if (e.code === 'Space') {
        hardDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hardDrop, showLevelPicker]);

  const ghostY = getGhostY();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08] gap-2">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 02</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            TETRIS <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowLevelPicker(true)}
            className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer group transition-all"
            title="Choose from 100 Levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level}/100</span>
          </button>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">SCORE</span>
            <span className="text-sm font-bold text-cyan-400">{score}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Level notification banner */}
      {levelClearedMessage && (
        <div className="w-full mb-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs flex items-center justify-between rounded-[2px] animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEVEL PROMOTED! NOW LVL {level}</span>
          </div>
          <span className="text-[10px] uppercase text-cyan-400 font-bold">VELOCITY +</span>
        </div>
      )}

      {/* Tetris Board Matrix */}
      <div className="relative p-1 bg-[#070707] border border-cyan-500/20 rounded-[2px] grid grid-cols-10 grid-rows-20 gap-0.5 w-60 aspect-[10/20] shadow-[0_0_25px_rgba(6,182,212,0.15)] overflow-hidden">
        {grid.map((row, r) =>
          row.map((color, c) => {
            const isClearing = clearingLines.includes(r);
            let activeColor = color;
            let isGhost = false;

            if (currentPiece && !isClearing) {
              const pr = r - currentPiece.y;
              const pc = c - currentPiece.x;
              if (
                pr >= 0 &&
                pr < currentPiece.shape.length &&
                pc >= 0 &&
                pc < currentPiece.shape[0].length &&
                currentPiece.shape[pr][pc] !== 0
              ) {
                activeColor = currentPiece.color;
              }

              // Check Ghost piece outline
              const gr = r - ghostY;
              if (
                !activeColor &&
                gr >= 0 &&
                gr < currentPiece.shape.length &&
                pc >= 0 &&
                pc < currentPiece.shape[0].length &&
                currentPiece.shape[gr][pc] !== 0
              ) {
                isGhost = true;
              }
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-[1px] transition-all duration-75 ${
                  isClearing
                    ? 'tetris-laser-row bg-white shadow-[0_0_20px_rgba(34,211,238,1)]'
                    : activeColor
                    ? 'border border-white/20 shadow-sm'
                    : isGhost
                    ? 'border border-dashed border-cyan-400/30 bg-cyan-500/[0.03]'
                    : 'bg-[#0e0e0e] border border-white/[0.03]'
                }`}
                style={{ backgroundColor: isClearing ? '#ffffff' : activeColor || undefined }}
              />
            );
          })
        )}

        {/* Laser Clear Horizontal Beams */}
        {clearingLines.map(r => (
          <div
            key={`laser-${r}`}
            style={{ top: `${(r / ROWS) * 100}%`, height: `${100 / ROWS}%` }}
            className="absolute inset-x-0 bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-95 pointer-events-none shadow-[0_0_35px_rgba(6,182,212,1)] z-30 animate-pulse"
          />
        ))}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase mb-1">GRID SATURATED</span>
            <h3 className="text-xl font-display font-bold text-white mb-1">SEQUENCE TERMINATED</h3>
            <p className="text-xs font-mono text-cyan-400 mb-1">LEVEL REACHED: {level} / 100</p>
            <p className="text-xs font-mono text-white/50 mb-4">TOTAL SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Progress to next level bar */}
      <div className="w-60 mt-2 flex items-center justify-between text-[10px] font-mono text-white/50">
        <span>LVL {level} REQ: 2 LINES</span>
        <span className="text-cyan-400 font-bold">{linesInLevel}/2 CLEARED</span>
      </div>
      <div className="w-60 h-1 bg-[#151515] border border-white/[0.08] mt-1 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${(linesInLevel / 2) * 100}%` }}
        />
      </div>

      {/* Control Buttons (Left, Rotate, Right, Hard Drop) */}
      <div className="grid grid-cols-4 gap-2 mt-3 w-60">
        <button
          onClick={moveLeft}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white hover:border-cyan-500/40"
          title="Move Left (A / Left)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={rotate}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white hover:border-cyan-500/40"
          title="Rotate (W / Up)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={moveRight}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white hover:border-cyan-500/40"
          title="Move Right (D / Right)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={hardDrop}
          className="p-3 bg-cyan-400 text-black active:bg-cyan-300 border border-cyan-300 rounded-[2px] flex items-center justify-center font-bold shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          title="INSTANT HARD DROP (Spacebar)"
        >
          <Zap className="w-4 h-4 fill-black" />
        </button>
      </div>
      <span className="text-[10px] font-mono text-cyan-400/70 mt-2">
        TIP: SPACEBAR OR ⚡ FOR INSTANT HARD DROP
      </span>

      {/* 100 Levels Picker Modal */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-500/40 rounded-[2px] p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// ARCHIVAL SELECTION</span>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT TETRIS LEVEL
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
                100 tiered levels with accelerating gravity. Clear 2 lines to advance sequentially!
              </p>

              <div className="grid grid-cols-10 gap-1.5 overflow-y-auto pr-1 py-1 max-h-[50vh] font-mono text-xs flex-1 min-h-0">
                {Array.from({ length: 100 }, (_, i) => i + 1).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => selectSpecificLevel(lvl)}
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
                <span>CURRENT: LEVEL {level}</span>
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
