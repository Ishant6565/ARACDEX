import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Award, Eye, ChevronLeft, ChevronRight, Layers, CheckCircle } from 'lucide-react';

export type AnimeCharacter = {
  id: string;
  name: string;
  title: string;
  anime: string;
  category: 'Jujutsu Kaisen' | 'Naruto' | 'One Piece' | 'Attack on Titan' | 'Demon Slayer' | 'Legends';
  quote: string;
  accent: string;
  image: string;
};

export const CHARACTERS: AnimeCharacter[] = [
  {
    id: 'gojo',
    name: 'GOJO SATORU',
    title: 'THE HONORED ONE',
    anime: 'JUJUTSU KAISEN',
    category: 'Jujutsu Kaisen',
    quote: 'Throughout heaven and earth, I alone am the honored one.',
    accent: '#6366f1',
    image: '/anime/gojo.svg',
  },
  {
    id: 'sukuna',
    name: 'RYOMEN SUKUNA',
    title: 'KING OF CURSES',
    anime: 'JUJUTSU KAISEN',
    category: 'Jujutsu Kaisen',
    quote: 'Know your place, fool. Stand proud, you are strong.',
    accent: '#f43f5e',
    image: '/anime/sukuna.svg',
  },
  {
    id: 'naruto',
    name: 'NARUTO UZUMAKI',
    title: 'SEVENTH HOKAGE',
    anime: 'NARUTO SHIPPUDEN',
    category: 'Naruto',
    quote: 'I never go back on my word! That is my nindo, my ninja way!',
    accent: '#f97316',
    image: '/anime/naruto.svg',
  },
  {
    id: 'sasuke',
    name: 'SASUKE UCHIHA',
    title: 'SHADOW HOKAGE',
    anime: 'NARUTO SHIPPUDEN',
    category: 'Naruto',
    quote: 'I have long since closed my eyes... my only goal is in the darkness.',
    accent: '#8b5cf6',
    image: '/anime/sasuke.svg',
  },
  {
    id: 'itachi',
    name: 'ITACHI UCHIHA',
    title: 'SHARINGAN GENIUS',
    anime: 'NARUTO SHIPPUDEN',
    category: 'Naruto',
    quote: 'People live their lives bound by what they accept as correct and true.',
    accent: '#ef4444',
    image: '/anime/itachi.svg',
  },
  {
    id: 'kakashi',
    name: 'KAKASHI HATAKE',
    title: 'THE COPY NINJA',
    anime: 'NARUTO SHIPPUDEN',
    category: 'Naruto',
    quote: 'Those who break the rules are scum, but those who abandon their friends are worse than scum.',
    accent: '#38bdf8',
    image: '/anime/kakashi.svg',
  },
  {
    id: 'luffy',
    name: 'MONKEY D. LUFFY',
    title: 'SUN GOD NIKA',
    anime: 'ONE PIECE',
    category: 'One Piece',
    quote: "If you don't take risks, you can't create a future! I'm gonna be King of the Pirates!",
    accent: '#dc2626',
    image: '/anime/luffy.svg',
  },
  {
    id: 'zoro',
    name: 'RORONOA ZORO',
    title: 'KING OF HELL',
    anime: 'ONE PIECE',
    category: 'One Piece',
    quote: "Scars on the back are a swordsman's shame.",
    accent: '#10b981',
    image: '/anime/zoro.svg',
  },
  {
    id: 'sanji',
    name: 'VINSMOKE SANJI',
    title: 'BLACK LEG',
    anime: 'ONE PIECE',
    category: 'One Piece',
    quote: 'Cooking is a gift from the gods. Spices are a gift from the devil.',
    accent: '#3b82f6',
    image: '/anime/sanji.svg',
  },
  {
    id: 'levi',
    name: 'LEVI ACKERMAN',
    title: "HUMANITY'S STRONGEST",
    anime: 'ATTACK ON TITAN',
    category: 'Attack on Titan',
    quote: 'Give up on your dreams and die for us.',
    accent: '#0284c7',
    image: '/anime/levi.svg',
  },
  {
    id: 'eren',
    name: 'EREN YEAGER',
    title: 'THE ATTACK TITAN',
    anime: 'ATTACK ON TITAN',
    category: 'Attack on Titan',
    quote: "If you win, you live. If you lose, you die. Tatakae!",
    accent: '#10b981',
    image: '/anime/eren.svg',
  },
  {
    id: 'mikasa',
    name: 'MIKASA ACKERMAN',
    title: "HUMANITY'S HOPE",
    anime: 'ATTACK ON TITAN',
    category: 'Attack on Titan',
    quote: 'This world is cruel, but it is also very beautiful.',
    accent: '#e11d48',
    image: '/anime/mikasa.svg',
  },
  {
    id: 'goku',
    name: 'SON GOKU',
    title: 'ULTRA INSTINCT',
    anime: 'DRAGON BALL SUPER',
    category: 'Legends',
    quote: "I'll never stop pushing past my limits!",
    accent: '#06b6d4',
    image: '/anime/goku.svg',
  },
  {
    id: 'vegeta',
    name: 'PRINCE VEGETA',
    title: 'SAIYAN ROYALTY',
    anime: 'DRAGON BALL SUPER',
    category: 'Legends',
    quote: 'There is only one certainty in life. A strong man stands above and conquers all!',
    accent: '#2563eb',
    image: '/anime/vegeta.svg',
  },
  {
    id: 'tanjiro',
    name: 'TANJIRO KAMADO',
    title: 'SUN BREATHING',
    anime: 'DEMON SLAYER',
    category: 'Demon Slayer',
    quote: 'No matter how many people you may lose, you have no choice but to go on living.',
    accent: '#059669',
    image: '/anime/tanjiro.svg',
  },
  {
    id: 'nezuko',
    name: 'NEZUKO KAMADO',
    title: 'DEMON PRINCESS',
    anime: 'DEMON SLAYER',
    category: 'Demon Slayer',
    quote: 'Humans are to be protected and saved... I will never hurt them.',
    accent: '#f43f5e',
    image: '/anime/nezuko.svg',
  },
  {
    id: 'rengoku',
    name: 'KYOUJURO RENGOKU',
    title: 'FLAME HASHIRA',
    anime: 'DEMON SLAYER',
    category: 'Demon Slayer',
    quote: 'Set your heart ablaze! Proceed past your limits!',
    accent: '#06b6d4',
    image: '/anime/rengoku.svg',
  },
  {
    id: 'saitama',
    name: 'SAITAMA',
    title: 'THE CAPED BALDY',
    anime: 'ONE PUNCH MAN',
    category: 'Legends',
    quote: "I'm just a guy who is a hero for fun.",
    accent: '#22d3ee',
    image: '/anime/saitama.svg',
  },
  {
    id: 'jinwoo',
    name: 'SUNG JIN-WOO',
    title: 'SHADOW MONARCH',
    anime: 'SOLO LEVELING',
    category: 'Legends',
    quote: 'ARISE. I am the hunter who conquered death.',
    accent: '#38bdf8',
    image: '/anime/jinwoo.svg',
  },
  {
    id: 'light',
    name: 'LIGHT YAGAMI',
    title: 'GOD OF THE NEW WORLD',
    anime: 'DEATH NOTE',
    category: 'Legends',
    quote: 'I will become the god of this new world!',
    accent: '#dc2626',
    image: '/anime/light.svg',
  },
  {
    id: 'killua',
    name: 'KILLUA ZOLDYCK',
    title: 'GODSPEED ASSASSIN',
    anime: 'HUNTER X HUNTER',
    category: 'Legends',
    quote: "We are friends, aren't we? There's nothing to thank me for.",
    accent: '#60a5fa',
    image: '/anime/killua.svg',
  },
  {
    id: 'kaneki',
    name: 'KEN KANEKI',
    title: 'ONE-EYED GHOUL',
    anime: 'TOKYO GHOUL',
    category: 'Legends',
    quote: "It's better to be hurt than to hurt others.",
    accent: '#e11d48',
    image: '/anime/kaneki.svg',
  },
];

