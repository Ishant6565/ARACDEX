import React, { useEffect } from 'react';
import { GameInfo } from '../types';
import { X, Terminal } from 'lucide-react';
import { sound } from '../services/audio';

// Import All Game Components
import { SnakeGame } from '../games/SnakeGame';
import { TetrisGame } from '../games/TetrisGame';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { Connect4Game } from '../games/Connect4Game';
import { SimonGame } from '../games/SimonGame';
import { WordleGame } from '../games/WordleGame';
import { AnimePuzzleGame } from '../games/AnimePuzzleGame';
import { Slide15Game } from '../games/Slide15Game';
import { Game2048 } from '../games/Game2048';

interface GameModalProps {
  game: GameInfo;
  onClose: () => void;
  onGameComplete: (score: number) => void;
}

export const GameModal: React.FC<GameModalProps> = ({ game, onClose, onGameComplete }) => {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const renderGame = () => {
    switch (game.id) {
      case 'snake':
        return <SnakeGame onComplete={onGameComplete} />;
      case 'tetris':
        return <TetrisGame onComplete={onGameComplete} />;
      case 'memory':
        return <MemoryMatchGame onComplete={onGameComplete} />;
      case 'connect4':
        return <Connect4Game onComplete={onGameComplete} />;
      case 'simon':
        return <SimonGame onComplete={onGameComplete} />;
      case 'wordle':
        return <WordleGame onComplete={onGameComplete} />;
      case 'anime':
        return <AnimePuzzleGame onComplete={onGameComplete} />;
      case 'slide15':
        return <Slide15Game onComplete={onGameComplete} />;
      case '2048':
        return <Game2048 onComplete={onGameComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#080808] border border-white/20 rounded-[2px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs text-white/50 tracking-wider">
              PROTOCOL // {game.number}
            </span>
            <span className="font-display font-bold text-sm text-white">
              {game.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 text-white/60 hover:text-white bg-[#141414] hover:bg-[#222] border border-white/[0.08] rounded-[2px] transition-colors"
              title="Close Protocol (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Game Canvas & Stage */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          {renderGame()}
        </div>

        {/* Instructions Drawer Footer */}
        <div className="px-4 py-2.5 bg-[#050505] border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-white/40">
          <span className="flex items-center gap-1.5 truncate">
            <Terminal className="w-3 h-3 text-amber-400 shrink-0" />
            CONTROLS: {game.controls}
          </span>
          <span className="shrink-0">PRESS ESC TO RETURN</span>
        </div>
      </div>
    </div>
  );
};
