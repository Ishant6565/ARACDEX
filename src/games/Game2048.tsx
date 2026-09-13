import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Sparkles, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

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
  const [level, setLevel] = useState<number>(() => getGameLevel('2048'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  // Target tile based on level:
  // Lv 1-15: 128
  // Lv 16-35: 256
  // Lv 36-65: 512
  // Lv 66-90: 1024
  // Lv 91-100: 2048 (or 4096 for Apex)
  const targetTile = useMemo(() => {
    if (level <= 15) return 128;
    if (level <= 35) return 256;
    if (level <= 65) return 512;
    if (level <= 90) return 1024;
    return 2048;
  }, [level]);

  const [board, setBoard] = useState<Board>(() => addRandomTile(addRandomTile(createEmptyBoard())));
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState<number>(0);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_2048') || '0');
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [lastGain, setLastGain] = useState<{ amount: number; key: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [mergedCoords, setMergedCoords] = useState<Set<string>>(new Set());

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = useCallback(() => {
    sound.playClick();
    const b = addRandomTile(addRandomTile(createEmptyBoard()));
    setBoard(b);
    setPrevBoard(null);
    setScore(0);
    setIsGameOver(false);
    setWon(false);
    setLastGain(null);
    setMergedCoords(new Set());
  }, []);

  useEffect(() => {
    initGame();
  }, [level, initGame]);

  const slideRow = (row: number[]): { newRow: number[]; gainedScore: number; mergedIndices: number[] } => {
    const nonZero = row.filter(val => val !== 0);
    const newRow: number[] = [];
    const mergedIndices: number[] = [];
    let gainedScore = 0;

    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        mergedIndices.push(newRow.length);
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
    return { newRow, gainedScore, mergedIndices };
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;

    setActiveDirection(direction);
    setTimeout(() => setActiveDirection(null), 180);

    let changed = false;
    let gainedScore = 0;
    const currentBoard = board.map(r => [...r]);
    const newBoard = createEmptyBoard();
    const newMergedSet = new Set<string>();

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

        res.mergedIndices.forEach(idx => {
          const colIdx = direction === 'right' ? (BOARD_SIZE - 1 - idx) : idx;
          newMergedSet.add(`${r}-${colIdx}`);
        });

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

        res.mergedIndices.forEach(idx => {
          const rowIdx = direction === 'down' ? (BOARD_SIZE - 1 - idx) : idx;
          newMergedSet.add(`${rowIdx}-${c}`);
        });

        gainedScore += res.gainedScore;
      }
    }

    if (changed) {
      sound.playSlide();
      if (gainedScore > 0) {
        sound.playPop();
        setLastGain({ amount: gainedScore, key: Date.now() });
      }

      setPrevBoard(currentBoard);
      setPrevScore(score);
      setMergedCoords(newMergedSet);

      const boardWithNewTile = addRandomTile(newBoard);
      const updatedScore = score + gainedScore;
      setBoard(boardWithNewTile);
      setScore(updatedScore);

      if (updatedScore > bestScore) {
        setBestScore(updatedScore);
        localStorage.setItem('arcadex_best_2048', String(updatedScore));
      }

      // Check level target reach
      if (!won) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (boardWithNewTile[r][c] >= targetTile) {
              setWon(true);
              sound.playSuccess();
              recordGameWin('2048', updatedScore, `2048 SYNTH-GRID LVL ${level}`, level);
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
  }, [board, isGameOver, score, bestScore, won, targetTile, level, onComplete]);

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
      if (showLevelPicker) return;

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
  }, [move, showLevelPicker]);

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

    if (Math.abs(dx) > 25 || Math.abs(dy) > 25) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
  };

  const handleNextLevel = () => {
    if (level < 100) {
      sound.playClick();
      const next = level + 1;
      setLevel(next);
      setGameLevel('2048', next);
    }
  };

  const handlePrevLevel = () => {
    if (level > 1) {
      sound.playClick();
      const prev = level - 1;
      setLevel(prev);
      setGameLevel('2048', prev);
    }
  };

  const selectSpecificLevel = (lvl: number) => {
    sound.playClick();
    setLevel(lvl);
    setGameLevel('2048', lvl);
    setShowLevelPicker(false);
  };

  // Distinct colors for each number tile
  const getTileStyle = (val: number) => {
    if (val === 0) return 'bg-[#080808] text-transparent border-white/[0.04]';
    switch (val) {
      case 2:
        return 'bg-[#042f2e] text-[#5eead4] border-[#14b8a6]/40 shadow-[0_0_12px_rgba(20,184,166,0.25)] font-bold';
      case 4:
        return 'bg-[#064e3b] text-[#6ee7b7] border-[#10b981]/50 shadow-[0_0_14px_rgba(16,185,129,0.3)] font-bold';
      case 8:
        return 'bg-[#78350f] text-[#fef08a] border-[#f59e0b]/60 shadow-[0_0_16px_rgba(245,158,11,0.35)] font-extrabold';
      case 16:
        return 'bg-[#7c2d12] text-[#ffedd5] border-[#ea580c]/70 shadow-[0_0_18px_rgba(234,88,12,0.4)] font-extrabold';
      case 32:
        return 'bg-[#881337] text-[#ffe4e6] border-[#f43f5e]/80 shadow-[0_0_20px_rgba(244,63,94,0.45)] font-extrabold';
      case 64:
        return 'bg-[#991b1b] text-[#fee2e2] border-[#ef4444] shadow-[0_0_24px_rgba(239,68,68,0.55)] font-black';
      case 128:
        return 'bg-[#854d0e] text-[#fef9c3] border-[#eab308] shadow-[0_0_28px_rgba(234,179,8,0.65)] font-black ring-1 ring-cyan-400/40';
      case 256:
        return 'bg-[#365314] text-[#ecfccb] border-[#84cc16] shadow-[0_0_30px_rgba(132,204,22,0.65)] font-black ring-1 ring-lime-400/50';
      case 512:
        return 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6] shadow-[0_0_32px_rgba(59,130,246,0.7)] font-black ring-1 ring-blue-400/60';
      case 1024:
        return 'bg-[#4c1d95] text-[#f3e8ff] border-[#8b5cf6] shadow-[0_0_36px_rgba(139,92,246,0.75)] font-black ring-2 ring-purple-400/70';
      case 2048:
        return 'bg-gradient-to-br from-[#06b6d4] via-[#67e8f9] to-[#0891b2] text-black border-cyan-300 font-black tile-cyan-pulse shadow-[0_0_45px_rgba(6,182,212,0.9)] ring-2 ring-cyan-300';
      case 4096:
        return 'bg-[#831843] text-[#fdf2f8] border-[#ec4899] shadow-[0_0_40px_rgba(236,72,153,0.8)] font-black ring-2 ring-pink-400';
      case 8192:
        return 'bg-[#164e63] text-[#ecfeff] border-[#06b6d4] shadow-[0_0_42px_rgba(6,182,212,0.85)] font-black ring-2 ring-cyan-400';
      default:
        return 'bg-white text-black font-black border-white shadow-[0_0_35px_rgba(255,255,255,0.7)]';
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">
            PROTOCOL 03 // 100 LEVELS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            2048 SYNTH
            <button
              onClick={() => setShowLevelPicker(p => !p)}
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-[2px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
            >
              <Layers className="w-3 h-3" /> LVL {level}/100
            </button>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={handlePrevLevel}
            disabled={level <= 1}
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-white/[0.08] text-white rounded-[2px]"
            title="Previous Level"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextLevel}
            disabled={level >= 100}
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-white/[0.08] text-white rounded-[2px]"
            title="Next Level"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="relative px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right min-w-[65px]">
            <span className="text-[8px] text-white/40 uppercase block">SCORE</span>
            <span className="text-xs font-bold text-white">{score}</span>
            {lastGain && (
              <span
                key={lastGain.key}
                className="score-float absolute -top-4 right-1 text-xs font-bold text-cyan-400 pointer-events-none"
              >
                +{lastGain.amount}
              </span>
            )}
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right min-w-[65px]">
            <span className="text-[8px] text-white/40 uppercase block">RECORD</span>
            <span className="text-xs font-bold text-cyan-400">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Target Tile Banner for this level */}
      <div className="w-full flex items-center justify-between px-3 py-1 bg-cyan-950/20 border border-cyan-500/20 rounded-[2px] mb-2 font-mono text-[10px]">
        <span className="text-cyan-400 font-bold">
          LEVEL {level} TARGET: SYNTHESIZE [{targetTile}] TILE
        </span>
        <span className="text-white/50">
          MAX EXPONENT: {targetTile}
        </span>
      </div>

      {/* Level Quick-Picker Grid */}
      {showLevelPicker && (
        <div className="w-full p-3 bg-[#0d0d0d] border border-cyan-500/40 rounded-[2px] mb-3 animate-fade-in shadow-2xl max-h-48 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.08]">
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
              SELECT 2048 LEVEL (1 TO 100)
            </span>
            <span className="font-mono text-[9px] text-white/40">
              TARGETS ESCALATE 128 → 2048
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 font-mono text-[9px]">
            {Array.from({ length: 100 }).map((_, i) => {
              const lvlNum = i + 1;
              const isCurrent = lvlNum === level;
              return (
                <button
                  key={lvlNum}
                  onClick={() => selectSpecificLevel(lvlNum)}
                  className={`py-1 rounded-[1px] border transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 text-black font-bold border-cyan-400'
                      : 'bg-[#141414] text-white/70 hover:bg-cyan-950 border-white/[0.06]'
                  }`}
                >
                  {lvlNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Actions Bar */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-mono text-cyan-400/70 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ARROWS / WASD / SWIPE
        </span>
        <div className="flex gap-2">
          {prevBoard && (
            <button
              onClick={undo}
              className="px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] transition-all active:scale-95"
            >
              UNDO
            </button>
          )}
          <button
            onClick={initGame}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] transition-all active:scale-95"
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
        className={`relative p-2 bg-[#060606] border-2 border-cyan-500/30 rounded-[3px] grid grid-cols-4 gap-2 w-full aspect-square touch-none shadow-2xl transition-shadow duration-200 ${
          activeDirection ? 'ring-1 ring-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : ''
        }`}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isMerged = mergedCoords.has(`${r}-${c}`);
            return (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center border rounded-[3px] select-none font-display tracking-tight transition-all duration-150 ease-out text-base sm:text-xl ${getTileStyle(
                  val
                )} ${val !== 0 ? (isMerged ? 'tile-merge' : 'tile-pop') : ''}`}
              >
                {val !== 0 ? (
                  <span className="flex items-center justify-center gap-0.5">
                    {val === targetTile && <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin mr-0.5" />}
                    {val}
                  </span>
                ) : (
                  ''
                )}
              </div>
            );
          })
        )}

        {/* Victory Level Completed Banner */}
        {won && !isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20 rounded-[2px]">
            <Award className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
            <span className="text-xs font-mono tracking-[0.25em] text-cyan-400 uppercase mb-1">
              TARGET [{targetTile}] CONVERGED
            </span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              LEVEL {level} COMPLETE!
            </h3>
            <p className="text-xs font-mono text-white/60 mb-5">LOGIC SCORE: {score}</p>
            <div className="flex gap-2">
              {level < 100 && (
                <button
                  onClick={handleNextLevel}
                  className="px-5 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all rounded-[2px] shadow-lg active:scale-95"
                >
                  NEXT LEVEL {level + 1} →
                </button>
              )}
              <button
                onClick={() => setWon(false)}
                className="px-4 py-2 bg-[#181818] text-white border border-white/20 font-mono text-xs uppercase rounded-[2px]"
              >
                CONTINUE PLAYING
              </button>
            </div>
          </div>
        )}

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20 rounded-[2px]">
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-2">SEQUENCE TERMINATED</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">NO VALID VECTORS</h3>
            <p className="text-xs font-mono text-white/50 mb-5">FINAL SCORE: {score}</p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-cyan-300 transition-all rounded-[2px] shadow-lg active:scale-95"
            >
              INITIALIZE RE-RUN
            </button>
          </div>
        )}
      </div>

      {/* Tactile D-Pad in Cyan Theme */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <button
          onClick={() => move('up')}
          className={`p-2.5 w-14 h-11 flex items-center justify-center rounded-[3px] border transition-all duration-100 ${
            activeDirection === 'up'
              ? 'bg-cyan-400 text-black border-cyan-400 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.7)]'
              : 'bg-[#0d0d0d] text-white/70 hover:text-white hover:bg-[#181818] border-white/[0.1] active:scale-95'
          }`}
          title="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => move('left')}
            className={`p-2.5 w-14 h-11 flex items-center justify-center rounded-[3px] border transition-all duration-100 ${
              activeDirection === 'left'
                ? 'bg-cyan-400 text-black border-cyan-400 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                : 'bg-[#0d0d0d] text-white/70 hover:text-white hover:bg-[#181818] border-white/[0.1] active:scale-95'
            }`}
            title="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('down')}
            className={`p-2.5 w-14 h-11 flex items-center justify-center rounded-[3px] border transition-all duration-100 ${
              activeDirection === 'down'
                ? 'bg-cyan-400 text-black border-cyan-400 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                : 'bg-[#0d0d0d] text-white/70 hover:text-white hover:bg-[#181818] border-white/[0.1] active:scale-95'
            }`}
            title="Move Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('right')}
            className={`p-2.5 w-14 h-11 flex items-center justify-center rounded-[3px] border transition-all duration-100 ${
              activeDirection === 'right'
                ? 'bg-cyan-400 text-black border-cyan-400 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                : 'bg-[#0d0d0d] text-white/70 hover:text-white hover:bg-[#181818] border-white/[0.1] active:scale-95'
            }`}
            title="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
