import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { Flag, RotateCcw, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const ROWS = 9;
const COLS = 9;
const MINES = 10;

export const MinesweeperGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [flagCount, setFlagCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [flagMode, setFlagMode] = useState<boolean>(false); // for mobile ease

  const initEmptyBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setIsGenerated(false);
    setIsGameOver(false);
    setIsWon(false);
    setFlagCount(0);
    setTimer(0);
  }, []);

  useEffect(() => {
    initEmptyBoard();
  }, [initEmptyBoard]);

  // Timer
  useEffect(() => {
    if (!isGenerated || isGameOver || isWon) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isGenerated, isGameOver, isWon]);

  const generateMines = (startR: number, startC: number, currentBoard: Cell[][]) => {
    let planted = 0;
    const b = currentBoard.map(row => row.map(cell => ({ ...cell })));

    while (planted < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      // Safe first click around 3x3 perimeter
      if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) continue;
      if (!b[r][c].isMine) {
        b[r][c].isMine = true;
        planted++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].isMine) {
              count++;
            }
          }
        }
        b[r][c].neighborMines = count;
      }
    }
    return b;
  };

  const revealCell = (r: number, c: number) => {
    if (isGameOver || isWon) return;

    let currentBoard = board;
    if (!isGenerated) {
      currentBoard = generateMines(r, c, board);
      setIsGenerated(true);
    }

    const cell = currentBoard[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      // Game over
      sound.playError();
      const finalBoard = currentBoard.map(row =>
        row.map(cItem => (cItem.isMine ? { ...cItem, isRevealed: true } : cItem))
      );
      setBoard(finalBoard);
      setIsGameOver(true);
      return;
    }

    sound.playClick();
    const newBoard = currentBoard.map(row => row.map(cItem => ({ ...cItem })));

    // Flood reveal empty spaces
    const queue: [number, number][] = [[r, c]];
    newBoard[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (newBoard[cr][cc].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const neighbor = newBoard[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                if (neighbor.neighborMines === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }

    setBoard(newBoard);

    // Check victory
    let won = true;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const item = newBoard[row][col];
        if (!item.isMine && !item.isRevealed) {
          won = false;
          break;
        }
      }
      if (!won) break;
    }

    if (won) {
      setIsWon(true);
      sound.playSuccess();
      const score = Math.max(1, 999 - timer);
      recordGameWin('minesweeper', score);
      onComplete?.(score);
    }
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (isGameOver || isWon) return;
    const cell = board[r][c];
    if (cell.isRevealed) return;

    sound.playPop();
    const newBoard = board.map(row => row.map(item => ({ ...item })));
    const target = newBoard[r][c];
    target.isFlagged = !target.isFlagged;
    setBoard(newBoard);
    setFlagCount(prev => (target.isFlagged ? prev + 1 : prev - 1));
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-blue-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-red-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-amber-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 03</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            MINESWEEPER <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">RADAR</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">MINES</span>
            <span className="text-sm font-bold text-amber-400">{MINES - flagCount}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">TIMER</span>
            <span className="text-sm font-bold text-white">{timer}s</span>
          </div>
          <button
            onClick={initEmptyBoard}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flag Mode Toggle */}
      <div className="flex items-center justify-between w-full mb-3">
        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs border rounded-[2px] transition-all ${
            flagMode
              ? 'bg-amber-400 text-black border-amber-400 font-bold'
              : 'bg-[#0d0d0d] text-white/70 border-white/[0.08]'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          {flagMode ? 'FLAG MODE: ON' : 'FLAG MODE: OFF (DIG)'}
        </button>

        <span className="text-[11px] font-mono text-white/40">
          RIGHT-CLICK TO FLAG
        </span>
      </div>

      {/* Grid */}
      <div className="p-2 bg-[#070707] border border-white/20 rounded-[2px] grid grid-cols-9 gap-1.5 w-full aspect-square shadow-2xl">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={e => toggleFlag(r, c, e)}
              className={`flex items-center justify-center font-mono text-sm sm:text-base border rounded-[1px] transition-colors ${
                cell.isRevealed
                  ? cell.isMine
                    ? 'bg-red-900 border-red-500 text-white font-bold'
                    : 'bg-[#111] border-white/[0.04]'
                  : 'bg-[#1a1a1a] hover:bg-[#252525] border-white/[0.12] text-white'
              }`}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  '💣'
                ) : cell.neighborMines > 0 ? (
                  <span className={`font-bold ${getNumberColor(cell.neighborMines)}`}>
                    {cell.neighborMines}
                  </span>
                ) : null
              ) : cell.isFlagged ? (
                <Flag className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ) : null}
            </button>
          ))
        )}
      </div>

      {/* Feedback status */}
      {isGameOver && (
        <div className="mt-4 p-3 bg-red-950/50 border border-red-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 text-red-300 font-mono text-xs">
          <AlertTriangle className="w-4 h-4" />
          DETONATION OCCURRED. RETRY FOR PROTOCOL CLEARANCE.
        </div>
      )}

      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 text-emerald-300 font-mono text-xs">
          <CheckCircle className="w-4 h-4" />
          SECTOR SECURED IN {timer}s! ACCURACY 100%.
        </div>
      )}
    </div>
  );
};
