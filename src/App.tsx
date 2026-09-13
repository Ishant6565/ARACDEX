import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsStrip } from './components/StatsStrip';
import { EditorialManifesto } from './components/EditorialManifesto';
import { GameCatalog, GAMES_LIST } from './components/GameCatalog';
import { GameModal } from './components/GameModal';
import { Footer } from './components/Footer';
import { GameInfo, UserStats } from './types';
import { loadUserStats, recordGameWin } from './services/storage';
import { sound } from './services/audio';

export function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);

  const toggleSound = () => {
    const updated = sound.toggleSound();
    setSoundEnabled(updated);
  };

  const handleSelectGame = (game: GameInfo) => {
    setActiveGame(game);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  const handleGameComplete = (score: number) => {
    if (activeGame) {
      const updated = recordGameWin(activeGame.id, score);
      setStats(updated);
    }
  };

  const handleOpenRandom = useCallback(() => {
    sound.playClick();
    const randomGame = GAMES_LIST[Math.floor(Math.random() * GAMES_LIST.length)];
    setActiveGame(randomGame);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Fixed Navbar */}
      <Navbar
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenRandom={handleOpenRandom}
      />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero onStartClick={() => {
          const catalogEl = document.getElementById('catalog');
          catalogEl?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <StatsStrip stats={stats} />

        <EditorialManifesto />

        <GameCatalog onSelectGame={handleSelectGame} />
      </main>

      {/* Active Game Modal */}
      {activeGame && (
        <GameModal
          game={activeGame}
          onClose={handleCloseGame}
          onGameComplete={handleGameComplete}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
