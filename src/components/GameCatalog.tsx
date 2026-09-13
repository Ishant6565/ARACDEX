import React, { useState } from 'react';
import { GameInfo } from '../types';
import { sound } from '../services/audio';
import { Layers, Play } from 'lucide-react';

export const GAMES_LIST: GameInfo[] = [
  {
    id: 'snake',
    number: '01',
    title: 'SNAKE CYBER',
    subtitle: '100 Speedrun Stages',
    category: 'arcade',
    difficulty: 'Elementary',
    estimatedTime: '2-5m',
    description: 'The legendary arcade classic reimagined in high-contrast brutalist aesthetics. 100 progressive levels with escalating velocity and maze obstacles.',
    instructions: [
      'Use Arrow keys (W,A,S,D) or on-screen D-pad to steer.',
      'Consume glowing cyan nodes to increase score and length.',
      'Reach the target score to unlock the next level.'
    ],
    controls: 'ARROWS / WASD / TOUCH CONTROLS',
    bestScoreKey: 'arcadex_best_snake',
    badge: '100 LEVELS'
  },
  {
    id: 'tetris',
    number: '02',
    title: 'TETRIS MONOLITH',
    subtitle: '100 Gravity Tiers',
    category: 'arcade',
    difficulty: 'Intermediate',
    estimatedTime: '5-10m',
    description: 'Falling geometric tetrominoes with real-time rotation, soft/hard drops, line clearance chords, and progressive 100-level speed scaling.',
    instructions: [
      'Left/Right arrows to reposition falling block.',
      'Up arrow / W to rotate.',
      'Spacebar for instant hard drop, Down arrow for soft drop.',
      'Complete lines to clear and advance levels.'
    ],
    controls: 'ARROWS + SPACEBAR / BUTTONS',
    bestScoreKey: 'arcadex_best_tetris',
    badge: '100 LEVELS'
  },
  {
    id: '2048',
    number: '03',
    title: '2048 SYNTH-GRID',
    subtitle: '100 Synthesis Targets',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '5-10m',
    description: 'Slide matching tiles to compound values across 100 progressive levels. Targets scale from 128 to 2048 and beyond with vivid number colors and smooth D-pad physics.',
    instructions: [
      'Use Arrow keys (W,A,S,D), D-pad buttons, or swipe to slide all tiles.',
      'Matching numbers merge into double their value.',
      'Reach the target tile for each level to advance.'
    ],
    controls: 'ARROWS / WASD / D-PAD / SWIPE',
    bestScoreKey: 'arcadex_best_2048',
    badge: '100 LEVELS'
  },
  {
    id: 'anime',
    number: '04',
    title: 'ANIME JIGSAW',
    subtitle: '100 Levels (9, 16 & 25 Slabs)',
    category: 'anime',
    difficulty: 'Master',
    estimatedTime: '3-6m',
    description: '100 progressive puzzle levels featuring 22 anime titans: Lv 1-50 (9 slabs), Lv 51-80 (16 slabs), Lv 81-100 (25 slabs). Solvable sliding mechanics with vector art.',
    instructions: [
      'Select level from 1 to 100 (Grid size adapts automatically).',
      'Click adjacent tiles to slide them into the empty slot.',
      'Restore the anime titan portrait to advance.'
    ],
    controls: 'TILE CLICK / TOUCH SLIDE',
    bestScoreKey: 'arcadex_best_anime',
    badge: '100 LEVELS'
  },
  {
    id: 'sudoku',
    number: '05',
    title: 'SUDOKU MONOLITH',
    subtitle: '100 Number Deduction Grids',
    category: 'logic',
    difficulty: 'Master',
    estimatedTime: '5-15m',
    description: '100 curated Sudoku puzzles from Beginner to Grandmaster. Fill the 9x9 matrix so each column, row, and 3x3 quadrant contains digits 1 to 9.',
    instructions: [
      'Click a cell to focus, then tap numbers 1-9.',
      'Use pencil notes for candidates.',
      'Complete all 81 slots without error.'
    ],
    controls: 'CLICK CELL + NUMBER PAD',
    bestScoreKey: 'arcadex_best_sudoku',
    badge: '100 LEVELS'
  },
  {
    id: 'wordle',
    number: '06',
    title: 'WORDLE CIPHER',
    subtitle: '100 Ciphers + Context Sentences',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '2-4m',
    description: '100 secret 5-letter cipher levels. Each level features a category clue and an example context sentence to guide your deductive reasoning.',
    instructions: [
      'Read the context sentence clue with the missing word.',
      'Enter any 5-letter word guess in 6 attempts.',
      'Cyan = exact slot, Dark Cyan = present in word.'
    ],
    controls: 'QWERTY KEYBOARD / ON-SCREEN KEYS',
    bestScoreKey: 'arcadex_best_wordle',
    badge: '100 LEVELS'
  },
  {
    id: 'memory',
    number: '07',
    title: 'MEMORY GLYPHS',
    subtitle: '100 Spatial Convergence Tiers',
    category: 'memory',
    difficulty: 'Elementary',
    estimatedTime: '1-3m',
    description: 'Clean minimalist card-flip matching spanning 100 stages with expanding card counts, tighter move quotas, and instant acoustic feedback.',
    instructions: [
      'Click cards to flip and reveal hidden glyph symbols.',
      'Match identical symbols to lock them open.',
      'Uncover all pairs in minimum moves to proceed.'
    ],
    controls: 'CLICK / TAP CARDS',
    bestScoreKey: 'arcadex_best_memory',
    badge: '100 LEVELS'
  },
  {
    id: 'simon',
    number: '08',
    title: 'SIMON RHYTHM',
    subtitle: '100 Harmonic Sequence Stages',
    category: 'memory',
    difficulty: 'Intermediate',
    estimatedTime: '2-4m',
    description: '4 luminous cyan quadrants pulsing with musical synthesizer chords across 100 escalating tempo and sequence stages.',
    instructions: [
      'Watch and listen as colored quadrants blink in sequence.',
      'Repeat the exact sequence by tapping the pads.',
      'Pass each milestone to unlock higher speed stages.'
    ],
    controls: 'PAD TAPPING',
    bestScoreKey: 'arcadex_best_simon',
    badge: '100 LEVELS'
  },
  {
    id: 'chimp',
    number: '09',
    title: 'CHIMP MEMORY',
    subtitle: '100 Working Memory Milestones',
    category: 'memory',
    difficulty: 'Master',
    estimatedTime: '2-4m',
    description: 'Legendary primate cognitive benchmark across 100 levels. Memorize spatial number positions before they mask, then tap in ascending order.',
    instructions: [
      'Memorize the positions of all numbered tiles.',
      'Click 1 to mask all other tiles into blanks.',
      'Recall and click remaining tiles: 2, 3, 4...'
    ],
    controls: 'CLICK / TAP TILES',
    bestScoreKey: 'arcadex_best_chimp',
    badge: '100 LEVELS'
  },
  {
    id: 'corsi',
    number: '10',
    title: 'CORSI BLOCKS',
    subtitle: '100 Spatial Span Challenges',
    category: 'memory',
    difficulty: 'Master',
    estimatedTime: '2-5m',
    description: 'Standard neuropsychological test measuring visuo-spatial memory across 100 escalating span lengths and complex spatial layouts.',
    instructions: [
      'Observe the sequence of glowing cyan blocks.',
      'Tap the blocks in the identical sequence.',
      'Span length grows with each cleared level.'
    ],
    controls: 'TAP SPATIAL BLOCKS',
    bestScoreKey: 'arcadex_best_corsi',
    badge: '100 LEVELS'
  },
  {
    id: 'connect4',
    number: '11',
    title: 'CONNECT 4',
    subtitle: '100 Tactical Bot Duels',
    category: 'logic',
    difficulty: 'Intermediate',
    estimatedTime: '3-5m',
    description: 'Drop cyan discs into a 7x6 radial grid against an intelligent AI bot across 100 progressive tactical challenge configurations.',
    instructions: [
      'Click any column to drop a disc into the lowest available slot.',
      'Connect 4 discs horizontally, vertically, or diagonally.',
      'Defeat the AI to advance through 100 tactical tiers.'
    ],
    controls: 'COLUMN CLICK / TAP',
    bestScoreKey: 'arcadex_best_connect4',
    badge: '100 LEVELS'
  },
  {
    id: 'slide15',
    number: '12',
    title: '15-PUZZLE CLASSIC',
    subtitle: '100 Scramble Matrix Tiers',
    category: 'puzzle',
    difficulty: 'Intermediate',
    estimatedTime: '3-8m',
    description: 'The definitive sliding tile math puzzle across 100 algorithmic difficulty tiers. 15 numbered slabs randomly scrambled in a 4x4 tray.',
    instructions: [
      'Click tiles next to the empty slot to slide them.',
      'Arrange numbers 1 to 15 in left-to-right rows.',
      'Beat the target move counts to clear each stage.'
    ],
    controls: 'CLICK / SLIDE TILES',
    bestScoreKey: 'arcadex_best_slide15',
    badge: '100 LEVELS'
  },
  {
    id: 'arrow-escape',
    number: '13',
    title: 'ARROW ESCAPE',
    subtitle: 'Unlimited Levels (Dynamic Grid)',
    category: 'puzzle',
    difficulty: 'Intermediate',
    estimatedTime: '2-5m',
    description: 'The viral untangle puzzle phenomenon. Arrows are trapped on a matrix pointing in 4 directions. Tap arrows whose exit path to the edge is unblocked so they can fly free. Untangle all arrows to clear each level.',
    instructions: [
      'Tap an arrow to launch it in its pointing direction.',
      'If its exit route to the grid border is clear, it escapes off-screen.',
      'If blocked by another arrow in front, it cannot move yet.',
      'Find the correct logical sequence to untangle and free every arrow!'
    ],
    controls: 'CLICK / TAP ARROWS',
    bestScoreKey: 'arcadex_best_arrow_escape',
    badge: 'UNLIMITED'
  },
];

