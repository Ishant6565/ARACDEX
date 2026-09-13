import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { recordGameWin, getGameLevel, setGameLevel } from '../services/storage';
import { RotateCcw, Award, AlertCircle, HelpCircle, Lightbulb, Check, ChevronLeft, ChevronRight, Layers, FileText } from 'lucide-react';

export interface WordlePuzzle {
  level: number;
  word: string;
  clue: string;
  sentence: string;
}

// 100 Curated 5-letter Puzzle Levels with Clue and Context Sentence
export const WORDLE_100_LEVELS: WordlePuzzle[] = [
  { level: 1, word: 'CYBER', clue: 'DIGITAL & FUTURISTIC', sentence: 'The elite hacker breached the mainframe on the _____ security grid.' },
  { level: 2, word: 'LOGIC', clue: 'RATIONAL DEDUCTION', sentence: 'Every calculation in ARCADEX relies on pure mathematical _____.' },
  { level: 3, word: 'BRAIN', clue: 'NEURAL COGNITION', sentence: 'Daily puzzle solving stimulates synaptic growth in the _____.' },
  { level: 4, word: 'FOCUS', clue: 'DEEP CONCENTRATION', sentence: 'To survive high-speed reflex trials, you must maintain absolute _____.' },
  { level: 5, word: 'GRIDS', clue: 'MATRIX STRUCTURE', sentence: 'The glowing green code rippled across the virtual _____.' },
  { level: 6, word: 'CHESS', clue: 'GAME OF KINGS', sentence: 'Grandmasters anticipate ten moves ahead on the 64-square _____ board.' },
  { level: 7, word: 'SWIFT', clue: 'HIGH VELOCITY', sentence: 'With _____ reflexes, the ninja dodged the shuriken in mid-air.' },
  { level: 8, word: 'PRIME', clue: 'OPTIMAL & FIRST', sentence: 'Seven and eleven are classic examples of a mathematical _____ number.' },
  { level: 9, word: 'SHARP', clue: 'RAZOR KEEN', sentence: 'A detective requires an observant eye and a razor-_____ mind.' },
  { level: 10, word: 'LIGHT', clue: 'LUMINOUS ENERGY', sentence: 'Photons travel across interstellar space at the speed of _____.' },
  { level: 11, word: 'POWER', clue: 'STRENGTH & ENERGY', sentence: 'The supercharged generator provided immense electric _____.' },
  { level: 12, word: 'QUEST', clue: 'NOBLE ADVENTURE', sentence: 'The lone hero embarked on a dangerous _____ to restore balance.' },
  { level: 13, word: 'PULSE', clue: 'RHYTHMIC BEAT', sentence: 'He felt his heart _____ accelerate as the final countdown hit zero.' },
  { level: 14, word: 'GHOST', clue: 'SPECTRAL PHANTOM', sentence: 'Rumors say a spectral _____ haunts the abandoned arcade terminal.' },
  { level: 15, word: 'STORM', clue: 'ATMOSPHERIC TEMPEST', sentence: 'Thunder clapped loudly as a dark electrical _____ covered the city.' },
  { level: 16, word: 'FLASH', clue: 'BURST OF SPEED', sentence: 'The camera captured the cosmic explosion in a blinding _____.' },
  { level: 17, word: 'RADAR', clue: 'SCANNING DETECTION', sentence: 'The submarine crew spotted an unidentified object on the sonar _____.' },
  { level: 18, word: 'SPACE', clue: 'COSMIC EXPANSE', sentence: 'Voyager drifted silently into the infinite emptiness of deep _____.' },
  { level: 19, word: 'NINJA', clue: 'SHADOW WARRIOR', sentence: 'Stealth and deception are the greatest weapons of a shinobi _____.' },
  { level: 20, word: 'SWORD', clue: 'BLADED WEAPON', sentence: 'The legendary swordsman drew his sharp steel _____ with one motion.' },
  { level: 21, word: 'FLAME', clue: 'FIERY BLAZE', sentence: 'Rengoku set his heart on fire and summoned the roaring _____.' },
  { level: 22, word: 'OCEAN', clue: 'VAST DEEP BLUE', sentence: 'Luffy set sail across the treacherous Grand Line _____.' },
  { level: 23, word: 'TITAN', clue: 'COLOSSAL GIANT', sentence: 'A fifty-meter armored _____ punched through the protective wall.' },
  { level: 24, word: 'SMART', clue: 'INTELLIGENT & CLEVER', sentence: 'The algorithm was engineered to be _____ enough to solve complex codes.' },
  { level: 25, word: 'LASER', clue: 'COHERENT BEAM', sentence: 'The sci-fi spacecraft was armed with a precision ultraviolet _____.' },
  { level: 26, word: 'PIXEL', clue: 'DISPLAY UNIT', sentence: 'The retro monitor rendered each vibrant color on a tiny screen _____.' },
  { level: 27, word: 'CROWN', clue: 'ROYAL CORONET', sentence: 'The grand champion stood on the podium wearing a gilded _____.' },
  { level: 28, word: 'MAGIC', clue: 'ARCANE MYSTERY', sentence: 'The sorcerer cast an ancient spell filled with sparkling blue _____.' },
  { level: 29, word: 'SOLAR', clue: 'SUN POWERED', sentence: 'Clean energy was harvested directly from the burning _____ rays.' },
  { level: 30, word: 'LUNAR', clue: 'MOON CYCLES', sentence: 'The werewolf transformation triggered under the full _____ glow.' },
  { level: 31, word: 'CHAOS', clue: 'TURBULENT DISORDER', sentence: 'Without strict rules and protocols, the server descended into pure _____.' },
  { level: 32, word: 'ORDER', clue: 'HARMONIC STRUCTURE', sentence: 'A well-sorted database maintains flawless mathematical _____.' },
  { level: 33, word: 'VAPOR', clue: 'GASEOUS MIST', sentence: 'Steam condensed into a delicate purple _____ inside the test tube.' },
  { level: 34, word: 'ORBIT', clue: 'CELESTIAL REVOLUTION', sentence: 'The communications satellite completed one full _____ around Earth.' },
  { level: 35, word: 'STEEL', clue: 'HARDENED METAL', sentence: 'The skyscraper framework was built using heavy-duty alloy _____.' },
  { level: 36, word: 'CLOUD', clue: 'VIRTUAL STORAGE', sentence: 'All your puzzle saves and high scores are backed up in the _____.' },
  { level: 37, word: 'RADIO', clue: 'WIRELESS FREQUENCY', sentence: 'The spy tuned the receiver to catch secret high-frequency _____ signals.' },
  { level: 38, word: 'SOUND', clue: 'ACOUSTIC VIBRATION', sentence: 'Synthesizer waves create music by oscillating pure waves of _____.' },
  { level: 39, word: 'AUDIO', clue: 'HIGH FIDELITY', sentence: 'The studio engineer adjusted the master mixer for pristine _____ quality.' },
  { level: 40, word: 'GUARD', clue: 'DEFENSIVE SENTRY', sentence: 'A vigilant security _____ monitored the bank vault security cameras.' },
  { level: 41, word: 'ARMOR', clue: 'PROTECTIVE GEAR', sentence: 'The armored knight stood unyielding behind reinforced plate _____.' },
  { level: 42, word: 'BLAZE', clue: 'INTENSE FIRE', sentence: 'The wildfire began as a spark before turning into a roaring _____.' },
  { level: 43, word: 'SPEED', clue: 'RAPID VELOCITY', sentence: 'The supersonic jet accelerated past Mach 3 at breakneck _____.' },
  { level: 44, word: 'CLOCK', clue: 'TIMEKEEPER', sentence: 'Every second counts as the digital puzzle _____ ticks down.' },
  { level: 45, word: 'TRACK', clue: 'RACE PATHWAY', sentence: 'The futuristic racecar zoomed along the winding neon asphalt _____.' },
  { level: 46, word: 'FORCE', clue: 'ENERGY DYNAMICS', sentence: 'May the galactic _____ be with you throughout your journey.' },
  { level: 47, word: 'DRIVE', clue: 'INTERNAL MOTIVATION', sentence: 'Champions are fueled by an unstoppable ambition and inner _____.' },
  { level: 48, word: 'SCALE', clue: 'PROPORTION & SIZE', sentence: 'The massive monolithic statue was built on an awe-inspiring _____.' },
  { level: 49, word: 'VALUE', clue: 'WORTH & MAGNITUDE', sentence: 'In 2048, merging identical tiles compounds their total score _____.' },
  { level: 50, word: 'LEVEL', clue: 'STAGE PROGRESSION', sentence: 'Congratulations on completing this milestone, advancing to the next _____!' },
  { level: 51, word: 'CRYPT', clue: 'ANCIENT VAULT', sentence: 'The mysterious pharaoh treasure was sealed deep inside a stone _____.' },
  { level: 52, word: 'RELAY', clue: 'COMMUNICATION BEACON', sentence: 'The orbital satellite acted as a high-frequency communications _____.' },
  { level: 53, word: 'ARROW', clue: 'POINTED PROJECTILE', sentence: 'The master archer released the swift feathered _____ toward the bullseye.' },
  { level: 54, word: 'CREST', clue: 'HIGHEST RIDGE', sentence: 'The majestic eagle built its nest atop the snowy mountain _____.' },
  { level: 55, word: 'POINT', clue: 'EXACT COORDINATE', sentence: 'Each vertex on a 3D geometry model represents a single spatial _____.' },
  { level: 56, word: 'NERVE', clue: 'SYNAPTIC FIBER', sentence: 'High reflex speed depends on signals traveling through each motor _____.' },
  { level: 57, word: 'TRACE', clue: 'DIGITAL RESIDUE', sentence: 'The cyber investigator followed a subtle encrypted memory _____.' },
  { level: 58, word: 'QUANT', clue: 'NUMERICAL ANALYST', sentence: 'Wall Street algorithms are developed by expert mathematical _____ analysts.' },
  { level: 59, word: 'BYTES', clue: 'DATA UNITS', sentence: 'Megabytes and giga_____ measure the total storage size of an app.' },
  { level: 60, word: 'STACK', clue: 'MEMORY ORDER', sentence: 'The computer processor placed recent variables onto the call _____.' },
  { level: 61, word: 'SCOPE', clue: 'OPTICAL VIEWFINDER', sentence: 'The astronomer gazed into the distant Andromeda galaxy through the tele_____.' },
  { level: 62, word: 'SYNTH', clue: 'ELECTRONIC SOUND', sentence: 'Blade Runner soundtracks are iconic for warm analog _____ basslines.' },
  { level: 63, word: 'ARRAY', clue: 'INDEXED LIST', sentence: 'The software organized player high scores inside a sorted numeric _____.' },
  { level: 64, word: 'NEXUS', clue: 'CENTRAL HUB', sentence: 'The interdimensional portal was situated at the temporal _____.' },
  { level: 65, word: 'PRISM', clue: 'LIGHT REFRACTOR', sentence: 'White light split into a brilliant rainbow as it passed through the glass _____.' },
  { level: 66, word: 'OPTIC', clue: 'VISUAL SYSTEM', sentence: 'High-speed internet is delivered globally through underground fiber _____ cables.' },
  { level: 67, word: 'SWIRL', clue: 'CIRCULAR MOTION', sentence: 'Water rushed down the drain forming an elegant clockwise _____.' },
  { level: 68, word: 'STARS', clue: 'CELESTIAL BEACONS', sentence: 'On a clear night, the galaxy shines with billions of radiant _____.' },
  { level: 69, word: 'SHINE', clue: 'LUMINOUS GLOW', sentence: 'Polished silver armor reflects sunlight with an intense metallic _____.' },
  { level: 70, word: 'SHADE', clue: 'COOL SHELTER', sentence: 'The travelers rested beneath the tall palm tree to enjoy the cool _____.' },
  { level: 71, word: 'FAIRY', clue: 'MYTHICAL SPRITE', sentence: 'A magical woodland _____ hovered softly above the glowing flowers.' },
  { level: 72, word: 'DEVIL', clue: 'CHAOTIC FIEND', sentence: 'Chainsaw Man formed a dangerous pact with the formidable blood _____.' },
  { level: 73, word: 'TEMPO', clue: 'RHYTHM CADENCE', sentence: 'The metronome kept the orchestra synchronized at a brisk musical _____.' },
  { level: 74, word: 'HYPER', clue: 'OVER-ENERGIZED', sentence: 'The starship engaged its faster-than-light _____ drive.' },
  { level: 75, word: 'SONIC', clue: 'SOUND WAVES', sentence: 'The blue hedgehog raced through Green Hill Zone at supersonic _____ speeds.' },
  { level: 76, word: 'SPARK', clue: 'INITIAL IGNITION', sentence: 'A single electric _____ lit the furnace and powered the facility.' },
  { level: 77, word: 'MERGE', clue: 'UNIFY TOGETHER', sentence: 'In 2048, two matching tiles slide together to cleanly _____.' },
  { level: 78, word: 'GLYPH', clue: 'CARVED SYMBOL', sentence: 'Archaeologists deciphered the ancient Egyptian hieroglyphic _____.' },
  { level: 79, word: 'RUNES', clue: 'MYSTIC INSCRIPTIONS', sentence: 'The Viking battle axe was engraved with enchanted glowing _____.' },
  { level: 80, word: 'SPELL', clue: 'INCANTATION', sentence: 'Gojo activated his domain expansion using an unstoppable cursed _____.' },
  { level: 81, word: 'CHAIN', clue: 'BOUND METALLIC', sentence: 'Kurapika conjured an unbreakable metallic nen _____.' },
  { level: 82, word: 'SURGE', clue: 'POWER RUSH', sentence: 'Shinobi mold elemental energy into a powerful electric chakra _____.' },
  { level: 83, word: 'MYTHS', clue: 'ANCIENT LORE', sentence: 'The grand achievements of ancient kings were passed down in timeless _____.' },
  { level: 84, word: 'DEMON', clue: 'SUPERNATURAL FOE', sentence: 'Tanjiro drew his Nichirin blade to face the formidable upper rank _____.' },
  { level: 85, word: 'SAINT', clue: 'HOLY EMBLEM', sentence: 'Throughout heaven and earth, Gojo attained the revered aura of an enlightened _____.' },
  { level: 86, word: 'REALM', clue: 'KINGDOM DOMAIN', sentence: 'The mythical wizard rules over a hidden enchanted mountain _____.' },
  { level: 87, word: 'BRAVE', clue: 'COURAGEOUS SPIRIT', sentence: 'All Might reminded the citizens that true heroes are always _____.' },
  { level: 88, word: 'VALOR', clue: 'COURAGEOUS BRAVERY', sentence: 'The knight was awarded a medal of honor for supreme battlefield _____.' },
  { level: 89, word: 'HONOR', clue: 'MORAL REPUTATION', sentence: 'Zoro proclaimed that scars on the back are a swordsman\'s greatest dis_____.' },
  { level: 90, word: 'NOBLE', clue: 'HIGH PRINCIPLE', sentence: 'Itachi made the ultimate sacrifice guided by a quiet and _____ code.' },
  { level: 91, word: 'ELITE', clue: 'SUPREME TIER', sentence: 'Only the top 1% of cognitive puzzle masters enter the grand _____ tier.' },
  { level: 92, word: 'REIGN', clue: 'SOVEREIGN RULE', sentence: 'The undisputed monarch began a golden era of peaceful _____.' },
  { level: 93, word: 'BOUND', clue: 'SPATIAL LIMIT', sentence: 'Gojo\'s Limitless technique creates an impenetrable spatial _____.' },
  { level: 94, word: 'ROOTS', clue: 'FOUNDATIONAL ANCESTRY', sentence: 'The superhero traced his legendary family origin back to ancient _____.' },
  { level: 95, word: 'BEGIN', clue: 'FIRST STEP', sentence: 'Every grand journey in the ARCADEX suite must take a bold step to _____.' },
  { level: 96, word: 'RELIC', clue: 'SACRED ARTIFACT', sentence: 'The legendary golden talisman was preserved as a venerated historical _____.' },
  { level: 97, word: 'PEAKS', clue: 'MOUNTAINTOP CRESTS', sentence: 'Standing atop Everest, the explorer stood above the clouds on the highest _____.' },
  { level: 98, word: 'ALPHA', clue: 'FIRST & FOREMOST', sentence: 'In astronomy, the brightest star of any celestial constellation is called the _____.' },
  { level: 99, word: 'TIGER', clue: 'APEX PREDATOR', sentence: 'The ferocious striped feline stalked silently through the jungle like a hungry _____.' },
  { level: 100, word: 'OMEGA', clue: 'THE FINAL STAGE', sentence: 'You have conquered all 100 levels. Welcome to the ultimate _____ level!' },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export const WordleGame: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState<number>(() => getGameLevel('wordle'));
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true); // Show clue & context sentence by default!

  // Clamp level 1..100
  const safeLevel = Math.max(1, Math.min(100, level));
  const currentPuzzle = WORDLE_100_LEVELS[safeLevel - 1] || WORDLE_100_LEVELS[0];

  const targetWord = (currentPuzzle.word || 'CYBER').slice(0, 5).toUpperCase();

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const initGame = useCallback(() => {
    sound.playClick();
    setGuesses([]);
    setCurrentGuess('');
    setIsWon(false);
    setIsGameOver(false);
    setToastMessage('');
  }, []);

  useEffect(() => {
    initGame();
  }, [level, initGame]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      sound.playError();
      showToast('5 LETTERS REQUIRED');
      return;
    }

    sound.playPop();
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      sound.playSuccess();
      setIsWon(true);
      const score = Math.max(80, (7 - newGuesses.length) * 160 + level * 20);
      recordGameWin('wordle', score, `WORDLE CIPHER LVL ${level}: ${targetWord}`, level);
      onComplete?.(score);
    } else if (newGuesses.length >= 6) {
      sound.playDefeat();
      setIsGameOver(true);
    }
  }, [currentGuess, guesses, targetWord, level, onComplete]);

  const handleKey = useCallback(
    (key: string) => {
      if (isWon || isGameOver) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'DEL' || key === 'BACKSPACE') {
        sound.playClick();
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        sound.playClick();
        setCurrentGuess(prev => prev + key);
      }
    },
    [currentGuess, isWon, isGameOver, submitGuess]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        handleKey('DEL');
      } else {
        const char = e.key.toUpperCase();
        if (/^[A-Z]$/.test(char)) {
          handleKey(char);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKey]);

  const getLetterState = (letter: string, index: number, guess: string) => {
    if (guess[index] === targetWord[index]) return 'bg-cyan-500 text-black border-cyan-400 font-bold';
    if (targetWord.includes(letter)) return 'bg-cyan-900/60 text-cyan-300 border-cyan-500/50 font-bold';
    return 'bg-[#121212] text-white/40 border-white/[0.08]';
  };

  const getKeyStatus = (key: string) => {
    let status = 'bg-[#181818] text-white/80 border-white/[0.1]';
    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) {
            status = 'bg-cyan-500 text-black border-cyan-400 font-bold';
            return;
          } else if (targetWord.includes(key) && !status.includes('bg-cyan-500')) {
            status = 'bg-cyan-900 text-cyan-300 border-cyan-600';
          } else if (!targetWord.includes(key)) {
            status = 'bg-[#080808] text-white/20 border-white/[0.04]';
          }
        }
      }
    });
    return status;
  };

  const handleNextLevel = () => {
    if (level < 100) {
      sound.playClick();
      const next = level + 1;
      setLevel(next);
      setGameLevel('wordle', next);
    }
  };

  const handlePrevLevel = () => {
    if (level > 1) {
      sound.playClick();
      const prev = level - 1;
      setLevel(prev);
      setGameLevel('wordle', prev);
    }
  };

  const selectSpecificLevel = (lvl: number) => {
    sound.playClick();
    setLevel(lvl);
    setGameLevel('wordle', lvl);
    setShowLevelPicker(false);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-mono block">
            PROTOCOL 06 // 100 CIPHERS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            WORDLE CIPHER
            <button
              onClick={() => setShowLevelPicker(p => !p)}
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-[2px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
            >
              <Layers className="w-3 h-3" /> LVL {level}/100
            </button>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={handlePrevLevel}
            disabled={level <= 1}
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-white/[0.08] text-white rounded-[2px]"
            title="Previous Level"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextLevel}
            disabled={level >= 100}
            className="p-1.5 bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-white/[0.08] text-white rounded-[2px]"
            title="Next Level"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowHint(h => !h)}
            className={`p-1.5 border rounded-[2px] transition-all flex items-center gap-1 text-xs font-mono ${
              showHint ? 'bg-cyan-400 text-black border-cyan-400 font-bold' : 'bg-[#0d0d0d] text-white/60 border-white/[0.08]'
            }`}
            title="Toggle Sentence Clue"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HINT</span>
          </button>
          <button
            onClick={initGame}
            className="p-1.5 text-white/60 hover:text-white bg-[#0d0d0d] hover:bg-[#181818] border border-white/[0.08] rounded-[2px]"
            title="Reset Level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 100 Levels Quick-Picker Grid */}
      {showLevelPicker && (
        <div className="w-full p-3 bg-[#0d0d0d] border border-cyan-500/40 rounded-[2px] mb-3 animate-fade-in shadow-2xl max-h-48 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.08]">
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
              SELECT CIPHER LEVEL (1 TO 100)
            </span>
            <span className="font-mono text-[9px] text-white/40">
              100 UNIQUE WORDS & SENTENCES
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 font-mono text-[9px]">
            {Array.from({ length: 100 }).map((_, i) => {
              const lvlNum = i + 1;
              const isCurrent = lvlNum === level;
              return (
                <button
                  key={lvlNum}
                  onClick={() => selectSpecificLevel(lvlNum)}
                  className={`py-1 rounded-[1px] border transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 text-black font-bold border-cyan-400'
                      : 'bg-[#141414] text-white/70 hover:bg-cyan-950 border-white/[0.06]'
                  }`}
                >
                  {lvlNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clue & Sentence Context Box (Requested by User) */}
      {showHint && (
        <div className="w-full p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-[2px] mb-3 text-left animate-fade-in shadow-md">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[9px] text-cyan-400 uppercase font-bold flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              CONTEXT HINT & SENTENCE // LEVEL {level}
            </span>
            <span className="font-mono text-[9px] text-cyan-300/60 uppercase">
              {currentPuzzle.clue}
            </span>
          </div>
          <p className="font-sans text-xs text-white/90 leading-relaxed italic">
            "{currentPuzzle.sentence}"
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-2 px-3 py-1 bg-red-950/80 border border-red-500 text-red-300 font-mono text-xs rounded-[2px] animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Wordle 6x5 Grid */}
      <div className="grid grid-rows-6 gap-1.5 mb-4">
        {Array.from({ length: 6 }).map((_, r) => {
          const guess = guesses[r] || (r === guesses.length ? currentGuess : '');
          return (
            <div key={r} className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, c) => {
                const char = guess[c] || '';
                const isSubmitted = r < guesses.length;
                let cellStyle = 'bg-[#0a0a0a] border-white/[0.12] text-white';

                if (isSubmitted) {
                  cellStyle = getLetterState(char, c, guess);
                } else if (char) {
                  cellStyle = 'bg-[#141414] border-cyan-400/60 text-white scale-105';
                }

                return (
                  <div
                    key={c}
                    className={`w-11 h-12 sm:w-12 sm:h-13 border rounded-[2px] flex items-center justify-center font-display font-black text-xl tracking-wider transition-all duration-150 ${cellStyle}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Victory / Game Over Banner */}
      {isWon && (
        <div className="w-full mb-3 p-3 bg-cyan-950/80 border border-cyan-400 rounded-[2px] flex items-center justify-between font-mono text-xs text-cyan-200 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>CIPHER DECRYPTED: {targetWord}!</span>
          </div>
          {level < 100 ? (
            <button
              onClick={handleNextLevel}
              className="px-3 py-1 bg-cyan-400 text-black font-bold uppercase rounded-[2px] hover:bg-cyan-300 transition-all shadow-md active:scale-95"
            >
              NEXT LEVEL {level + 1} →
            </button>
          ) : (
            <span className="text-pink-300 font-bold">ALL 100 CIPHERS SOLVED!</span>
          )}
        </div>
      )}

      {isGameOver && (
        <div className="w-full mb-3 p-3 bg-red-950/80 border border-red-500 rounded-[2px] flex items-center justify-between font-mono text-xs text-red-200 animate-fade-in shadow-xl">
          <span>SEQUENCE TERMINATED: WORD WAS {targetWord}</span>
          <button
            onClick={initGame}
            className="px-3 py-1 bg-white text-black font-bold uppercase rounded-[2px]"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Virtual On-Screen Keyboard */}
      <div className="w-full max-w-sm space-y-1">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="flex justify-center gap-1">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className={`py-2 px-2 text-xs font-mono rounded-[2px] border transition-all active:scale-90 ${
                  key === 'ENTER' || key === 'DEL' ? 'px-3 text-[10px] font-bold bg-[#141414]' : ''
                } ${getKeyStatus(key)}`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
