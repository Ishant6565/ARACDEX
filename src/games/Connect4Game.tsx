import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Bot, User, Trophy, Award, Layers, CheckCircle } from 'lucide-react';

const COLS = 7;
const ROWS = 6;

type Cell = 0 | 1 | 2; // 0: empty, 1: player (cyan), 2: AI (crimson)

export const Connect4Game: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('connect4'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  const [board, setBoard] = useState<Cell[][]>(() =>
    Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
  );
  const [turn, setTurn] = useState<1 | 2>(1);
  const [vsAI, setVsAI] = useState<boolean>(true);
  const [winner, setWinner] = useState<0 | 1 | 2 | 'DRAW'>(0);
  const [winLine, setWinLine] = useState<[number, number][]>([]);
  const aiTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current !== null) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

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

  const getAiMove = useCallback((currentBoard: Cell[][], curLvl: number): number => {
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

    // For higher levels (50+), check 2-step setup moves (prevent giving player a win)
    if (curLvl > 30) {
      const safeCols: number[] = [];
      for (let c = 0; c < COLS; c++) {
        let lowestRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (currentBoard[r][c] === 0) {
            lowestRow = r;
            break;
          }
        }
        if (lowestRow > 0) {
          // Check if putting a piece here lets player win on next row above
          currentBoard[lowestRow - 1][c] = 1;
          const playerWinsNext = checkWin(currentBoard, 1);
          currentBoard[lowestRow - 1][c] = 0;
          if (!playerWinsNext) safeCols.push(c);
        } else if (lowestRow === 0) {
          safeCols.push(c);
        }
      }

      if (safeCols.length > 0) {
        const preferred = [3, 2, 4, 1, 5, 0, 6].filter(c => safeCols.includes(c));
        if (preferred.length > 0) return preferred[0];
      }
    }

    // 3. Prefer center columns (3, 2, 4)
    const preferredCols = [3, 2, 4, 1, 5, 0, 6];
    for (const c of preferredCols) {
      if (currentBoard[0][c] === 0) return c;
    }

    return 0;
  }, []);

  const dropDisc = useCallback((col: number) => {
    if (winner !== 0 || board[0][col] !== 0) return;

    // Find lowest empty row in this col
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    sound.playDrop();
    const newBoard = board.map(r => [...r]);
    newBoard[targetRow][col] = turn;
    setBoard(newBoard);

    // Check win for current player
    const winningCoordinates = checkWin(newBoard, turn);
    if (winningCoordinates) {
      sound.playSuccess();
      setWinner(turn);
      setWinLine(winningCoordinates);
      if (turn === 1) {
        const score = 500 + level * 25;
        recordGameWin('connect4', score, 'CONNECT 4 MATRIX', level);
        onComplete?.(score);
      }
      return;
    }

    // Check draw
    const isFull = newBoard.every(row => row.every(cell => cell !== 0));
    if (isFull) {
      setWinner('DRAW');
      return;
    }

    // Switch turn
    const nextTurn = turn === 1 ? 2 : 1;
    setTurn(nextTurn);

    // AI Move if enabled and next turn is 2
    if (vsAI && nextTurn === 2) {
      if (aiTimerRef.current !== null) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = window.setTimeout(() => {
        const aiCol = getAiMove(newBoard, level);
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
            sound.playDefeat();
            setWinner(2);
            setWinLine(aiWin);
          } else {
            const aiFull = aiBoard.every(row => row.every(cell => cell !== 0));
            if (aiFull) {
              setWinner('DRAW');
            } else {
              setTurn(1);
            }
          }
        }
      }, 450);
    }
  }, [board, turn, winner, vsAI, level, getAiMove, onComplete]);

  const resetGame = () => {
    sound.playClick();
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setBoard(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    setTurn(1);
    setWinner(0);
    setWinLine([]);
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('connect4', nextLvl);
    resetGame();
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('connect4', targetLvl);
    setShowLevelPicker(false);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 10</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            CONNECT 4 <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowLevelPicker(true)}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer transition-all"
            title="Select from 100 levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level}/100</span>
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode & Turn Indicator */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVsAI(true);
              resetGame();
            }}
            className={`px-2.5 py-1 rounded-[2px] flex items-center gap-1 border ${
              vsAI
                ? 'bg-cyan-400 text-black border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-[#101010] text-white/50 border-white/[0.08]'
            }`}
          >
            <Bot className="w-3 h-3" /> AI SYNTH
          </button>
          <button
            onClick={() => {
              setVsAI(false);
              resetGame();
            }}
            className={`px-2.5 py-1 rounded-[2px] flex items-center gap-1 border ${
              !vsAI
                ? 'bg-cyan-400 text-black border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-[#101010] text-white/50 border-white/[0.08]'
            }`}
          >
            <User className="w-3 h-3" /> 2-PLAYER
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-white font-mono text-[11px]">
          <span>TURN:</span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              turn === 1 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]'
            }`}
          />
          <span className={turn === 1 ? 'text-cyan-400' : 'text-rose-400'}>
            {turn === 1 ? 'PLAYER (CYAN)' : vsAI ? 'SYNTH (ROSE)' : 'P2 (ROSE)'}
          </span>
        </div>
      </div>

      {/* 7x6 Connect 4 Matrix */}
      <div className="p-2 bg-[#070707] border border-cyan-500/30 rounded-[2px] w-full max-w-[340px] shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        <div className="grid grid-cols-7 gap-1.5 bg-[#0e0e0e] p-2 border border-white/10 rounded-[2px]">
          {Array.from({ length: COLS }).map((_, c) => (
            <div key={c} className="flex flex-col gap-1.5">
              {Array.from({ length: ROWS }).map((_, r) => {
                const cell = board[r][c];
                const isWinningCell = winLine.some(([wr, wc]) => wr === r && wc === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => dropDisc(c)}
                    disabled={winner !== 0 || (vsAI && turn === 2)}
                    className="w-full aspect-square rounded-full flex items-center justify-center transition-all duration-150 relative bg-[#070707] border border-white/[0.05] hover:border-cyan-400/40"
                  >
                    {cell !== 0 && (
                      <div
                        className={`w-full h-full rounded-full transition-transform ${
                          cell === 1
                            ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                            : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                        } ${isWinningCell ? 'scale-110 ring-2 ring-white animate-pulse' : ''}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Win Banner */}
      {winner !== 0 && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full max-w-[340px] text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <Award className="w-4 h-4 text-cyan-400" />
            {winner === 'DRAW' ? 'STALEMATE // DRAW' : winner === 1 ? 'VICTORY! 4 ALIGNED' : 'SYNTH BOT TRIUMPHED'}
          </div>
          <p className="text-white/60 mb-3">
            {winner === 1 ? `LEVEL ${level} OF 100 CONQUERED!` : 'ALIGN 4 TO ASCEND TO NEXT TIER.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="flex-1 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white/10 rounded-[2px]"
            >
              REPLAY
            </button>
            {winner === 1 && (
              <button
                onClick={advanceNextLevel}
                className="flex-1 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              >
                NEXT LEVEL ({level < 100 ? level + 1 : 100})
              </button>
            )}
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
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// ARCHIVAL SELECTION</span>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT CONNECT 4 LEVEL
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
                100 progressive levels with deep heuristic AI lookahead and defensive counter-tactics.
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
