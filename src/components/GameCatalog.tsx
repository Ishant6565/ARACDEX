import React, { useState } from 'react';
import { GameCategory, GameInfo } from '../types';
import { sound } from '../services/audio';
import { Play, Clock, Award, ArrowUpRight } from 'lucide-react';

export const GAMES_LIST: GameInfo[] = [
  {
    id: '2048',
    number: '01',
    title: '2048 SYNTH',
    subtitle: 'Exponential Number Merging',
    category: 'math',
    difficulty: 'Intermediate',
    estimatedTime: '5-10m',
    description: 'Slide matching tiles to compound values until the coveted 2048 monolith converges. Keyboard arrow keys or touch swipe enabled.',
    instructions: [
      'Use Arrow keys (W,A,S,D) or swipe to slide all tiles.',
      'Matching numbers merge into double their value (2+2=4, 4+4=8).',
      'Reach the 2048 tile to complete the protocol.'
    ],
    controls: 'ARROWS / WASD / TOUCH SWIPE',
    bestScoreKey: 'arcadex_best_2048',
    badge: 'POPULAR'
  },
  {
    id: 'sudoku',
    number: '02',
    title: 'SUDOKU CLASSIC',
    subtitle: 'Pure 9x9 Deductive Logic',
    category: 'logic',
    difficulty: 'Master',
    estimatedTime: '10-15m',
    description: 'A minimalist 9x9 grid with cell highlighting, pencil candidate mode, and conflict detection. Pure deductive clarity.',
    instructions: [
      'Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.',
      'Toggle pencil mode to annotate possible candidates.',
      'Avoid conflicting duplicate entries.'
    ],
    controls: 'NUMBER KEYS 1-9 / ON-SCREEN PAD',
    bestScoreKey: 'arcadex_best_sudoku'
  },
  {
    id: 'minesweeper',
    number: '03',
    title: 'MINESWEEPER RADAR',
    subtitle: 'Sector Hazard Demining',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '3-7m',
    description: 'First-click safe radar sweep. Uncover tiles, identify numbered threat vectors, and flag active ordnance.',
    instructions: [
      'Click cells to reveal neighbor hazard counts.',
      'Right-click or toggle Flag Mode to pin unexploded mines.',
      'Clear all non-mine sectors to win.'
    ],
    controls: 'LEFT CLICK (DIG) / RIGHT CLICK (FLAG)',
    bestScoreKey: 'arcadex_best_minesweeper'
  },
  {
    id: 'chimp',
    number: '04',
    title: 'AYUMU CHIMP TEST',
    subtitle: 'Primate Working Memory Span',
    category: 'memory',
    difficulty: 'Master',
    estimatedTime: '2-4m',
    description: 'Based on the famous Kyoto University working memory benchmark. Memorize the scatter of numbers before they mask into blank obsidian slabs.',
    instructions: [
      'Observe the positions of numbers 1 through N.',
      'Clicking 1 masks all remaining tiles.',
      'Recall and click the rest in ascending order without mistake.'
    ],
    controls: 'RAPID CLICK / TAP',
    bestScoreKey: 'arcadex_best_chimp',
    badge: 'BENCHMARK'
  },
  {
    id: 'flood',
    number: '05',
    title: 'COLOR FLOOD',
    subtitle: 'Chromatic Territorial Convergence',
    category: 'logic',
    difficulty: 'Elementary',
    estimatedTime: '1-3m',
    description: 'Fill the matrix with a single unified hue within 22 turns. Highly addictive topological cascade algorithm.',
    instructions: [
      'Start from the top-left origin cell.',
      'Select a palette color to absorb all adjacent cells of that color.',
      'Achieve 100% board dominance within the quota.'
    ],
    controls: 'PALETTE PICKER',
    bestScoreKey: 'arcadex_best_flood'
  },
  {
    id: 'corsi',
    number: '06',
    title: 'CORSI SPATIAL SPAN',
    subtitle: 'Neuropsychological Sequence Test',
    category: 'spatial',
    difficulty: 'Grandmaster',
    estimatedTime: '3-5m',
    description: 'A clinical spatial span test where geometric blocks light up with acoustic harmonic frequencies. Replicate the exact spatial trajectory.',
    instructions: [
      'Watch and listen as blocks pulse in an audio-spatial sequence.',
      'Replicate the exact sequence of blocks by tapping them.',
      'Sequence length increases with each successful round.'
    ],
    controls: 'BLOCK TAPPING',
    bestScoreKey: 'arcadex_best_corsi'
  },
];

export const GameCatalog: React.FC<{ onSelectGame: (game: GameInfo) => void }> = ({ onSelectGame }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredGames = activeCategory === 'all'
    ? GAMES_LIST
    : GAMES_LIST.filter(g => g.category === activeCategory);

  return (
    <section id="catalog" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-white/[0.08] gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase block mb-2">
            // OPERATIONAL MODULES
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            ACTIVE PROTOCOLS
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {[
            { id: 'all', label: 'ALL (06)' },
            { id: 'logic', label: '01 LOGIC' },
            { id: 'math', label: '02 MATH' },
            { id: 'memory', label: '03 MEMORY' },
            { id: 'spatial', label: '04 SPATIAL' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-[2px] transition-all border ${
                activeCategory === tab.id
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-[#0d0d0d] text-white/60 border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
          <div
            key={game.id}
            className="group relative bg-[#0a0a0a] border border-white/[0.08] hover:border-white/25 rounded-[2px] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          >
            {/* Top Card Info */}
            <div>
              <div className="flex items-center justify-between mb-4 font-mono text-[10px] text-white/40 uppercase">
                <span className="tracking-widest">PROTOCOL {game.number}</span>
                <div className="flex items-center gap-2">
                  {game.badge && (
                    <span className="px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-[1px]">
                      {game.badge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-white/[0.06] rounded-[1px] text-white/70">
                    {game.category}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-white group-hover:text-amber-200 transition-colors mb-1">
                {game.title}
              </h3>
              <p className="text-xs font-mono text-white/40 mb-4">
                {game.subtitle}
              </p>

              <p className="text-xs font-sans text-white/60 line-clamp-3 leading-relaxed mb-6">
                {game.description}
              </p>
            </div>

            {/* Bottom Card Controls & Launch */}
            <div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] font-mono text-[11px] text-white/40 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {game.estimatedTime}
                </span>
                <span>{game.difficulty}</span>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onSelectGame(game);
                }}
                className="w-full py-2.5 bg-[#121212] group-hover:bg-white group-hover:text-black border border-white/[0.12] group-hover:border-white font-mono text-xs font-bold uppercase tracking-widest text-white transition-all rounded-[2px] flex items-center justify-center gap-2"
              >
                INITIALIZE
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
