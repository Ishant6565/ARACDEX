import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GameInfo } from '../types';
import { X, Terminal, Share2, ChevronLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] bg-[#050505] flex flex-col overflow-hidden select-none animate-arena-enter">
      {/* Ambient background light leaks */}
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Arena Navigation Bar */}
      <header className="h-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] px-3 sm:px-6 bg-[#08080a]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          {/* Back to Lobby Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121215] hover:bg-[#1a1a20] border border-white/[0.1] hover:border-cyan-400/60 rounded-[3px] text-xs font-mono text-zinc-300 hover:text-white transition-all active:scale-95 group cursor-pointer"
            title="Exit Protocol to Lobby"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold tracking-wider">LOBBY</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Game Title & Protocol Indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            <span className="font-mono text-xs text-cyan-400 font-bold tracking-wider hidden sm:inline">
              PROTOCOL // {game.number}
            </span>
            <span className="font-display font-bold text-sm sm:text-base text-white tracking-tight">
              {game.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Share Button */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.medium();
              shareAchievement({
                gameTitle: game.title,
                customNote: `Playing ${game.title} on ARCADEX! Can you beat my highscore?`,
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 hover:border-emerald-300 rounded-[3px] transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
            title="Share Protocol on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] tracking-wider">SHARE</span>
          </button>

          {/* Close X */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-white/60 hover:text-white bg-[#141414] hover:bg-[#202020] border border-white/[0.08] hover:border-cyan-400/50 rounded-[3px] transition-colors cursor-pointer"
            title="Close Protocol"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Stage Arena (fills the screen with smooth scrolling) */}
      <main className="flex-1 w-full overflow-y-auto flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 relative z-10 scrollbar-thin">
        {renderGame()}
      </main>

      {/* Bottom Controls Bar */}
      <footer className="px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] bg-[#08080a] border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-white/40 shrink-0 z-20">
        <span className="flex items-center gap-1.5 truncate">
          <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
          CONTROLS: {game.controls}
        </span>
      </footer>
    </div>,
    document.body
  );
};

