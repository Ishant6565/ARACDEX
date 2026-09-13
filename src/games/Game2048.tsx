import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

type Board = number[][];

const BOARD_SIZE = 4;

function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
}

function addRandomTile(board: Board): Board {
  const emptyCoords: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) emptyCoords.push([r, c]);
    }
  }
  if (emptyCoords.length === 0) return board;
  const [r, c] = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

export const Game2048: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [board, setBoard] = useState<Board>(() => addRandomTile(addRandomTile(createEmptyBoard())));
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState<number>(0);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_2048') || '2048');
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = useCallback(() => {
    sound.playClick();
    const b = addRandomTile(addRandomTile(createEmptyBoard()));
    setBoard(b);
    setPrevBoard(null);
    setScore(0);
    setIsGameOver(false);
    setWon(false);
  }, []);

  const slideRow = (row: number[]): { newRow: number[]; gainedScore: number } => {
    const nonZero = row.filter(val => val !== 0);
    const newRow: number[] = [];
    let gainedScore = 0;

    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        newRow.push(mergedVal);
        gainedScore += mergedVal;
        i++;
      } else {
        newRow.push(nonZero[i]);
      }
    }
    while (newRow.length < BOARD_SIZE) {
      newRow.push(0);
    }
    return { newRow, gainedScore };
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;

    let changed = false;
    let gainedScore = 0;
    const currentBoard = board.map(r => [...r]);
    const newBoard = createEmptyBoard();

    if (direction === 'left' || direction === 'right') {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const row = currentBoard[r];
        const processRow = direction === 'right' ? [...row].reverse() : row;
        const res = slideRow(processRow);
        const finalRow = direction === 'right' ? res.newRow.reverse() : res.newRow;

        for (let c = 0; c < BOARD_SIZE; c++) {
          newBoard[r][c] = finalRow[c];
          if (newBoard[r][c] !== currentBoard[r][c]) changed = true;
        }
        gainedScore += res.gainedScore;
      }
    } else {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const col: number[] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          col.push(currentBoard[r][c]);
        }
        const processCol = direction === 'down' ? [...col].reverse() : col;
        const res = slideRow(processCol);
        const finalCol = direction === 'down' ? res.newRow.reverse() : res.newRow;

        for (let r = 0; r < BOARD_SIZE; r++) {
          newBoard[r][c] = finalCol[r];
          if (newBoard[r][c] !== currentBoard[r][c]) changed = true;
        }
        gainedScore += res.gainedScore;
      }
    }

    if (changed) {
      sound.playSlide();
      if (gainedScore > 0) {
        sound.playPop();
      }

      setPrevBoard(currentBoard);
      setPrevScore(score);

      const boardWithNewTile = addRandomTile(newBoard);
      const updatedScore = score + gainedScore;
      setBoard(boardWithNewTile);
      setScore(updatedScore);

      if (updatedScore > bestScore) {
        setBestScore(updatedScore);
        localStorage.setItem('arcadex_best_2048', String(updatedScore));
      }

      // Check win 2048 tile
      if (!won) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (boardWithNewTile[r][c] === 2048) {
              setWon(true);
              sound.playSuccess();
              recordGameWin('2048', updatedScore);
              onComplete?.(updatedScore);
            }
          }
        }
      }

      // Check Game Over
      let canMove = false;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (boardWithNewTile[r][c] === 0) canMove = true;
          if (c < BOARD_SIZE - 1 && boardWithNewTile[r][c] === boardWithNewTile[r][c + 1]) canMove = true;
          if (r < BOARD_SIZE - 1 && boardWithNewTile[r][c] === boardWithNewTile[r + 1][c]) canMove = true;
        }
      }

      if (!canMove) {
        setIsGameOver(true);
        sound.playError();
      }
    }
  }, [board, isGameOver, score, bestScore, won, onComplete]);

  // Undo move
  const undo = () => {
    if (!prevBoard) return;
    sound.playClick();
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    setIsGameOver(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
  };

  const getTileStyle = (val: number) => {
    if (val === 0) return 'bg-[#0a0a0a] text-transparent border-white/[0.04]';
    switch (val) {
      case 2: return 'bg-[#121212] text-white/90 border-white/10 font-semibold';
      case 4: return 'bg-[#181818] text-white border-white/15 font-semibold';
      case 8: return 'bg-[#222222] text-amber-200 border-amber-500/30 font-bold';
      case 16: return 'bg-[#2a221b] text-amber-300 border-amber-500/40 font-bold';
      case 32: return 'bg-[#3b2416] text-amber-400 border-amber-500/60 font-bold';
      case 64: return 'bg-[#4a2610] text-amber-300 border-amber-500/80 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 128: return 'bg-[#11243b] text-blue-300 border-blue-500/60 font-bold';
      case 256: return 'bg-[#142e4d] text-blue-200 border-blue-500/80 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 512: return 'bg-[#1a385c] text-white border-blue-400 font-extrabold shadow-[0_0_25px_rgba(59,130,246,0.4)]';
      case 1024: return 'bg-white text-black font-black border-white shadow-[0_0_30px_rgba(255,255,255,0.5)]';
      case 2048: return 'bg-gradient-to-br from-amber-400 via-white to-amber-200 text-black font-black border-white shadow-[0_0_40px_rgba(245,158,11,0.7)]';
      default: return 'bg-white text-black font-black border-white';
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 01</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            2048 <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">SYNTH-GRID</span>
          </h2>
        </div>

        <div className="flex gap-2 font-mono">
          <div className="px-3 py-1.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">SCORE</span>
            <span className="text-base font-bold text-white tracking-tight">{score}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">RECORD</span>
            <span className="text-base font-bold text-amber-400 tracking-tight">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-mono text-white/40 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          USE ARROWS / SWIPE
        </span>
        <div className="flex gap-2">
          {prevBoard && (
            <button
              onClick={undo}
              className="px-3 py-1 text-xs font-mono text-white/70 hover:text-white bg-[#0d0d0d] hover:bg-[#151515] border border-white/[0.08] rounded-[2px] transition-all"
            >
              UNDO
            </button>
          )}
          <button
            onClick={initGame}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono text-white/70 hover:text-white bg-[#0d0d0d] hover:bg-[#151515] border border-white/[0.08] rounded-[2px] transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        </div>
      </div>

      {/* 4x4 Game Matrix Grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative p-2.5 bg-[#080808] border border-white/[0.12] rounded-[2px] grid grid-cols-4 gap-2.5 w-full aspect-square touch-none shadow-2xl"
      >
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center border rounded-[2px] text-xl sm:text-2xl transition-all duration-100 ease-out select-none ${getTileStyle(val)} ${val !== 0 ? 'tile-pop' : ''}`}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-2">SEQUENCE TERMINATED</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">NO VALID VECTORS</h3>
            <p className="text-xs font-mono text-white/50 mb-6">FINAL LOGIC SCORE: {score}</p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px]"
            >
              INITIALIZE RE-RUN
            </button>
          </div>
        )}

        {/* Victory 2048 Banner */}
        {won && !isGameOver && (
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] uppercase tracking-wider rounded-[2px] flex items-center gap-1.5 z-10">
            <Award className="w-3.5 h-3.5" /> 2048 SYNCHRONIZED
          </div>
        )}
      </div>

      {/* Mobile Virtual D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 mt-6 w-48 sm:hidden">
        <div></div>
        <button
          onClick={() => move('up')}
          className="p-3 bg-[#0d0d0d] active:bg-[#222] border border-white/[0.08] flex items-center justify-center rounded-[2px]"
        >
          <ArrowUp className="w-4 h-4 text-white" />
        </button>
        <div></div>
        <button
          onClick={() => move('left')}
          className="p-3 bg-[#0d0d0d] active:bg-[#222] border border-white/[0.08] flex items-center justify-center rounded-[2px]"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => move('down')}
          className="p-3 bg-[#0d0d0d] active:bg-[#222] border border-white/[0.08] flex items-center justify-center rounded-[2px]"
        >
          <ArrowDown className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => move('right')}
          className="p-3 bg-[#0d0d0d] active:bg-[#222] border border-white/[0.08] flex items-center justify-center rounded-[2px]"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
