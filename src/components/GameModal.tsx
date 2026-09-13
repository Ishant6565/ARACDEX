import React, { useEffect } from 'react';
import { GameInfo } from '../types';
import { X, Maximize2, HelpCircle, Terminal } from 'lucide-react';
import { sound } from '../services/audio';

// Import Game Components
import { Game2048 } from '../games/Game2048';
import { SudokuGame } from '../games/SudokuGame';
import { MinesweeperGame } from '../games/MinesweeperGame';
import { ChimpTestGame } from '../games/ChimpTestGame';
import { ColorFloodGame } from '../games/ColorFloodGame';
import { CorsiBlocksGame } from '../games/CorsiBlocksGame';

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
      case '2048':
        return <Game2048 onComplete={onGameComplete} />;
      case 'sudoku':
        return <SudokuGame onComplete={onGameComplete} />;
      case 'minesweeper':
        return <MinesweeperGame onComplete={onGameComplete} />;
      case 'chimp':
        return <ChimpTestGame onComplete={onGameComplete} />;
      case 'flood':
        return <ColorFloodGame onComplete={onGameComplete} />;
      case 'corsi':
        return <CorsiBlocksGame onComplete={onGameComplete} />;
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
            <span className="w-2 h-2 rounded-full bg-amber-400" />
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
