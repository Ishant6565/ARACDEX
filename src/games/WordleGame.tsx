import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Award, AlertCircle, HelpCircle, Lightbulb, Check } from 'lucide-react';

const PUZZLE_WORDS = [
  { word: 'CYBER', clue: 'DIGITAL & FUTURISTIC' },
  { word: 'CHESS', clue: 'THE GAME OF KINGS' },
  { word: 'FOCUS', clue: 'DEEP MENTAL ATTENTION' },
  { word: 'BRAIN', clue: 'COGNITIVE INTELLECT' },
  { word: 'LOGIC', clue: 'RATIONAL DEDUCTION' },
  { word: 'PRIME', clue: 'HIGHEST QUALITY OR NUMBER' },
  { word: 'SHARP', clue: 'KEEN & RAZOR EDGED' },
  { word: 'SWIFT', clue: 'MOVING AT HIGH SPEED' },
  { word: 'SMART', clue: 'QUICK-WITTED INTELLIGENCE' },
  { word: 'LIGHT', clue: 'LUMINOUS ILLUMINATION' },
  { word: 'FORCE', clue: 'POWERFUL VECTOR' },
  { word: 'QUEST', clue: 'NOBLE ADVENTURE' },
  { word: 'MATRIX', clue: 'GRID RUNTIME' },
  { word: 'DREAM', clue: 'ASPIRATION OF THE MIND' },
  { word: 'ORBIT', clue: 'GRAVITATIONAL PATH' },
  { word: 'STORM', clue: 'ATMOSPHERIC TEMPEST' },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export const WordleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [currentPuzzle, setCurrentPuzzle] = useState<{ word: string; clue: string }>(PUZZLE_WORDS[0]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showRules, setShowRules] = useState<boolean>(true);

  const initGame = useCallback(() => {
    sound.playClick();
    const puzzle = PUZZLE_WORDS[Math.floor(Math.random() * PUZZLE_WORDS.length)];
    setCurrentPuzzle(puzzle);
    setGuesses([]);
    setCurrentGuess('');
    setIsWon(false);
    setIsGameOver(false);
    setToastMessage('');
    setHintsUsed(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      sound.playError();
      showToast('5 LETTERS REQUIRED! TYPE MORE LETTERS.');
      return;
    }

    sound.playPop();
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === currentPuzzle.word) {
      sound.playSuccess();
      setIsWon(true);
      const score = Math.max(50, (7 - newGuesses.length) * 150 - hintsUsed * 50);
      recordGameWin('wordle', score);
      onComplete?.(score);
    } else if (newGuesses.length >= 6) {
      sound.playError();
      setIsGameOver(true);
    }
  }, [currentGuess, guesses, currentPuzzle.word, hintsUsed, onComplete]);

  const handleKey = useCallback((key: string) => {
    if (isWon || isGameOver) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      sound.playClick();
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      sound.playClick();
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, isWon, isGameOver, submitGuess]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER') handleKey('ENTER');
      else if (k === 'BACKSPACE') handleKey('DEL');
      else if (/^[A-Z]$/.test(k)) handleKey(k);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKey]);

  // Give 1 free letter hint
  const giveHint = () => {
    if (isWon || isGameOver || hintsUsed >= 2) return;
    sound.playClick();
    const unrevealedIdx = [0, 1, 2, 3, 4].find(idx => {
      return !guesses.some(g => g[idx] === currentPuzzle.word[idx]);
    });
    if (unrevealedIdx !== undefined) {
      setHintsUsed(h => h + 1);
      showToast(`HINT: Letter #${unrevealedIdx + 1} is "${currentPuzzle.word[unrevealedIdx]}"`);
    }
  };

  const getLetterStatus = (letter: string, index: number, word: string) => {
    if (currentPuzzle.word[index] === letter) return 'bg-emerald-500 text-black font-bold border-emerald-400';
    if (currentPuzzle.word.includes(letter)) return 'bg-amber-400 text-black font-bold border-amber-300';
    return 'bg-[#1e1e1e] text-white/40 border-white/10';
  };

  const getKeyStatus = (key: string) => {
    let status = '';
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (currentPuzzle.word[i] === key) return 'bg-emerald-500 text-black font-bold border-emerald-400';
          if (currentPuzzle.word.includes(key)) status = 'bg-amber-400 text-black font-bold border-amber-300';
          else if (!status) status = 'bg-[#181818] text-white/30 border-white/[0.04]';
        }
      }
    }
    return status || 'bg-[#121212] text-white/80 hover:bg-[#202020] border-white/[0.08]';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 06</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            WORDLE <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">CIPHER</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">ATTEMPT</span>
            <span className="text-sm font-bold text-amber-400">{guesses.length}/6</span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Reset Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clue and Rules Strip */}
      <div className="w-full mb-3 space-y-1.5 font-mono text-xs">
        {/* Category Clue */}
        <div className="px-3 py-1.5 bg-[#0e0e0e] border border-white/[0.08] rounded-[2px] flex items-center justify-between">
          <span className="text-white/40 text-[10px] uppercase">SECRET CLUE:</span>
          <span className="font-bold text-amber-300 text-[11px]">{currentPuzzle.clue}</span>
        </div>

        {/* Color Legend (So users instantly understand) */}
        <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
          <div className="p-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-[1px]">
            🟩 SAHI SPOT
          </div>
          <div className="p-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 rounded-[1px]">
            🟨 WRONG SPOT
          </div>
          <div className="p-1 bg-[#181818] border border-white/10 text-white/40 rounded-[1px]">
            ⬛ NOT IN WORD
          </div>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="w-full py-1.5 px-3 mb-2 bg-amber-400 text-black font-mono font-bold text-[11px] rounded-[2px] text-center animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 6x5 Wordle Matrix */}
      <div className="grid grid-rows-6 gap-1.5 w-64 mb-3">
        {Array(6).fill(null).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrent = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5 h-11">
              {Array(5).fill(null).map((_, colIndex) => {
                let char = '';
                let style = 'bg-[#0a0a0a] border border-white/[0.08] text-white';

                if (guess) {
                  char = guess[colIndex];
                  style = getLetterStatus(char, colIndex, guess);
                } else if (isCurrent && currentGuess[colIndex]) {
                  char = currentGuess[colIndex];
                  style = 'bg-[#151515] border border-white/40 text-white font-bold scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`flex items-center justify-center font-mono text-base font-bold rounded-[2px] uppercase transition-all ${style}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Action helpers */}
      <div className="flex items-center justify-between w-full mb-2">
        <button
          onClick={giveHint}
          disabled={isWon || isGameOver || hintsUsed >= 2}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] font-mono text-[10px] text-amber-400"
        >
          <Lightbulb className="w-3 h-3" />
          {hintsUsed < 2 ? `REVEAL LETTER (${2 - hintsUsed} LEFT)` : 'NO HINTS LEFT'}
        </button>
        <span className="font-mono text-[10px] text-white/40">PRESS ENTER TO SUBMIT</span>
      </div>

      {/* Virtual QWERTY Keyboard */}
      <div className="w-full space-y-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map(k => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={`h-10 rounded-[2px] font-mono text-xs border transition-colors uppercase flex items-center justify-center ${
                  k === 'ENTER' || k === 'DEL' ? 'px-3 text-[10px] font-bold bg-[#181818] border-white/20 text-white' : 'w-8'
                } ${getKeyStatus(k)}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-emerald-300 animate-fade-in">
          <Award className="w-4 h-4 text-amber-400" /> EXCELLENT! CIPHER SOLVED: "{currentPuzzle.word}"!
        </div>
      )}

      {isGameOver && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-red-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400" /> ATTEMPTS EXHAUSTED. THE WORD WAS: "{currentPuzzle.word}"
        </div>
      )}
    </div>
  );
};
