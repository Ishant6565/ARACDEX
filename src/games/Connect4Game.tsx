import React, { useState, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Bot, User, Trophy, Award } from 'lucide-react';

const COLS = 7;
const ROWS = 6;

type Cell = 0 | 1 | 2; // 0: empty, 1: player (amber), 2: AI/player 2 (cobalt)

export const Connect4Game: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [board, setBoard] = useState<Cell[][]>(() =>
    Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
  );
  const [turn, setTurn] = useState<1 | 2>(1);
  const [vsAI, setVsAI] = useState<boolean>(true);
  const [winner, setWinner] = useState<0 | 1 | 2 | 'DRAW'>(0);
  const [winLine, setWinLine] = useState<[number, number][]>([]);

  const checkWin = (b: Cell[][], p: Cell): [number, number][] | null => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) {
          return [[r, c], [r, c+1], [r, c+2], [r, c+3]];
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) {
          return [[r, c], [r+1, c], [r+2, c], [r+3, c]];
        }
      }
    }
    // Diagonal down-right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) {
          return [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]];
        }
      }
    }
    // Diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (b[r][c] === p && b[r-1][c+1] === p && b[r-2][c+2] === p && b[r-3][c+3] === p) {
          return [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]];
        }
      }
    }
    return null;
  };

  const getAiMove = (currentBoard: Cell[][]): number => {
    // 1. Check if AI can win in 1 move
    for (let c = 0; c < COLS; c++) {
      let lowestRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (currentBoard[r][c] === 0) {
          lowestRow = r;
          break;
        }
      }
      if (lowestRow !== -1) {
        currentBoard[lowestRow][c] = 2;
        const win = checkWin(currentBoard, 2);
        currentBoard[lowestRow][c] = 0;
        if (win) return c;
      }
    }

    // 2. Check if player can win in 1 move, block them!
    for (let c = 0; c < COLS; c++) {
      let lowestRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (currentBoard[r][c] === 0) {
          lowestRow = r;
          break;
        }
      }
      if (lowestRow !== -1) {
        currentBoard[lowestRow][c] = 1;
        const win = checkWin(currentBoard, 1);
        currentBoard[lowestRow][c] = 0;
        if (win) return c;
      }
    }

    // 3. Prefer center columns (3, 2, 4)
    const preferredCols = [3, 2, 4, 1, 5, 0, 6];
    for (const c of preferredCols) {
      if (currentBoard[0][c] === 0) return c;
    }

    return 0;
  };

  const dropDisc = useCallback((col: number) => {
    if (winner !== 0) return;

    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return; // column is full

    sound.playDrop();
    const newBoard = board.map(r => [...r]);
    newBoard[targetRow][col] = turn;
    setBoard(newBoard);

    // Check Win for player 1
    const playerWin = checkWin(newBoard, turn);
    if (playerWin) {
      sound.playSuccess();
      setWinner(turn);
      setWinLine(playerWin);
      if (turn === 1) {
        recordGameWin('connect4', 500);
        onComplete?.(500);
      }
      return;
    }

    // Check Board Full (Draw)
    const isFull = newBoard[0].every(cell => cell !== 0);
    if (isFull) {
      setWinner('DRAW');
      return;
    }

    // Next Turn
    if (vsAI && turn === 1) {
      setTurn(2);
      // AI Move delay
      setTimeout(() => {
        const aiCol = getAiMove(newBoard);
        let aiRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (newBoard[r][aiCol] === 0) {
            aiRow = r;
            break;
          }
        }
        if (aiRow !== -1) {
          sound.playDrop();
          const aiBoard = newBoard.map(r => [...r]);
          aiBoard[aiRow][aiCol] = 2;
          setBoard(aiBoard);

          const aiWin = checkWin(aiBoard, 2);
          if (aiWin) {
            sound.playError();
            setWinner(2);
            setWinLine(aiWin);
          } else {
            setTurn(1);
          }
        }
      }, 450);
    } else {
      setTurn(turn === 1 ? 2 : 1);
    }
  }, [board, turn, vsAI, winner, onComplete]);

  const resetGame = () => {
    sound.playClick();
    setBoard(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    setTurn(1);
    setWinner(0);
    setWinLine([]);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 04</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CONNECT 4 <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">RADIAL</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => {
              setVsAI(!vsAI);
              resetGame();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-[2px] transition-all ${
              vsAI
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : 'bg-[#0d0d0d] text-white/60 border-white/[0.08]'
            }`}
          >
            {vsAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            {vsAI ? 'VS AI' : 'VS 2P'}
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="flex items-center justify-between w-full mb-3 px-3 py-1.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] font-mono text-xs">
        <span className="text-white/50">CURRENT VECTOR:</span>
        <div className="flex items-center gap-2 font-bold">
          <div
            className={`w-3 h-3 rounded-full ${
              turn === 1 ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]'
            }`}
          />
          <span className={turn === 1 ? 'text-amber-400' : 'text-blue-400'}>
            {turn === 1 ? 'PLAYER 1 (AMBER)' : vsAI ? 'AI BOT (COBALT)' : 'PLAYER 2 (COBALT)'}
          </span>
        </div>
      </div>

      {/* 7x6 Board Grid */}
      <div className="relative p-3 bg-[#080808] border border-white/20 rounded-[2px] grid grid-cols-7 gap-2 w-full aspect-[7/6] shadow-2xl">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isWinningCell = winLine.some(([wr, wc]) => wr === r && wc === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => dropDisc(c)}
                disabled={winner !== 0}
                className="w-full aspect-square rounded-full bg-[#121212] border border-white/[0.08] flex items-center justify-center p-1 relative group hover:border-white/30 transition-all"
              >
                {cell !== 0 && (
                  <div
                    className={`w-full h-full rounded-full transition-transform duration-200 ${
                      cell === 1
                        ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                        : 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.7)]'
                    } ${isWinningCell ? 'scale-110 ring-2 ring-white animate-pulse' : ''}`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Status banner */}
      {winner !== 0 && (
        <div className="mt-4 p-3 bg-white/10 border border-white/30 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-white">
          <Award className="w-4 h-4 text-amber-400" />
          {winner === 'DRAW'
            ? 'TACTICAL STALEMATE (DRAW)'
            : winner === 1
            ? 'PLAYER 1 ACHIEVED 4-IN-A-ROW!'
            : vsAI
            ? 'AI TACTICAL VICTORY. TRY AGAIN!'
            : 'PLAYER 2 WON!'}
        </div>
      )}
    </div>
  );
};
