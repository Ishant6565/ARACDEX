import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Sparkles, Award, Eye, Shuffle, HelpCircle } from 'lucide-react';

type AnimeCharacter = {
  id: string;
  name: string;
  title: string;
  anime: string;
  quote: string;
  accent: string;
  avatarGlyph: string;
  runes: string[]; // 8 distinct rune fragments for 3x3 grid
};

const CHARACTERS: AnimeCharacter[] = [
  {
    id: 'gojo',
    name: 'GOJO SATORU',
    title: 'THE HONORED ONE',
    anime: 'JUJUTSU KAISEN',
    quote: 'Throughout heaven and earth, I alone am the honored one.',
    accent: '#818cf8',
    avatarGlyph: '🌀',
    runes: ['無', '限', '虚', '式', '茈', '獄', '門', '疆'],
  },
  {
    id: 'itachi',
    name: 'ITACHI UCHIHA',
    title: 'SHARINGAN GENIUS',
    anime: 'NARUTO SHIPPUDEN',
    quote: 'People live their lives bound by what they accept as correct and true.',
    accent: '#f87171',
    avatarGlyph: '👁️',
    runes: ['写', '輪', '眼', '天', '照', '月', '読', '烏'],
  },
  {
    id: 'zoro',
    name: 'RORONOA ZORO',
    title: 'KING OF HELL',
    anime: 'ONE PIECE',
    quote: 'Scars on the back are a swordsman\'s shame.',
    accent: '#34d399',
    avatarGlyph: '⚔️',
    runes: ['三', '刀', '流', '閻', '魔', '修', '羅', '斬'],
  },
  {
    id: 'levi',
    name: 'LEVI ACKERMAN',
    title: "HUMANITY'S STRONGEST",
    anime: 'ATTACK ON TITAN',
    quote: 'Give up on your dreams and die for us.',
    accent: '#38bdf8',
    avatarGlyph: '🦅',
    runes: ['調', '査', '兵', '団', '翼', '刃', '誓', '撃'],
  },
  {
    id: 'goku',
    name: 'SON GOKU',
    title: 'ULTRA INSTINCT',
    anime: 'DRAGON BALL SUPER',
    quote: 'I\'ll never stop pushing my limits!',
    accent: '#fbbf24',
    avatarGlyph: '⚡',
    runes: ['身', '勝', '手', '極', '意', '神', '気', '拳'],
  },
];

export const AnimePuzzleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [selectedChar, setSelectedChar] = useState<AnimeCharacter>(CHARACTERS[0]);
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // 3x3 sliding tile puzzle of 8 character runes + 1 empty slot (0)
  const shuffleBoard = useCallback(() => {
    sound.playClick();
    // Start with solved [1..8, 0] and perform 40 valid random moves so it is 100% solvable
    let current = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let zeroPos = 8;

    for (let i = 0; i < 40; i++) {
      const row = Math.floor(zeroPos / 3);
      const col = zeroPos % 3;
      const validNeighbors: number[] = [];
      if (row > 0) validNeighbors.push(zeroPos - 3);
      if (row < 2) validNeighbors.push(zeroPos + 3);
      if (col > 0) validNeighbors.push(zeroPos - 1);
      if (col < 2) validNeighbors.push(zeroPos + 1);

      const target = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      [current[zeroPos], current[target]] = [current[target], current[zeroPos]];
      zeroPos = target;
    }

    setBoard(current);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    shuffleBoard();
  }, [selectedChar, shuffleBoard]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const zeroIndex = board.indexOf(0);
    const r1 = Math.floor(index / 3);
    const c1 = index % 3;
    const r2 = Math.floor(zeroIndex / 3);
    const c2 = zeroIndex % 3;

    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

    sound.playSlide();
    const newBoard = [...board];
    [newBoard[index], newBoard[zeroIndex]] = [newBoard[zeroIndex], newBoard[index]];
    setBoard(newBoard);
    setMoves(m => m + 1);

    // Check Win
    let won = true;
    for (let i = 0; i < 8; i++) {
      if (newBoard[i] !== i + 1) {
        won = false;
        break;
      }
    }

    if (won) {
      sound.playSuccess();
      setIsWon(true);
      recordGameWin('anime', 1000 - moves * 15);
      onComplete?.(1000 - moves * 15);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 08</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            ANIME JIGSAW <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">RUNES</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-amber-400">{moves}</span>
          </div>
          <button
            onClick={shuffleBoard}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Reshuffle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Character Selector Pills */}
      <div className="flex gap-1.5 w-full mb-3 overflow-x-auto pb-1">
        {CHARACTERS.map(c => (
          <button
            key={c.id}
            onClick={() => {
              sound.playClick();
              setSelectedChar(c);
            }}
            className={`px-2.5 py-1 font-mono text-[10px] rounded-[2px] border transition-all whitespace-nowrap flex items-center gap-1 ${
              selectedChar.id === c.id
                ? 'bg-white text-black border-white font-bold shadow-sm'
                : 'bg-[#0e0e0e] text-white/60 border-white/[0.08] hover:text-white'
            }`}
          >
            <span>{c.avatarGlyph}</span>
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Character Quote Banner */}
      <div className="w-full p-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] mb-3 text-center">
        <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase block mb-0.5">
          {selectedChar.anime} // {selectedChar.title}
        </span>
        <p className="text-xs font-sans italic text-white/80">"{selectedChar.quote}"</p>
      </div>

      {/* 3x3 Anime Rune Grid */}
      <div className="relative p-2.5 bg-[#080808] border border-white/20 rounded-[2px] grid grid-cols-3 gap-2 w-64 aspect-square shadow-2xl">
        {board.map((val, idx) => {
          const runeChar = val > 0 ? selectedChar.runes[val - 1] : '';
          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={val === 0 || isWon}
              className={`flex flex-col items-center justify-center rounded-[2px] border transition-all duration-150 ${
                val === 0
                  ? 'bg-[#0d0d0d] border-transparent cursor-default'
                  : 'bg-[#141414] hover:bg-[#1f1f1f] border-white/20 text-white active:scale-95 shadow-md'
              }`}
            >
              {val !== 0 && (
                <>
                  <span className="text-2xl font-bold font-display" style={{ color: selectedChar.accent }}>
                    {runeChar}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">{val}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Status */}
      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-emerald-300 animate-fade-in">
          <Award className="w-4 h-4 text-amber-400" /> {selectedChar.name} RUNES FULLY HARMONIZED!
        </div>
      )}
    </div>
  );
};
