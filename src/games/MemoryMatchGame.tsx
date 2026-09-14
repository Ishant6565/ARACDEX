import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, CheckCircle, Sparkles, Award, Layers, Trophy } from 'lucide-react';

const SYMBOL_POOL = [
  '⚡', '💎', '🔥', '👑', '🌌', '⚔️', '👁️', '🌀', 
  '🔮', '🛡️', '🪐', '🧬', '🛸', '🎯', '🧪', '🏹', 
  '⚙️', '🗝️', '💡', '📡', '🕹️', '⚓', '🎲', '🛰️', 
  '🧿', '🌠', '🚀', '🌪️', '🪙', '🔋'
];

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export const MemoryMatchGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('memory'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Pair count based on level progression:
  // 1-15: 4 pairs (8 cards)
  // 16-35: 6 pairs (12 cards)
  // 36-60: 8 pairs (16 cards - 4x4 matrix)
  // 61-85: 10 pairs (20 cards)
  // 86-100: 12 pairs (24 cards)
  const pairCount = useMemo(() => {
    if (level <= 15) return 4;
    if (level <= 35) return 6;
    if (level <= 60) return 8;
    if (level <= 85) return 10;
    return 12;
  }, [level]);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const initGame = useCallback(() => {
    sound.playClick();
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    // Select pairCount symbols deterministically with level offset
    const levelSymbols = [];
    for (let i = 0; i < pairCount; i++) {
      levelSymbols.push(SYMBOL_POOL[(i + (level * 3)) % SYMBOL_POOL.length]);
    }

    const deck = [...levelSymbols, ...levelSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setTimer(0);
  }, [pairCount, level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    sound.playClick();
    const updatedCards = cards.map(c => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match!
        sound.playSuccess();
        const tMatch = window.setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatches(m => {
            const updated = m + 1;
            if (updated === pairCount) {
              setIsWon(true);
              const finalScore = Math.max(10, 1500 - moves * 20 - timer * 5 + level * 25);
              recordGameWin('memory', finalScore, 'MEMORY MATRIX', level);
              onComplete?.(finalScore);
            }
            return updated;
          });
        }, 350);
        timersRef.current.push(tMatch);
      } else {
        // No match
        sound.playError();
        const tNoMatch = window.setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 850);
        timersRef.current.push(tNoMatch);
      }
    }
  };

  const advanceNextLevel = () => {
    sound.playClick();
    const nextLvl = Math.min(100, level + 1);
    setLevel(nextLvl);
    setGameLevel('memory', nextLvl);
  };

  const selectLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('memory', targetLvl);
    setShowLevelPicker(false);
  };

  const gridColsClass = pairCount === 4 
    ? 'grid-cols-4 max-w-xs' 
    : pairCount === 6 
    ? 'grid-cols-3 sm:grid-cols-4 max-w-xs sm:max-w-sm' 
    : pairCount === 8 
    ? 'grid-cols-4 max-w-sm' 
    : pairCount === 10
    ? 'grid-cols-4 sm:grid-cols-5 max-w-sm sm:max-w-md'
    : 'grid-cols-4 sm:grid-cols-6 max-w-md';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08] gap-2">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 07</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            MEMORY <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
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
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-white">{moves}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-cyan-400">{timer}s</span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Level Status Header */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-white/50">
        <span>GRID: <span className="text-cyan-400 font-bold">{pairCount * 2} CARDS ({pairCount} PAIRS)</span></span>
        <span>SYNCHRONIZED: <span className="text-white font-bold">{matches}/{pairCount} PAIRS</span></span>
      </div>

      {/* Cards Matrix */}
      <div className={`grid ${gridColsClass} gap-2 w-full p-2 bg-[#070707] border border-cyan-500/30 rounded-[2px] shadow-[0_0_30px_rgba(6,182,212,0.12)]`}>
        {cards.map(card => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={`aspect-square flex items-center justify-center text-2xl rounded-[2px] transition-all duration-200 border ${
                card.isMatched
                  ? 'bg-cyan-500/20 border-cyan-400/50 scale-95 opacity-85 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : isRevealed
                  ? 'bg-[#181818] border-cyan-400 text-white shadow-md'
                  : 'bg-[#101010] border-white/10 hover:border-cyan-400/40 hover:bg-[#161616]'
              }`}
            >
              {isRevealed ? (
                <span>{card.symbol}</span>
              ) : (
                <span className="text-white/20 font-mono text-xs">?</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Win Modal */}
      {isWon && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/50 rounded-[2px] w-full text-center font-mono text-xs text-white">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-cyan-400">
            <Award className="w-4 h-4 text-cyan-400" /> ALL {pairCount} GLYPH PAIRS CONVERGED
          </div>
          <p className="text-white/60 mb-3">LEVEL {level} OF 100 COMPLETED IN {moves} MOVES & {timer} SECONDS.</p>
          <div className="flex gap-2">
            <button
              onClick={initGame}
              className="flex-1 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white/10 rounded-[2px]"
            >
              REPLAY
            </button>
            <button
              onClick={advanceNextLevel}
              className="flex-1 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              NEXT LEVEL ({level < 100 ? level + 1 : 100})
            </button>
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
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT MEMORY LEVEL
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
                100 progressive levels with expanding grid layouts (8 to 20 glyph matrix).
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
