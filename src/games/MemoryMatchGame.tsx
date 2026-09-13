import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, CheckCircle, Sparkles, Award } from 'lucide-react';

const ICONS = ['⚡', '💎', '🔥', '👑', '🌌', '⚔️', '👁️', '🌀'];

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export const MemoryMatchGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const initGame = useCallback(() => {
    sound.playClick();
    const deck = [...ICONS, ...ICONS]
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
  }, []);

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
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatches(m => {
            const updated = m + 1;
            if (updated === ICONS.length) {
              setIsWon(true);
              const finalScore = Math.max(10, 1000 - moves * 20 - timer * 5);
              recordGameWin('memory', finalScore);
              onComplete?.(finalScore);
            }
            return updated;
          });
        }, 350);
      } else {
        // No match
        sound.playError();
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 850);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 03</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            MEMORY GLYPHS <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">4x4</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">MOVES</span>
            <span className="text-sm font-bold text-white">{moves}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block">TIME</span>
            <span className="text-sm font-bold text-amber-400">{timer}s</span>
          </div>
          <button
            onClick={initGame}
            className="p-2 text-white/60 hover:text-white bg-[#0d0d0d] border border-white/[0.08] rounded-[2px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid 4x4 */}
      <div className="p-3 bg-[#070707] border border-white/20 rounded-[2px] grid grid-cols-4 gap-2.5 w-full aspect-square shadow-2xl">
        {cards.map(card => {
          const showFace = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={showFace}
              className={`flex items-center justify-center text-2xl sm:text-3xl rounded-[2px] border transition-all duration-200 ${
                card.isMatched
                  ? 'bg-amber-400/20 border-amber-400/50 scale-95 opacity-80'
                  : showFace
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-100'
                  : 'bg-[#121212] hover:bg-[#1a1a1a] border-white/10 hover:border-white/30 text-transparent'
              }`}
            >
              {showFace ? card.symbol : ''}
            </button>
          );
        })}
      </div>

      {isWon && (
        <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-[2px] w-full text-center flex flex-col items-center gap-1.5 text-emerald-300 font-mono text-xs animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Award className="w-4 h-4 text-amber-400" /> ALL 8 GLYPH PAIRS CONVERGED
          </div>
          <span className="text-white/60">Solved in {moves} moves ({timer} seconds)</span>
        </div>
      )}
    </div>
  );
};
