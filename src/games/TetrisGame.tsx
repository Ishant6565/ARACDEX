import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Play, Pause, ArrowDown, ArrowLeft, ArrowRight, RotateCw, ChevronDown } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

// Tetromino definitions
const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#38bdf8' },
  O: { shape: [[1, 1], [1, 1]], color: '#fbbf24' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#c084fc' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#4ade80' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#60a5fa' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#fb923c' },
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
  const [level, setLevel] = useState<number>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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

  const resetGame = useCallback(() => {
    sound.playClick();
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setCurrentPiece(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;
    sound.playDrop();

    const newGrid = grid.map(row => [...row]);
    currentPiece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val !== 0) {
          const py = currentPiece.y + r;
          const px = currentPiece.x + c;
          if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
            newGrid[py][px] = currentPiece.color;
          }
        }
      });
    });

    // Check full lines
    let clearedLines = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== '');
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(''));
    }

    if (clearedLines > 0) {
      sound.playSuccess();
      const points = [0, 100, 300, 500, 800][clearedLines] * level;
      const newScore = score + points;
      const newLines = lines + clearedLines;
      const newLevel = Math.floor(newLines / 10) + 1;

      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);
      recordGameWin('tetris', newScore);
      onComplete?.(newScore);
    }

    setGrid(filteredGrid);

    const nextPiece = getRandomPiece();
    if (checkCollision(nextPiece, filteredGrid)) {
      sound.playError();
      setIsGameOver(true);
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [currentPiece, grid, score, lines, level, onComplete]);

  // Down tick timer
  useEffect(() => {
    if (isGameOver || isPaused || !currentPiece) return;

    const dropSpeed = Math.max(100, 700 - (level - 1) * 60);
    const interval = setInterval(() => {
      if (!checkCollision(currentPiece, grid, 0, 1)) {
        setCurrentPiece(p => (p ? { ...p, y: p.y + 1 } : null));
      } else {
        mergePiece();
      }
    }, dropSpeed);

    return () => clearInterval(interval);
  }, [currentPiece, grid, isGameOver, isPaused, level, mergePiece]);

  // Movements
  const moveLeft = () => {
    if (!currentPiece || isGameOver || isPaused) return;
    if (!checkCollision(currentPiece, grid, -1, 0)) {
      sound.playSlide();
      setCurrentPiece(p => (p ? { ...p, x: p.x - 1 } : null));
    }
  };

  const moveRight = () => {
    if (!currentPiece || isGameOver || isPaused) return;
    if (!checkCollision(currentPiece, grid, 1, 0)) {
      sound.playSlide();
      setCurrentPiece(p => (p ? { ...p, x: p.x + 1 } : null));
    }
  };

  const moveDown = () => {
    if (!currentPiece || isGameOver || isPaused) return;
    if (!checkCollision(currentPiece, grid, 0, 1)) {
      setCurrentPiece(p => (p ? { ...p, y: p.y + 1 } : null));
    } else {
      mergePiece();
    }
  };

  const hardDrop = () => {
    if (!currentPiece || isGameOver || isPaused) return;
    let dropOffset = 0;
    while (!checkCollision(currentPiece, grid, 0, dropOffset + 1)) {
      dropOffset++;
    }
    const droppedPiece = { ...currentPiece, y: currentPiece.y + dropOffset };
    setCurrentPiece(droppedPiece);
    setTimeout(() => mergePiece(), 50);
  };

  const rotate = () => {
    if (!currentPiece || isGameOver || isPaused) return;
    const newShape = rotatePiece(currentPiece);
    const testPiece = { ...currentPiece, shape: newShape };
    if (!checkCollision(testPiece, grid)) {
      sound.playClick();
      setCurrentPiece(testPiece);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveLeft();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveRight();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        moveDown();
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        rotate();
      } else if (e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 02</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            TETRIS <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">STACK</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">SCORE</span>
            <span className="text-sm font-bold text-amber-400">{score}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">LINES</span>
            <span className="text-sm font-bold text-white">{lines}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tetris Board Matrix */}
      <div className="relative p-1 bg-[#070707] border border-white/20 rounded-[2px] grid grid-cols-10 grid-rows-20 gap-0.5 w-60 aspect-[10/20] shadow-2xl overflow-hidden">
        {grid.map((row, r) =>
          row.map((color, c) => {
            let activeColor = color;
            if (currentPiece) {
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
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-[1px] transition-colors duration-75 ${
                  activeColor
                    ? 'border border-white/20 shadow-sm'
                    : 'bg-[#0e0e0e] border border-white/[0.03]'
                }`}
                style={{ backgroundColor: activeColor || undefined }}
              />
            );
          })
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase mb-1">GRID SATURATED</span>
            <h3 className="text-xl font-display font-bold text-white mb-2">GAME OVER</h3>
            <p className="text-xs font-mono text-white/50 mb-4">TOTAL SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase rounded-[2px]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-4 gap-2 mt-4 w-60">
        <button
          onClick={moveLeft}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={rotate}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={moveRight}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={hardDrop}
          className="p-3 bg-white text-black active:bg-neutral-200 border border-white rounded-[2px] flex items-center justify-center font-bold"
          title="Hard Drop"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
