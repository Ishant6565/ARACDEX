import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Award, AlertCircle } from 'lucide-react';

const WORD_LIST = [
  'CYBER', 'LOGIC', 'CHESS', 'FOCUS', 'BRAIN', 'SHARP', 'SWIFT', 'SMART',
  'POWER', 'PRIME', 'LIGHT', 'FORCE', 'QUEST', 'VIVID', 'CLOUD', 'MATRIX',
  'DREAM', 'SPACE', 'PULSE', 'SOUND', 'NEXUS', 'TITAN', 'SOLID', 'SPARK',
  'SHIFT', 'BLAZE', 'ECHO', 'STEEL', 'GRAVE', 'SOLAR', 'ORBIT', 'STORM'
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export const WordleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [targetWord, setTargetWord] = useState<string>('CYBER');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const initGame = useCallback(() => {
    sound.playClick();
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setIsWon(false);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      sound.playError();
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    sound.playPop();
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      sound.playSuccess();
      setIsWon(true);
      const score = (7 - newGuesses.length) * 150;
      recordGameWin('wordle', score);
      onComplete?.(score);
    } else if (newGuesses.length >= 6) {
      sound.playError();
      setIsGameOver(true);
    }
  }, [currentGuess, guesses, targetWord, onComplete]);

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

  // Physical keyboard
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

  const getLetterStatus = (letter: string, index: number, word: string) => {
    if (targetWord[index] === letter) return 'bg-emerald-500 text-black font-bold border-emerald-400';
    if (targetWord.includes(letter)) return 'bg-amber-400 text-black font-bold border-amber-300';
    return 'bg-[#181818] text-white/40 border-white/10';
  };

  const getKeyStatus = (key: string) => {
    let status = '';
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) return 'bg-emerald-500 text-black font-bold';
          if (targetWord.includes(key)) status = 'bg-amber-400 text-black font-bold';
          else if (!status) status = 'bg-[#1e1e1e] text-white/30';
        }
      }
    }
    return status || 'bg-[#121212] text-white/80 hover:bg-[#202020]';
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
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TRY</span>
            <span className="text-sm font-bold text-amber-400">{guesses.length}/6</span>
          </div>
          <button
            onClick={initGame}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wordle 6 Rows Grid */}
      <div className={`grid grid-rows-6 gap-1.5 w-64 mb-4 ${shake ? 'animate-bounce' : ''}`}>
        {Array(6).fill(null).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrent = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5 h-11">
              {Array(5).fill(null).map((_, colIndex) => {
                let char = '';
                let style = 'bg-[#0d0d0d] border border-white/[0.08] text-white';

                if (guess) {
                  char = guess[colIndex];
                  style = getLetterStatus(char, colIndex, guess);
                } else if (isCurrent && currentGuess[colIndex]) {
                  char = currentGuess[colIndex];
                  style = 'bg-[#141414] border border-white/40 text-white font-bold scale-105';
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

      {/* On-Screen Keyboard */}
      <div className="w-full space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map(k => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={`h-10 rounded-[2px] font-mono text-xs border border-white/[0.08] transition-colors uppercase flex items-center justify-center ${
                  k === 'ENTER' || k === 'DEL' ? 'px-3 text-[10px] font-bold' : 'w-8'
                } ${getKeyStatus(k)}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-emerald-300">
          <Award className="w-4 h-4 text-amber-400" /> CIPHER DECODED: {targetWord}!
        </div>
      )}

      {isGameOver && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400" /> ATTEMPTS EXHAUSTED. WORD WAS: {targetWord}
        </div>
      )}
    </div>
  );
};
