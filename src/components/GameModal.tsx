import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GameInfo } from '../types';
import { X, Terminal, Share2 } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { shareAchievement } from '../services/share';

// Dynamic Lazy Loading of Game Components for optimal initial bundle & PageSpeed
const SnakeGame = React.lazy(() => import('../games/SnakeGame').then(m => ({ default: m.SnakeGame })));
const TetrisGame = React.lazy(() => import('../games/TetrisGame').then(m => ({ default: m.TetrisGame })));
const MemoryMatchGame = React.lazy(() => import('../games/MemoryMatchGame').then(m => ({ default: m.MemoryMatchGame })));
const Connect4Game = React.lazy(() => import('../games/Connect4Game').then(m => ({ default: m.Connect4Game })));
const SimonGame = React.lazy(() => import('../games/SimonGame').then(m => ({ default: m.SimonGame })));
const WordleGame = React.lazy(() => import('../games/WordleGame').then(m => ({ default: m.WordleGame })));
const AnimePuzzleGame = React.lazy(() => import('../games/AnimePuzzleGame').then(m => ({ default: m.AnimePuzzleGame })));
const Slide15Game = React.lazy(() => import('../games/Slide15Game').then(m => ({ default: m.Slide15Game })));
const Game2048 = React.lazy(() => import('../games/Game2048').then(m => ({ default: m.Game2048 })));
const SudokuGame = React.lazy(() => import('../games/SudokuGame').then(m => ({ default: m.SudokuGame })));
const ChimpTestGame = React.lazy(() => import('../games/ChimpTestGame').then(m => ({ default: m.ChimpTestGame })));
const CorsiBlocksGame = React.lazy(() => import('../games/CorsiBlocksGame').then(m => ({ default: m.CorsiBlocksGame })));
const ArrowEscapeGame = React.lazy(() => import('../games/ArrowEscapeGame').then(m => ({ default: m.ArrowEscapeGame })));

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
    let component: React.ReactNode = null;
    switch (game.id) {
      case 'snake':
        component = <SnakeGame onComplete={onGameComplete} />;
        break;
      case 'tetris':
        component = <TetrisGame onComplete={onGameComplete} />;
        break;
      case '2048':
        component = <Game2048 onComplete={onGameComplete} />;
        break;
      case 'anime':
        component = <AnimePuzzleGame onComplete={onGameComplete} />;
        break;
      case 'sudoku':
        component = <SudokuGame onComplete={onGameComplete} />;
        break;
      case 'wordle':
        component = <WordleGame onComplete={onGameComplete} />;
        break;
      case 'memory':
        component = <MemoryMatchGame onComplete={onGameComplete} />;
        break;
      case 'simon':
        component = <SimonGame onComplete={onGameComplete} />;
        break;
      case 'chimp':
        component = <ChimpTestGame onComplete={onGameComplete} />;
        break;
      case 'corsi':
        component = <CorsiBlocksGame onComplete={onGameComplete} />;
        break;
      case 'connect4':
        component = <Connect4Game onComplete={onGameComplete} />;
        break;
      case 'slide15':
        component = <Slide15Game onComplete={onGameComplete} />;
        break;
      case 'arrow-escape':
        component = <ArrowEscapeGame onComplete={onGameComplete} />;
        break;
      default:
        component = null;
    }

    return (
      <React.Suspense fallback={
        <div className="flex flex-col items-center justify-center p-12 text-cyan-400 font-mono text-xs gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="tracking-widest">INITIALIZING PROTOCOL...</span>
        </div>
      }>
        {component}
      </React.Suspense>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in select-none p-2 sm:p-4 md:p-6">
      <div className="min-h-full flex items-center justify-center py-2 sm:py-4">
        {/* Modal Container */}
        <div className="relative w-full max-w-2xl bg-[#080808] border border-cyan-500/30 rounded-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] flex flex-col max-h-[92vh] sm:max-h-[96vh] overflow-hidden my-auto">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider">
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
                haptics.medium();
                shareAchievement({
                  gameTitle: game.title,
                  customNote: `Playing ${game.title} on ARCADEX! Can you beat my highscore?`,
                });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 hover:border-emerald-300 rounded-[2px] transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              title="Share Protocol on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px] tracking-wider">SHARE</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 text-white/60 hover:text-white bg-[#141414] hover:bg-[#222] border border-white/[0.08] hover:border-cyan-400/40 rounded-[2px] transition-colors"
              title="Close Protocol (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Game Canvas & Stage */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center scrollbar-thin">
          {renderGame()}
        </div>

        {/* Instructions Drawer Footer */}
        <div className="px-4 py-2.5 bg-[#050505] border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-white/40">
          <span className="flex items-center gap-1.5 truncate">
            <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
            CONTROLS: {game.controls}
          </span>
          <span className="shrink-0 text-cyan-400/60">PRESS ESC TO RETURN</span>
        </div>
      </div>
    </div>
  </div>,
  document.body
  );
};

