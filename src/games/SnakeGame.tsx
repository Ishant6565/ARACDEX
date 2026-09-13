import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin } from '../services/storage';
import { RotateCcw, Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Trophy } from 'lucide-react';

const GRID_SIZE = 20;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_snake') || '0');
  });
  const [speed, setSpeed] = useState<number>(110); // ms per tick

  const dirRef = useRef<Direction>(direction);
  dirRef.current = direction;

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collides = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!collides) break;
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    sound.playClick();
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    dirRef.current = 'UP';
    setFood(generateFood(initialSnake));
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
  }, [generateFood]);

  // Main game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = dirRef.current;

        if (currentDir === 'UP') head.y -= 1;
        if (currentDir === 'DOWN') head.y += 1;
        if (currentDir === 'LEFT') head.x -= 1;
        if (currentDir === 'RIGHT') head.x += 1;

        // Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playError();
          setIsGameOver(true);
          return prevSnake;
        }

        // Self Collision
        if (prevSnake.slice(1).some(seg => seg.x === head.x && seg.y === head.y)) {
          sound.playError();
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check Food
        if (head.x === food.x && head.y === food.y) {
          sound.playEat();
          const newScore = score + 10;
          setScore(newScore);

          if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem('arcadex_best_snake', String(newScore));
          }

          recordGameWin('snake', newScore);
          onComplete?.(newScore);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, food, score, bestScore, speed, generateFood, onComplete]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && dirRef.current !== 'DOWN') {
        e.preventDefault();
        setDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && dirRef.current !== 'UP') {
        e.preventDefault();
        setDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && dirRef.current !== 'RIGHT') {
        e.preventDefault();
        setDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && dirRef.current !== 'LEFT') {
        e.preventDefault();
        setDirection('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeDirection = (newDir: Direction) => {
    sound.playClick();
    if (newDir === 'UP' && dirRef.current !== 'DOWN') setDirection('UP');
    if (newDir === 'DOWN' && dirRef.current !== 'UP') setDirection('DOWN');
    if (newDir === 'LEFT' && dirRef.current !== 'RIGHT') setDirection('LEFT');
    if (newDir === 'RIGHT' && dirRef.current !== 'LEFT') setDirection('RIGHT');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono block">PROTOCOL 01</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SNAKE CYBER <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-white/60">60 FPS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">SCORE</span>
            <span className="text-base font-bold text-amber-400">{score}</span>
          </div>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">RECORD</span>
            <span className="text-base font-bold text-white">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] text-white/70 hover:text-white"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] text-white/70 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" /> RESET
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {(['140', '110', '80'] as const).map((spd, idx) => (
            <button
              key={spd}
              onClick={() => setSpeed(Number(spd))}
              className={`px-2 py-0.5 rounded-[1px] border text-[10px] uppercase ${
                speed === Number(spd)
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-[#0d0d0d] text-white/50 border-white/[0.08]'
              }`}
            >
              {idx === 0 ? 'ZEN' : idx === 1 ? 'NORMAL' : 'TURBO'}
            </button>
          ))}
        </div>
      </div>

      {/* 20x20 Snake Canvas Grid */}
      <div className="relative w-full aspect-square bg-[#070707] border border-white/20 rounded-[2px] shadow-2xl overflow-hidden">
        {/* Subtle matrix grid lines */}
        <div className="absolute inset-0 bg-grid-editorial pointer-events-none" />

        {/* Snake Segments */}
        {snake.map((segment, idx) => {
          const isHead = idx === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${idx}`}
              style={{
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
              className={`absolute p-0.5 transition-transform duration-75 ${
                isHead ? 'z-10' : 'z-0'
              }`}
            >
              <div
                className={`w-full h-full rounded-[1px] ${
                  isHead
                    ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                    : 'bg-neutral-400 opacity-90'
                }`}
              />
            </div>
          );
        })}

        {/* Glowing Food */}
        <div
          style={{
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
          }}
          className="absolute p-0.5 z-10 animate-pulse"
        >
          <div className="w-full h-full bg-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]" />
        </div>

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30">
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-1">COLLISION DETECTED</span>
            <h3 className="text-2xl font-display font-bold text-white mb-2">SEQUENCE TERMINATED</h3>
            <p className="text-xs font-mono text-white/50 mb-6">FINAL SCORE: {score} UNITS</p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-[2px]"
            >
              RESTART PROTOCOL
            </button>
          </div>
        )}

        {/* Pause Banner */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="font-mono text-xs tracking-widest text-white/70 uppercase px-4 py-2 border border-white/20 bg-black/60 rounded-[2px]">
              SYSTEM PAUSED
            </span>
          </div>
        )}
      </div>

      {/* Mobile Touch Controller */}
      <div className="grid grid-cols-3 gap-2 mt-5 w-48 sm:hidden">
        <div></div>
        <button
          onClick={() => changeDirection('UP')}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <div></div>
        <button
          onClick={() => changeDirection('LEFT')}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => changeDirection('DOWN')}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => changeDirection('RIGHT')}
          className="p-3 bg-[#0d0d0d] active:bg-[#252525] border border-white/[0.1] rounded-[2px] flex items-center justify-center text-white"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