// Visual Game Banners with themed colors and arcade motifs
const renderGameBanner = (gameId: string) => {
  switch (gameId) {
    case 'snake':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-emerald-950/40 via-cyan-950/20 to-black border border-emerald-500/20 flex items-center justify-center p-3">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:14px_14px]" />
          {/* Snake body segments */}
          <div className="relative flex items-center gap-1.5 z-10">
            <div className="w-3.5 h-3.5 rounded-[1px] bg-emerald-700/60 border border-emerald-500/30" />
            <div className="w-4 h-4 rounded-[1px] bg-emerald-600/70 border border-emerald-400/40" />
            <div className="w-4.5 h-4.5 rounded-[1px] bg-emerald-500 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="w-5 h-5 rounded-[2px] bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
            {/* Glowing food dot */}
            <div className="ml-6 w-3 h-3 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse" />
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400/80 tracking-widest uppercase">
            100 SPEED TIERS
          </span>
        </div>
      );

    case 'tetris':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black border border-cyan-500/20 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:14px_14px]" />
          <div className="relative flex items-end gap-1 z-10">
            {/* I-Block in Cyan */}
            <div className="flex flex-col gap-0.5">
              <div className="w-4 h-4 rounded-[1px] bg-cyan-400 border border-white/60 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
              <div className="w-4 h-4 rounded-[1px] bg-cyan-400 border border-white/60 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
              <div className="w-4 h-4 rounded-[1px] bg-cyan-400 border border-white/60 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
            </div>
            {/* T-Block in Purple */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-[1px] bg-purple-500 border border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              <div className="flex gap-0.5">
                <div className="w-4 h-4 rounded-[1px] bg-purple-500 border border-purple-300" />
                <div className="w-4 h-4 rounded-[1px] bg-purple-500 border border-purple-300" />
                <div className="w-4 h-4 rounded-[1px] bg-purple-500 border border-purple-300" />
              </div>
            </div>
            {/* O-Block in Amber */}
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-3.5 h-3.5 rounded-[1px] bg-amber-400 border border-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <div className="w-3.5 h-3.5 rounded-[1px] bg-amber-400 border border-amber-200" />
              <div className="w-3.5 h-3.5 rounded-[1px] bg-amber-400 border border-amber-200" />
              <div className="w-3.5 h-3.5 rounded-[1px] bg-amber-400 border border-amber-200" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase">
            100 GRAVITY TIERS
          </span>
        </div>
      );

    case '2048':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-amber-950/40 via-cyan-950/20 to-black border border-amber-500/20 flex items-center justify-center p-3">
          <div className="relative flex items-center gap-2 z-10">
            <div className="w-11 h-11 rounded-[2px] bg-zinc-900 border border-white/20 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono font-black text-zinc-300">256</span>
            </div>
            <div className="w-12 h-12 rounded-[2px] bg-amber-600/30 border border-amber-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <span className="text-xs font-mono font-black text-amber-300">1024</span>
            </div>
            <div className="w-14 h-14 rounded-[2px] bg-gradient-to-tr from-amber-500 to-yellow-300 text-black border border-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105">
              <span className="text-sm font-mono font-black tracking-tight">2048</span>
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-amber-400/80 tracking-widest uppercase">
            SYNTHESIS MATRIX
          </span>
        </div>
      );

    case 'anime':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-red-950/40 via-purple-950/30 to-black border border-purple-500/20 flex items-center justify-center p-3">
          <div className="relative flex items-center gap-3 z-10">
            {/* Anime Avatar Badges */}
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.6)] bg-black">
              <img src="/anime/kakashi.svg" alt="Kakashi" className="w-full h-full object-cover" />
            </div>
            <div className="w-14 h-14 rounded-full border-2 border-purple-400 overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.7)] bg-black -ml-3 z-10 scale-105">
              <img src="/anime/gojo.svg" alt="Gojo" className="w-full h-full object-cover" />
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.6)] bg-black -ml-3">
              <img src="/anime/naruto.svg" alt="Naruto" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-purple-300 tracking-widest uppercase">
            22 ANIME TITANS
          </span>
        </div>
      );

    case 'sudoku':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-indigo-950/40 via-cyan-950/20 to-black border border-indigo-500/20 flex items-center justify-center p-3">
          {/* 3x3 Mini Matrix */}
          <div className="grid grid-cols-3 gap-1 z-10">
            {['5', '3', '', '6', '', '', '', '9', '8'].map((n, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-[1px] flex items-center justify-center font-mono text-xs font-bold ${
                  n
                    ? 'bg-indigo-500/20 border border-indigo-400/40 text-cyan-300 shadow-[0_0_6px_rgba(99,102,241,0.3)]'
                    : 'bg-black/60 border border-white/10 text-white/20'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-indigo-300 tracking-widest uppercase">
            9X9 DEDUCTION
          </span>
        </div>
      );

    case 'wordle':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-emerald-950/40 via-cyan-950/20 to-black border border-emerald-500/20 flex items-center justify-center p-3">
          <div className="flex gap-1.5 z-10">
            {[
              { letter: 'A', status: 'correct' },
              { letter: 'R', status: 'correct' },
              { letter: 'C', status: 'present' },
              { letter: 'A', status: 'absent' },
              { letter: 'D', status: 'correct' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`w-7 h-8 rounded-[2px] flex items-center justify-center font-mono font-black text-xs ${
                  item.status === 'correct'
                    ? 'bg-emerald-600 text-white border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : item.status === 'present'
                    ? 'bg-amber-600 text-white border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {item.letter}
              </div>
            ))}
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400/80 tracking-widest uppercase">
            CIPHER CLUES
          </span>
        </div>
      );

    case 'memory':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-fuchsia-950/40 via-cyan-950/20 to-black border border-fuchsia-500/20 flex items-center justify-center p-3">
          <div className="flex gap-2.5 z-10">
            <div className="w-8 h-10 rounded-[2px] bg-fuchsia-600/30 border border-fuchsia-400 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.4)]">
              <span className="text-base text-fuchsia-300">✦</span>
            </div>
            <div className="w-8 h-10 rounded-[2px] bg-fuchsia-600/30 border border-fuchsia-400 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.4)]">
              <span className="text-base text-fuchsia-300">✦</span>
            </div>
            <div className="w-8 h-10 rounded-[2px] bg-cyan-600/30 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <span className="text-base text-cyan-300">▲</span>
            </div>
            <div className="w-8 h-10 rounded-[2px] bg-zinc-900 border border-white/20 flex items-center justify-center">
              <span className="text-xs text-zinc-500 font-mono">?</span>
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-fuchsia-300 tracking-widest uppercase">
            GLYPH MATCHING
          </span>
        </div>
      );

    case 'simon':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black border border-cyan-500/20 flex items-center justify-center p-3">
          <div className="grid grid-cols-2 gap-2 z-10">
            <div className="w-8 h-8 rounded-tl-xl bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse" />
            <div className="w-8 h-8 rounded-tr-xl bg-emerald-500/50 border border-emerald-400/40" />
            <div className="w-8 h-8 rounded-bl-xl bg-amber-500/50 border border-amber-400/40" />
            <div className="w-8 h-8 rounded-br-xl bg-rose-500/50 border border-rose-400/40" />
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400 tracking-widest uppercase">
            HARMONIC AUDIO
          </span>
        </div>
      );

    case 'chimp':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-teal-950/40 via-cyan-950/20 to-black border border-teal-500/20 flex items-center justify-center p-3">
          <div className="flex gap-2 z-10">
            <div className="w-8 h-8 rounded-[2px] bg-cyan-400 text-black font-mono font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              1
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-teal-500/30 border border-teal-400 text-teal-300 font-mono font-black text-sm flex items-center justify-center">
              2
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-white/10 border border-white/20 text-white/40 font-mono font-black text-sm flex items-center justify-center">
              ?
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-white/10 border border-white/20 text-white/40 font-mono font-black text-sm flex items-center justify-center">
              ?
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-teal-300 tracking-widest uppercase">
            WORKING MEMORY
          </span>
        </div>
      );

    case 'corsi':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-violet-950/40 via-cyan-950/20 to-black border border-violet-500/20 flex items-center justify-center p-3">
          <div className="relative w-28 h-16 z-10">
            <div className="absolute top-1 left-2 w-5 h-5 rounded-[1px] bg-violet-600/40 border border-violet-400" />
            <div className="absolute top-2 right-4 w-6 h-6 rounded-[1px] bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-ping" />
            <div className="absolute top-2 right-4 w-6 h-6 rounded-[1px] bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
            <div className="absolute bottom-1 left-8 w-5 h-5 rounded-[1px] bg-violet-600/40 border border-violet-400" />
            <div className="absolute bottom-1 right-2 w-5 h-5 rounded-[1px] bg-violet-600/40 border border-violet-400" />
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-violet-300 tracking-widest uppercase">
            SPATIAL SPAN
          </span>
        </div>
      );

    case 'connect4':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-blue-950/40 via-cyan-950/20 to-black border border-blue-500/20 flex items-center justify-center p-3">
          {/* Connect 4 Slots */}
          <div className="grid grid-cols-5 gap-1.5 z-10">
            <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] border border-white" />
            <div className="w-5 h-5 rounded-full bg-blue-900 border border-blue-600/40" />
            <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] border border-white" />
            <div className="w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] border border-rose-300" />
            <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] border border-white" />
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-blue-300 tracking-widest uppercase">
            TACTICAL BOT DUEL
          </span>
        </div>
      );

    case 'slide15':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-zinc-900 via-cyan-950/20 to-black border border-cyan-500/20 flex items-center justify-center p-3">
          <div className="grid grid-cols-4 gap-1 z-10">
            {['1', '2', '3', '4', '5', '6', '7', ''].map((n, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-[1px] flex items-center justify-center font-mono text-[10px] font-bold ${
                  n
                    ? 'bg-zinc-800 border border-cyan-400/30 text-cyan-300'
                    : 'border border-dashed border-white/20'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400 tracking-widest uppercase">
            15-SLAB MATRIX
          </span>
        </div>
      );

    case 'arrow-escape':
      return (
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-gradient-to-br from-cyan-950/40 via-amber-950/20 to-black border border-cyan-500/20 flex items-center justify-center p-3">
          <div className="relative flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-[2px] bg-cyan-400 text-black flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">
              ↑
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              →
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-cyan-400 text-black flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              ↓
            </div>
            <div className="w-8 h-8 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              ←
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-300 tracking-widest uppercase">
            UNTANGLE MAZE
          </span>
        </div>
      );

    default:
      return null;
  }
};

export const GameCatalog: React.FC<{ onSelectGame: (game: GameInfo) => void }> = ({ onSelectGame }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredGames = activeCategory === 'all'
    ? GAMES_LIST
    : GAMES_LIST.filter(g => g.category === activeCategory);

  return (
    <section id="catalog" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto select-none">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-white/[0.08] gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase block mb-2">
            // SELECT A GAME & PLAY (100 LEVELS)
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            ARCADE GAMES ({GAMES_LIST.length})
          </h2>
        </div>

        {/* Category Tabs in Cyan */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {[
            { id: 'all', label: `ALL (${GAMES_LIST.length})` },
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
                  ? 'bg-cyan-400 text-black border-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-[#0d0d0d] text-zinc-300 border-white/[0.12] hover:text-white hover:border-cyan-500/30'
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
            className="group relative bg-[#0a0a0a]/90 border border-white/[0.08] hover:border-cyan-400/50 rounded-[2px] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-sm"
          >
            {/* Top Card Info */}
            <div className="space-y-3">
              {/* Game Number & Category Badge */}
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 uppercase">
                <span className="tracking-widest font-bold text-cyan-400">
                  GAME {parseInt(game.number, 10)}
                </span>
                <div className="flex items-center gap-2">
                  {game.badge && (
                    <span className="px-1.5 py-0.5 border rounded-[1px] font-bold bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)] flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      {game.badge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-white/[0.08] rounded-[1px] text-zinc-200 text-[10px]">
                    {game.category}
                  </span>
                </div>
              </div>

              {/* Game Theme Color Banner Box */}
              {renderGameBanner(game.id)}

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  {game.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Card Launch - Clean PLAY button */}
            <div className="pt-4 mt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectGame(game);
                }}
                className="w-full py-3 bg-[#121212] group-hover:bg-cyan-400 group-hover:text-black border border-white/[0.15] group-hover:border-cyan-400 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all rounded-[2px] flex items-center justify-center gap-2 active:scale-95 shadow-sm group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                PLAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
