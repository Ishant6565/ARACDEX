import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Layers, Trophy, CheckCircle } from 'lucide-react';

const GRID_SIZE = 20;

type Point = {
  x: number;
  y: number;
};

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
  const [level, setLevel] = useState<number>(() => getGameLevel('snake'));
  const [foodEatenInLevel, setFoodEatenInLevel] = useState<number>(0);
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const [levelClearedMessage, setLevelClearedMessage] = useState<boolean>(false);

  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('arcadex_best_snake') || '0');
  });

  const dirRef = useRef<Direction>(direction);
  dirRef.current = direction;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const targetFoodForLevel = 4 + Math.min(6, Math.floor(level / 15));

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collision = currentSnake.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!collision) break;
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    sound.playClick();
    const initialSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    setFood(generateFood(initialSnake));
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setFoodEatenInLevel(0);
  }, [generateFood]);

  const selectSpecificLevel = (targetLvl: number) => {
    sound.playClick();
    setLevel(targetLvl);
    setGameLevel('snake', targetLvl);
    setShowLevelPicker(false);
    resetGame();
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Main game tick loop
  useEffect(() => {
    if (isGameOver || isPaused || showLevelPicker) return;

    // Speed scales from level 1 (140ms) to level 100 (45ms)
    const tickSpeed = Math.max(45, 140 - (level - 1) * 0.98);

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = dirRef.current;

        switch (currentDir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playDefeat();
          setIsGameOver(true);
          return prevSnake;
        }

        // Self collision
        for (let i = 0; i < prevSnake.length; i++) {
          if (head.x === prevSnake[i].x && head.y === prevSnake[i].y) {
            sound.playDefeat();
            setIsGameOver(true);
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          sound.playEat();
          const newScore = score + 10 * level;
          setScore(newScore);

          if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem('arcadex_best_snake', String(newScore));
          }

          setFood(generateFood(newSnake));

          setFoodEatenInLevel(curr => {
            const nextCount = curr + 1;
            if (nextCount >= targetFoodForLevel) {
              // Level Up!
              sound.playSuccess();
              setLevel(prevLvl => {
                const nextLvl = Math.min(100, prevLvl + 1);
                setGameLevel('snake', nextLvl);
                recordGameWin('snake', newScore, 'SNAKE CYBER', prevLvl);
                onComplete?.(newScore);
                setLevelClearedMessage(true);
                setTimeout(() => setLevelClearedMessage(false), 2000);
                return nextLvl;
              });
              return 0;
            }
            return nextCount;
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [food, isGameOver, isPaused, showLevelPicker, score, bestScore, level, targetFoodForLevel, generateFood, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelPicker) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        setIsPaused(p => !p);
        return;
      }

      const currentDir = dirRef.current;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && currentDir !== 'DOWN') {
        sound.playMove();
        setDirection('UP');
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && currentDir !== 'UP') {
        sound.playMove();
        setDirection('DOWN');
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && currentDir !== 'RIGHT') {
        sound.playMove();
        setDirection('LEFT');
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && currentDir !== 'LEFT') {
        sound.playMove();
        setDirection('RIGHT');
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
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">PROTOCOL 01</span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            SNAKE CYBER <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-[2px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">100 LVLS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowLevelPicker(true)}
            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] text-right cursor-pointer transition-all"
            title="Pick level from 100 levels"
          >
            <span className="text-[9px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> LEVEL
            </span>
            <span className="text-sm font-bold text-cyan-400">{level}/100</span>
          </button>
          <div className="px-3 py-1 bg-[#0a0a0a] border border-white/[0.08] rounded-[2px] text-right">
            <span className="text-[9px] text-white/40 uppercase block tracking-wider">SCORE</span>
            <span className="text-base font-bold text-cyan-400">{score}</span>
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
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px] text-white/70 hover:text-white"
            title="Restart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right text-[11px] text-white/50">
          LVL TARGET: <span className="text-cyan-400 font-bold">{foodEatenInLevel}/{targetFoodForLevel} ORBS</span>
        </div>
      </div>

      {/* Level Promoted Banner */}
      {levelClearedMessage && (
        <div className="w-full mb-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs flex items-center justify-between rounded-[2px] animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEVEL PROMOTED! NOW LVL {level}</span>
          </div>
          <span className="text-[10px] uppercase text-cyan-400 font-bold">VELOCITY +</span>
        </div>
      )}

      {/* Grid Canvas */}
      <div className="relative w-full aspect-square max-w-[360px] bg-[#070707] border border-cyan-500/30 rounded-[2px] overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {/* Subtle matrix dots */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-20">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/10" />
          ))}
        </div>

        {/* Snake body segments */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              style={{
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
              className="absolute p-0.5 transition-all duration-75"
            >
              <div
                className={`w-full h-full rounded-[1px] ${
                  isHead
                    ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]'
                    : 'bg-cyan-700/80 border border-cyan-500/40'
                }`}
              />
            </div>
          );
        })}

        {/* Glowing Food Orb */}
        <div
          style={{
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
          }}
          className="absolute p-0.5 z-10 animate-pulse"
        >
          <div className="w-full h-full bg-cyan-300 rounded-full shadow-[0_0_18px_rgba(34,211,238,1)]" />
        </div>

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30">
            <span className="text-xs font-mono tracking-[0.25em] text-red-400 uppercase mb-1">COLLISION DETECTED</span>
            <h3 className="text-2xl font-display font-bold text-white mb-1">SEQUENCE TERMINATED</h3>
            <p className="text-xs font-mono text-cyan-400 mb-1">LEVEL ATTAINED: {level} / 100</p>
            <p className="text-xs font-mono text-white/50 mb-6">FINAL SCORE: {score} UNITS</p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all rounded-[2px] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              RESTART PROTOCOL
            </button>
          </div>
        )}

        {/* Pause Banner */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase px-4 py-2 border border-cyan-400/40 bg-black/60 rounded-[2px]">
              SYSTEM PAUSED
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[360px] h-1.5 bg-[#151515] border border-white/[0.08] mt-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${(foodEatenInLevel / targetFoodForLevel) * 100}%` }}
        />
      </div>

      {/* Mobile Touch Controller */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-48 sm:hidden">
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

      {/* 100 Levels Picker Modal */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-[#0b0b0b] border border-cyan-500/40 rounded-[2px] p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">// ARCHIVAL SELECTION</span>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> SELECT SNAKE LEVEL
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
                100 tiered levels with accelerating sensory velocity. Eat required orbs to advance to the next level!
              </p>

              <div className="grid grid-cols-10 gap-1.5 overflow-y-auto pr-1 py-1 max-h-[50vh] font-mono text-xs flex-1 min-h-0">
                {Array.from({ length: 100 }, (_, i) => i + 1).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => selectSpecificLevel(lvl)}
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
                <span>CURRENT: LEVEL {level}</span>
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
