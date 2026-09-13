import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Award, Eye, Shuffle, CheckCircle, Image as ImageIcon } from 'lucide-react';

type AnimeCharacter = {
  id: string;
  name: string;
  title: string;
  anime: string;
  quote: string;
  accent: string;
  image: string; // Real picture URL in /anime/
};

const CHARACTERS: AnimeCharacter[] = [
  {
    id: 'gojo',
    name: 'GOJO SATORU',
    title: 'THE HONORED ONE',
    anime: 'JUJUTSU KAISEN',
    quote: 'Throughout heaven and earth, I alone am the honored one.',
    accent: '#6366f1',
    image: '/anime/gojo.svg',
  },
  {
    id: 'itachi',
    name: 'ITACHI UCHIHA',
    title: 'SHARINGAN GENIUS',
    anime: 'NARUTO SHIPPUDEN',
    quote: 'People live their lives bound by what they accept as correct and true.',
    accent: '#ef4444',
    image: '/anime/itachi.svg',
  },
  {
    id: 'zoro',
    name: 'RORONOA ZORO',
    title: 'KING OF HELL',
    anime: 'ONE PIECE',
    quote: 'Scars on the back are a swordsman\'s shame.',
    accent: '#10b981',
    image: '/anime/zoro.svg',
  },
  {
    id: 'levi',
    name: 'LEVI ACKERMAN',
    title: "HUMANITY'S STRONGEST",
    anime: 'ATTACK ON TITAN',
    quote: 'Give up on your dreams and die for us.',
    accent: '#38bdf8',
    image: '/anime/levi.svg',
  },
  {
    id: 'goku',
    name: 'SON GOKU',
    title: 'ULTRA INSTINCT',
    anime: 'DRAGON BALL SUPER',
    quote: 'I\'ll never stop pushing past my limits!',
    accent: '#fbbf24',
    image: '/anime/goku.svg',
  },
];

export const AnimePuzzleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [selectedChar, setSelectedChar] = useState<AnimeCharacter>(CHARACTERS[0]);
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // 3x3 sliding puzzle (values 1..8 + empty slot 0)
  // Generates 100% solvable scrambled state via valid simulated moves
  const shuffleBoard = useCallback(() => {
    sound.playClick();
    let current = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let zeroPos = 8;

    for (let i = 0; i < 35; i++) {
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
    setTimer(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    shuffleBoard();
  }, [selectedChar, shuffleBoard]);

  useEffect(() => {
    if (isWon || board.length === 0) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon, board]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const zeroIndex = board.indexOf(0);
    const r1 = Math.floor(index / 3);
    const c1 = index % 3;
    const r2 = Math.floor(zeroIndex / 3);
    const c2 = zeroIndex % 3;

    // Must be orthogonally adjacent
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

    sound.playSlide();
    const newBoard = [...board];
    [newBoard[index], newBoard[zeroIndex]] = [newBoard[zeroIndex], newBoard[index]];
    setBoard(newBoard);
    setMoves(m => m + 1);

    // Check if fully solved (1..8 in order)
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
      const score = Math.max(50, 1200 - moves * 12 - timer * 5);
      recordGameWin('anime', score);
      onComplete?.(score);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 07</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            ANIME JIGSAW <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">PICTURE</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-amber-400">{moves}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-white">{timer}s</span>
          </div>
          <button
            onClick={shuffleBoard}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
            title="Reshuffle Picture"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Character Selector Tabs */}
      <div className="flex gap-1.5 w-full mb-3 overflow-x-auto pb-1">
        {CHARACTERS.map(c => (
          <button
            key={c.id}
            onClick={() => {
              sound.playClick();
              setSelectedChar(c);
            }}
            className={`px-2.5 py-1 font-mono text-[10px] rounded-[2px] border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedChar.id === c.id
                ? 'bg-white text-black border-white font-bold shadow-md'
                : 'bg-[#0e0e0e] text-white/60 border-white/[0.08] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.accent }} />
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Target Preview & Quote Box */}
      <div className="w-full p-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] mb-3 flex items-center justify-between gap-3">
        {/* Miniature Target Preview Image */}
        <div className="relative w-12 h-12 rounded-[2px] border border-white/20 overflow-hidden shrink-0 group">
          <img
            src={selectedChar.image}
            alt={selectedChar.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest truncate">
              {selectedChar.anime} // {selectedChar.title}
            </span>
          </div>
          <p className="text-[11px] font-sans italic text-white/80 line-clamp-1">
            "{selectedChar.quote}"
          </p>
        </div>

        {/* Toggle numbers hint */}
        <button
          onClick={() => setShowNumbers(n => !n)}
          className={`px-2 py-1 text-[9px] font-mono rounded-[2px] border transition-all ${
            showNumbers
              ? 'bg-amber-400 text-black border-amber-400 font-bold'
              : 'bg-[#141414] text-white/60 border-white/[0.08]'
          }`}
        >
          {showNumbers ? '123 ON' : '123 OFF'}
        </button>
      </div>

      {/* 3x3 Anime Picture Sliding Jigsaw Grid */}
      <div className="relative p-1 bg-[#080808] border-2 border-white/20 rounded-[2px] grid grid-cols-3 gap-1 w-64 aspect-square shadow-2xl overflow-hidden">
        {board.map((val, idx) => {
          if (val === 0 && !isWon) {
            return (
              <div
                key={idx}
                className="w-full h-full bg-[#050505] rounded-[1px] border border-dashed border-white/10"
              />
            );
          }

          // In solved state, 9th tile (0) displays the bottom-right corner (val = 9)
          const actualVal = isWon && val === 0 ? 9 : val;
          const origRow = Math.floor((actualVal - 1) / 3);
          const origCol = (actualVal - 1) % 3;

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={isWon}
              style={{
                backgroundImage: `url(${selectedChar.image})`,
                backgroundSize: '300% 300%',
                backgroundPosition: `${origCol * 50}% ${origRow * 50}%`,
              }}
              className="relative w-full h-full rounded-[1px] border border-white/20 active:scale-95 transition-transform duration-100 shadow-sm flex items-start justify-start p-1"
            >
              {/* Optional number guide in corner */}
              {showNumbers && (
                <span className="bg-black/80 text-white font-mono text-[9px] px-1 py-0.2 rounded-[1px] border border-white/20 leading-none">
                  {actualVal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-[2px] w-full text-center flex items-center justify-center gap-2 font-mono text-xs text-emerald-300 animate-fade-in shadow-lg">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{selectedChar.name} PORTRAIT RESTORED IN {moves} MOVES!</span>
        </div>
      )}
    </div>
  );
};