const CATEGORIES = ['All', 'Jujutsu Kaisen', 'Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer', 'Legends'] as const;

export const AnimePuzzleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  // 100 Levels system
  const [level, setLevel] = useState<number>(() => getGameLevel('anime'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);

  // Determine grid size based on User's exact requirements:
  // Levels 1 - 50: 9 dabbo (3x3)
  // Levels 51 - 80: 16 dabbo (4x4)
  // Levels 81 - 100: 25 dabbo (5x5)
  const gridSize = useMemo(() => {
    if (level <= 50) return 3; // 9 dabbo
    if (level <= 80) return 4; // 16 dabbo
    return 5; // 25 dabbo
  }, [level]);

  const totalTiles = gridSize * gridSize;

  // Character selection: default maps to level or chosen by player
  const defaultChar = CHARACTERS[(level - 1) % CHARACTERS.length];
  const [selectedChar, setSelectedChar] = useState<AnimeCharacter>(defaultChar);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);

  // Sync default character on level change
  useEffect(() => {
    setSelectedChar(CHARACTERS[(level - 1) % CHARACTERS.length]);
  }, [level]);

  // Filter characters
  const filteredChars = useMemo(() => {
    return CHARACTERS.filter(c => activeCategory === 'All' || c.category === activeCategory);
  }, [activeCategory]);

  // Generate 100% solvable scrambled state via valid simulated moves
  const shuffleBoard = useCallback(() => {
    sound.playClick();
    const count = totalTiles;
    // Solved state: 1, 2, 3... count-1, 0 (where 0 is empty slot)
    const current = Array.from({ length: count }, (_, i) => (i === count - 1 ? 0 : i + 1));
    let zeroPos = count - 1;
    const scrambleMoves = 25 + Math.min(45, Math.floor(level * 0.6));

    for (let i = 0; i < scrambleMoves; i++) {
      const row = Math.floor(zeroPos / gridSize);
      const col = zeroPos % gridSize;
      const validNeighbors: number[] = [];
      if (row > 0) validNeighbors.push(zeroPos - gridSize);
      if (row < gridSize - 1) validNeighbors.push(zeroPos + gridSize);
      if (col > 0) validNeighbors.push(zeroPos - 1);
      if (col < gridSize - 1) validNeighbors.push(zeroPos + 1);

      const target = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      [current[zeroPos], current[target]] = [current[target], current[zeroPos]];
      zeroPos = target;
    }

    setBoard(current);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  }, [gridSize, totalTiles, level]);

  useEffect(() => {
    shuffleBoard();
  }, [level, selectedChar, shuffleBoard]);

  useEffect(() => {
    if (isWon || board.length === 0) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon, board]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const zeroIndex = board.indexOf(0);
    const r1 = Math.floor(index / gridSize);
    const c1 = index % gridSize;
    const r2 = Math.floor(zeroIndex / gridSize);
    const c2 = zeroIndex % gridSize;

    // Must be orthogonally adjacent
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

    sound.playSlide();
    const newBoard = [...board];
    [newBoard[index], newBoard[zeroIndex]] = [newBoard[zeroIndex], newBoard[index]];
    setBoard(newBoard);
    setMoves(m => m + 1);

    // Check if fully solved (1..totalTiles-1 in order)
    let won = true;
    for (let i = 0; i < totalTiles - 1; i++) {
      if (newBoard[i] !== i + 1) {
        won = false;
        break;
      }
    }

    if (won) {
      sound.playSuccess();
      setIsWon(true);
      const score = Math.max(100, level * 50 + 800 - moves * 8 - timer * 3);
      recordGameWin('anime', score, `ANIME JIGSAW LVL ${level}: ${selectedChar.name}`, level);
      onComplete?.(score);
    }
  };

  const handleNextLevel = () => {
    if (level < 100) {
      sound.playClick();
      const next = level + 1;
      setLevel(next);
      setGameLevel('anime', next);
    }
  };

  const handlePrevLevel = () => {
    if (level > 1) {
      sound.playClick();
      const prev = level - 1;
      setLevel(prev);
      setGameLevel('anime', prev);
    }
  };

  const selectSpecificLevel = (lvl: number) => {
    sound.playClick();
    setLevel(lvl);
    setGameLevel('anime', lvl);
    setShowLevelPicker(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto select-none">
      {/* Top Header & Level Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 w-full mb-2 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">
            PROTOCOL 04 // 100 LEVELS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            ANIME JIGSAW
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
          <div className="px-2 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[8px] text-white/40 uppercase block">MOVES</span>
            <span className="text-xs font-bold text-cyan-400">{moves}</span>
          </div>
          <div className="px-2 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[8px] text-white/40 uppercase block">TIME</span>
            <span className="text-xs font-bold text-white">{timer}s</span>
          </div>
          <button
            onClick={shuffleBoard}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-white/[0.08] rounded-[2px]"
            title="Reshuffle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Specification Banner according to user specifications */}
      <div className="w-full flex items-center justify-between px-3 py-1 bg-cyan-950/20 border border-cyan-500/20 rounded-[2px] mb-2 font-mono text-[10px]">
        <span className="text-cyan-400 font-bold">
          {level <= 50 ? 'PHASE 1: 9 DABBE (3x3 MATRIX)' : level <= 80 ? 'PHASE 2: 16 DABBE (4x4 MATRIX)' : 'APEX PHASE: 25 DABBE (5x5 MATRIX)'}
        </span>
        <span className="text-white/50">
          {gridSize}x{gridSize} ({totalTiles} SLABS)
        </span>
      </div>

      {/* 100-Level Selector Drawer / Dropdown */}
      {showLevelPicker && (
        <div className="w-full p-3 bg-[#0d0d0d] border border-cyan-500/40 rounded-[2px] mb-3 animate-fade-in shadow-2xl max-h-48 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.08]">
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
              SELECT LEVEL (1 TO 100)
            </span>
            <span className="font-mono text-[9px] text-white/40">
              1-50 (9) | 51-80 (16) | 81-100 (25)
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
                      : lvlNum <= 50
                      ? 'bg-[#141414] text-white/70 hover:bg-cyan-950 border-white/[0.06]'
                      : lvlNum <= 80
                      ? 'bg-[#18181f] text-sky-300 hover:bg-sky-950 border-sky-500/20'
                      : 'bg-[#1f1624] text-pink-300 hover:bg-pink-950 border-pink-500/20'
                  }`}
                >
                  {lvlNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Franchise Tabs & Carousel */}
      <div className="w-full mb-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              className={`px-2 py-0.5 font-mono text-[9px] rounded-[2px] border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                  : 'bg-[#0d0d0d] text-white/50 border-white/[0.06] hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Character Selector Horizontal Carousel */}
      <div className="w-full mb-2.5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {filteredChars.map(c => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setSelectedChar(c);
              }}
              className={`flex items-center gap-1.5 p-1 rounded-[2px] border transition-all shrink-0 text-left ${
                selectedChar.id === c.id
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-sm ring-1 ring-cyan-400/40'
                  : 'bg-[#0a0a0a] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="w-7 h-7 rounded-[2px] overflow-hidden border border-white/20 shrink-0 bg-black">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-mono text-[9px] font-bold text-white pr-1 truncate max-w-[70px]">
                {c.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Preview & Clue Box */}
      <div className="w-full p-2 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] mb-2.5 flex items-center justify-between gap-2 shadow-md">
        <div className="relative w-10 h-10 rounded-[2px] border border-white/20 overflow-hidden shrink-0 group bg-black">
          <img src={selectedChar.image} alt={selectedChar.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Eye className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-cyan-400" />
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider truncate">
              {selectedChar.anime} // {selectedChar.name}
            </span>
          </div>
          <p className="text-[10px] font-sans italic text-white/70 line-clamp-1">
            "{selectedChar.quote}"
          </p>
        </div>

        <button
          onClick={() => setShowNumbers(n => !n)}
          className={`px-2 py-1 text-[8px] font-mono rounded-[2px] border transition-all ${
            showNumbers
              ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
              : 'bg-[#141414] text-white/60 border-white/[0.08]'
          }`}
        >
          {showNumbers ? 'GUIDE ON' : 'GUIDE OFF'}
        </button>
      </div>

      {/* Jigsaw Grid Canvas (3x3 for Lv 1-50, 4x4 for Lv 51-80, 5x5 for Lv 81-100) */}
      <div
        className={`relative p-1.5 bg-[#060606] border-2 border-cyan-500/30 rounded-[3px] grid gap-1 w-72 sm:w-80 aspect-square shadow-2xl overflow-hidden`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {board.map((val, idx) => {
          if (val === 0 && !isWon) {
            return (
              <div
                key={idx}
                className="w-full h-full bg-[#050505] rounded-[1px] border border-dashed border-cyan-500/20"
              />
            );
          }

          // Solved state shows completed image
          const actualVal = isWon && val === 0 ? totalTiles : val;
          const origRow = Math.floor((actualVal - 1) / gridSize);
          const origCol = (actualVal - 1) % gridSize;

          const backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
          const xPercent = (origCol / (gridSize - 1)) * 100;
          const yPercent = (origRow / (gridSize - 1)) * 100;

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={isWon}
              style={{
                backgroundImage: `url(${selectedChar.image})`,
                backgroundSize,
                backgroundPosition: `${xPercent}% ${yPercent}%`,
              }}
              className="relative w-full h-full rounded-[1px] border border-white/20 active:scale-95 transition-transform duration-100 shadow-sm flex items-start justify-start p-1 cursor-pointer hover:border-cyan-400"
            >
              {showNumbers && (
                <span className="bg-black/85 text-cyan-300 font-mono text-[8px] font-bold px-1 py-0.2 rounded-[1px] border border-cyan-500/30 leading-none">
                  {actualVal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Banner with Level Up */}
      {isWon && (
        <div className="mt-3 p-3 bg-cyan-950/60 border border-cyan-400 rounded-[2px] w-full text-center flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-cyan-200 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>LEVEL {level} SYNCHRONIZED ({moves} MOVES)!</span>
          </div>
          {level < 100 ? (
            <button
              onClick={handleNextLevel}
              className="px-3 py-1.5 bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-[2px] hover:bg-cyan-300 transition-all shadow-md active:scale-95"
            >
              NEXT LEVEL {level + 1} →
            </button>
          ) : (
            <span className="text-pink-300 font-bold">ALL 100 LEVELS CONQUERED!</span>
          )}
        </div>
      )}
    </div>
  );
};
