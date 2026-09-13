import React, { useState } from 'react';
import { GameCategory, GameInfo } from '../types';
import { sound } from '../services/audio';
import { Play, Clock, Award, ArrowUpRight, Flame, Sparkles } from 'lucide-react';

export const GAMES_LIST: GameInfo[] = [
  {
    id: 'snake',
    number: '01',
    title: 'SNAKE CYBER',
    subtitle: '60 FPS Reflex Grid',
    category: 'arcade',
    difficulty: 'Elementary',
    estimatedTime: '2-5m',
    description: 'The legendary arcade classic reimagined in high-contrast brutalist aesthetics. Collect neon food, scale your length, and dominate the matrix.',
    instructions: [
      'Use Arrow keys (W,A,S,D) or on-screen D-pad to steer.',
      'Consume glowing amber nodes to increase score and length.',
      'Avoid perimeter walls and self-collision.'
    ],
    controls: 'ARROWS / WASD / TOUCH CONTROLS',
    bestScoreKey: 'arcadex_best_snake',
    badge: 'POPULAR'
  },
  {
    id: 'tetris',
    number: '02',
    title: 'TETRIS MONOLITH',
    subtitle: 'Brutalist Block Matrix',
    category: 'arcade',
    difficulty: 'Intermediate',
    estimatedTime: '5-10m',
    description: 'Falling geometric tetrominoes with real-time rotation, soft/hard drops, line clearance chords, and progressive speed scaling.',
    instructions: [
      'Left/Right arrows to reposition falling block.',
      'Up arrow / W to rotate.',
      'Spacebar for instant hard drop, Down arrow for soft drop.',
      'Complete horizontal lines to clear and score.'
    ],
    controls: 'ARROWS + SPACEBAR / BUTTONS',
    bestScoreKey: 'arcadex_best_tetris',
    badge: 'CLASSIC'
  },
  {
    id: 'memory',
    number: '03',
    title: 'MEMORY GLYPHS',
    subtitle: '16-Card Spatial Convergence',
    category: 'memory',
    difficulty: 'Elementary',
    estimatedTime: '1-3m',
    description: 'Clean minimalist card-flip matching. Uncover 8 hidden pairs of geometric emblems with instant audio feedback and dopamine satisfaction.',
    instructions: [
      'Click cards to flip and reveal hidden glyph symbols.',
      'Match identical symbols to lock them open.',
      'Uncover all 8 pairs in minimum moves and time.'
    ],
    controls: 'CLICK / TAP CARDS',
    bestScoreKey: 'arcadex_best_memory',
    badge: 'ADDICTIVE'
  },
  {
    id: 'connect4',
    number: '04',
    title: 'CONNECT 4',
    subtitle: 'Tactical 4-In-A-Row vs AI',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '3-5m',
    description: 'Drop amber discs into a 7x6 radial grid against an intelligent AI bot or local 2-player mode. First to connect four wins.',
    instructions: [
      'Click any column to drop a disc into the lowest available slot.',
      'Connect 4 discs horizontally, vertically, or diagonally.',
      'Toggle VS AI or VS 2-Player anytime.'
    ],
    controls: 'COLUMN CLICK / TAP',
    bestScoreKey: 'arcadex_best_connect4'
  },
  {
    id: 'simon',
    number: '05',
    title: 'SIMON RHYTHM',
    subtitle: 'Harmonic Audio Sequence',
    category: 'memory',
    difficulty: 'Intermediate',
    estimatedTime: '2-4m',
    description: '4 luminous quadrants pulsing with real musical oscillator chords. Observe, listen, and repeat the escalating sequence.',
    instructions: [
      'Watch and listen as colored quadrants blink in sequence.',
      'Repeat the exact sequence by tapping the pads.',
      'Sequence length grows by 1 note every round.'
    ],
    controls: 'PAD TAPPING',
    bestScoreKey: 'arcadex_best_simon',
    badge: 'AUDIO SYNTH'
  },
  {
    id: 'wordle',
    number: '06',
    title: 'WORDLE CIPHER',
    subtitle: '5-Letter Decryption Challenge',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '2-4m',
    description: 'Guess the hidden 5-letter password in 6 attempts. Color-coded feedback indicates exact positions and letter presence.',
    instructions: [
      'Enter any 5-letter word guess.',
      'Green = correct letter in exact slot.',
      'Amber = letter exists in word, different slot.',
      'Gray = letter not present in word.'
    ],
    controls: 'QWERTY KEYBOARD / ON-SCREEN KEYS',
    bestScoreKey: 'arcadex_best_wordle',
    badge: 'DAILY'
  },
  {
    id: 'anime',
    number: '07',
    title: 'ANIME JIGSAW',
    subtitle: 'Legendary Runes & Crests',
    category: 'anime',
    difficulty: 'Master',
    estimatedTime: '3-6m',
    description: 'Slide fragmented character runes to reconstruct iconic anime titans: Gojo, Itachi, Zoro, Levi, and Goku with custom color accents.',
    instructions: [
      'Select your anime character from the top pills.',
      'Click adjacent rune tiles to slide them into the empty slot.',
      'Restore all 8 character runes in sequence 1 to 8.'
    ],
    controls: 'TILE CLICK / SLIDE',
    bestScoreKey: 'arcadex_best_anime',
    badge: 'ANIME SPECIAL'
  },
  {
    id: 'slide15',
    number: '08',
    title: '15-PUZZLE CLASSIC',
    subtitle: 'Solvable Sliding Matrix',
    category: 'puzzle',
    difficulty: 'Intermediate',
    estimatedTime: '3-8m',
    description: 'The definitive sliding tile math puzzle. 15 numbered slabs randomly scrambled in a 4x4 tray. Slide them back into ascending order.',
    instructions: [
      'Click tiles next to the empty slot to slide them.',
      'Arrange numbers 1 to 15 in left-to-right rows.',
      'Track your move count and completion timer.'
    ],
    controls: 'CLICK / SLIDE TILES',
    bestScoreKey: 'arcadex_best_slide15'
  },
  {
    id: '2048',
    number: '09',
    title: '2048 SYNTH',
    subtitle: 'Exponential Number Merging',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '5-10m',
    description: 'Slide matching tiles to compound values until the coveted 2048 monolith converges. Keyboard arrow keys or touch swipe enabled.',
    instructions: [
      'Use Arrow keys (W,A,S,D) or swipe to slide all tiles.',
      'Matching numbers merge into double their value (2+2=4, 4+4=8).',
      'Reach the 2048 tile to complete the protocol.'
    ],
    controls: 'ARROWS / WASD / TOUCH SWIPE',
    bestScoreKey: 'arcadex_best_2048'
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
            { id: 'all', label: 'ALL (09)' },
            { id: 'arcade', label: 'ARCADE' },
            { id: 'logic', label: 'LOGIC & STRATEGY' },
            { id: 'memory', label: 'MEMORY & AUDIO' },
            { id: 'anime', label: 'ANIME' },
            { id: 'puzzle', label: 'PUZZLES' },
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
                    <span className={`px-1.5 py-0.5 border rounded-[1px] font-bold ${
                      game.badge.includes('ANIME')
                        ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300'
                        : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                    }`}>
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
