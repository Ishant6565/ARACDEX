import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsStrip } from './components/StatsStrip';
import { GameCatalog, GAMES_LIST } from './components/GameCatalog';
import { GameModal } from './components/GameModal';
import { Footer } from './components/Footer';
import { StatsModal } from './components/StatsModal';
import { AuthModal } from './components/AuthModal';
import { StreakCelebrationModal } from './components/StreakCelebrationModal';
import { LoadingSplash } from './components/LoadingSplash';
import { GatekeeperLogin } from './components/GatekeeperLogin';
import { GameInfo, UserStats, UserProfile } from './types';
import { loadUserStats, recordGameWin } from './services/storage';
import { getCurrentUser, hasActiveRealUser, loginWithRealGmail, loginWithOAuthProvider } from './services/auth';
import { sound } from './services/audio';
import { supabase, syncLocalWithCloud } from './services/supabase';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser);
  const [stats, setStats] = useState<UserStats>(() => loadUserStats());
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [isLoadingSplash, setIsLoadingSplash] = useState<boolean>(true);
  const [hasRealAccount, setHasRealAccount] = useState<boolean>(() => hasActiveRealUser());

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [statsInitialTab, setStatsInitialTab] = useState<'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard'>('tiers');

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
      const updated = recordGameWin(activeGame.id, score, activeGame.title);
      setStats(updated);
      setCurrentUser(getCurrentUser());
    }
  };

  const handleOpenRandom = useCallback(() => {
    sound.playClick();
    const randomGame = GAMES_LIST[Math.floor(Math.random() * GAMES_LIST.length)];
    setActiveGame(randomGame);
  }, []);

  const handleOpenStats = (tab: 'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard' = 'tiers') => {
    setStatsInitialTab(tab);
    setIsStatsModalOpen(true);
  };

  // Auto-play BGM on initial install / first interaction
  useEffect(() => {
    sound.autoStartBgmIfEnabled();
  }, []);

  // Listen for Supabase OAuth redirects (Google, GitHub)
  useEffect(() => {
    // Check initial session if returning from Google / GitHub OAuth redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const provider = (u.app_metadata?.provider || 'google') as 'google' | 'github';
        const email = u.email || `${u.user_metadata?.user_name || u.user_metadata?.preferred_username || 'operator'}@${provider}.com`;
        const name = u.user_metadata?.full_name || u.user_metadata?.user_name || u.user_metadata?.name || email.split('@')[0];
        const avatar = u.user_metadata?.avatar_url || (provider === 'github' ? '/anime/jinwoo.svg' : '/anime/kakashi.svg');
        const user = loginWithOAuthProvider(u.id, email, name, avatar, provider);
        setCurrentUser(user);
        setStats(user.stats);
        setHasRealAccount(true);
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const provider = (u.app_metadata?.provider || 'google') as 'google' | 'github';
        const email = u.email || `${u.user_metadata?.user_name || u.user_metadata?.preferred_username || 'operator'}@${provider}.com`;
        const name = u.user_metadata?.full_name || u.user_metadata?.user_name || u.user_metadata?.name || email.split('@')[0];
        const avatar = u.user_metadata?.avatar_url || (provider === 'github' ? '/anime/jinwoo.svg' : '/anime/kakashi.svg');
        const user = loginWithOAuthProvider(u.id, email, name, avatar, provider);
        setCurrentUser(user);
        setStats(user.stats);
        setHasRealAccount(true);
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-sync progress with Supabase cloud when logged in
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest_primary') {
      syncLocalWithCloud(currentUser).then(syncedUser => {
        if (syncedUser) {
          setCurrentUser(syncedUser);
          setStats(syncedUser.stats);
        }
      });
    }
  }, [currentUser.id]);

  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    setStats(user.stats);
    setHasRealAccount(true);
    if (user && user.id !== 'guest_primary') {
      syncLocalWithCloud(user).then(syncedUser => {
        if (syncedUser) {
          setCurrentUser(syncedUser);
          setStats(syncedUser.stats);
        }
      });
    }
  };

  return (
    <>
      {isLoadingSplash && (
        <LoadingSplash onFinish={() => setIsLoadingSplash(false)} />
      )}

      {!hasRealAccount ? (
        <GatekeeperLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setStats(user.stats);
            setHasRealAccount(true);
          }}
        />
      ) : (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-white selection:text-black relative">
          {/* Ambient Global Background Image Layer */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-35 transition-opacity duration-700"
            style={{ backgroundImage: 'url("/hero_monolith.webp")' }}
          >
            {/* Dark Luxury Vignettes for readability & high contrast */}
            <div className="absolute inset-0 bg-[#050505]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
            <div className="absolute inset-0 bg-radial-vignette" />
          </div>

          {/* Top Fixed Navbar */}
          <Navbar
            stats={stats}
            currentUser={currentUser}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onOpenRandom={handleOpenRandom}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenStats={handleOpenStats}
          />

          {/* Main Content Sections */}
          <main className="flex-1 relative z-10">
            <Hero onStartClick={() => {
              const catalogEl = document.getElementById('catalog');
              catalogEl?.scrollIntoView({ behavior: 'smooth' });
            }} />

            {/* Primary Game Catalog */}
            <GameCatalog onSelectGame={handleSelectGame} />

            {/* Live Cognitive Telemetry & Stats (Positioned at bottom) */}
            <StatsStrip
              stats={stats}
              onOpenStats={handleOpenStats}
            />
          </main>

          {/* Active Game Modal */}
          {activeGame && (
            <GameModal
              game={activeGame}
              onClose={handleCloseGame}
              onGameComplete={handleGameComplete}
            />
          )}

          {/* Detailed Stats & Tiers Ladder Modal */}
          <StatsModal
            stats={stats}
            currentUser={currentUser}
            isOpen={isStatsModalOpen}
            initialTab={statsInitialTab}
            onClose={() => setIsStatsModalOpen(false)}
          />

          {/* Google Auth & Custom ID Account Modal */}
          <AuthModal
            currentUser={currentUser}
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onUserChange={handleUserChange}
          />

          {/* Streak Milestone Celebration Modal */}
          <StreakCelebrationModal />

          {/* Footer */}
          <div className="relative z-10">
            <Footer />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
