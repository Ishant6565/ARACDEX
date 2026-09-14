import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { UserProfile, UserStats } from '../types';

export const SUPABASE_URL = 'https://tyknltahtunelubmjiub.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_DfmIsTTTNmL1LkoBpOn1dA_SfK9jX_J';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function isNativeAPK(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/**
 * Google Sign In through Supabase
 * In native Android APK, standard WebView OAuth is blocked by Google policy (Error 403: disallowed_useragent).
 * We report isNativeAPK so the UI can activate instant Direct Google Account access.
 */
export async function signInWithRealGoogle(): Promise<{ error: any; isNative?: boolean }> {
  try {
    if (isNativeAPK()) {
      return { error: null, isNative: true };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * GitHub Sign In through Supabase
 */
export async function signInWithGitHub(): Promise<{ error: any; isNative?: boolean }> {
  try {
    if (isNativeAPK()) {
      return { error: null, isNative: true };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Check if user is currently authenticated via genuine Google OAuth
 */
export async function getActiveGoogleUser(): Promise<{ email: string; name: string; avatar: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const u = session.user;
      const email = u.email || '';
      const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
      const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || '/anime/kakashi.svg';
      return { email, name, avatar };
    }
  } catch (err) {
    console.warn('[Supabase] getSession error:', err);
  }
  return null;
}

/**
 * Sync user profile to Supabase 'profiles' table
 */
export async function syncProfileToCloud(user: UserProfile): Promise<void> {
  if (!user || !user.id) return;
  try {
    // 1. Store in public.profiles table (viewable in Table Editor)
    await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        username: user.username,
        email: user.email || null,
        avatar: user.avatar || '/anime/kakashi.svg',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // 2. Also register in Supabase Authentication -> Users so they show up in the Auth Users dashboard
    if (user.email && user.email.includes('@')) {
      const deterministicPassword = `Arcadex@${user.email.replace(/[^a-zA-Z0-9]/g, '')}!2026`;
      supabase.auth.signUp({
        email: user.email,
        password: deterministicPassword,
        options: {
          data: {
            full_name: user.username,
            user_name: user.username,
            avatar_url: user.avatar,
          },
        },
      }).catch(err => {
        // Silently ignore if already registered in auth or rate limited
        console.debug('[Supabase Auth] Background register note:', err?.message);
      });
    }
  } catch (err) {
    console.warn('[Supabase] Profile sync skipped (offline or table pending):', err);
  }
}

/**
 * Sync overall stats and streaks to Supabase 'user_stats' table
 */
export async function syncStatsToCloud(userId: string, stats: UserStats): Promise<void> {
  if (!userId || !stats) return;
  try {
    await supabase.from('user_stats').upsert(
      {
        user_id: userId,
        streak: stats.streak || 0,
        total_solved: stats.totalSolved || 0,
        total_time_minutes: stats.totalTimeMinutes || 0,
        accuracy_rate: stats.accuracyRate || 100,
        arcade_rank: stats.arcadeRank || 'BEGINNER // NOVICE',
        last_played_date: stats.lastPlayedDate || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    console.warn('[Supabase] Stats sync skipped:', err);
  }
}

/**
 * Sync individual game level advancement and high scores to 'game_progress'
 */
export async function syncGameProgressToCloud(
  userId: string,
  gameId: string,
  unlockedLevel: number,
  bestScore: number = 0
): Promise<void> {
  if (!userId || !gameId) return;
  try {
    await supabase.from('game_progress').upsert(
      {
        user_id: userId,
        game_id: gameId,
        unlocked_level: unlockedLevel,
        highest_level_cleared: Math.max(0, unlockedLevel - 1),
        best_score: bestScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,game_id' }
    );
  } catch (err) {
    console.warn('[Supabase] Game progress sync skipped:', err);
  }
}

/**
 * Pull cloud game progress and user stats to merge with local state
 */
export async function fetchCloudUserData(
  userId: string
): Promise<{ stats?: Partial<UserStats>; levels?: Record<string, number>; scores?: Record<string, number> } | null> {
  if (!userId) return null;
  try {
    // 1. Fetch game progress (unlocked levels and best scores)
    const { data: progressData } = await supabase
      .from('game_progress')
      .select('game_id, unlocked_level, best_score')
      .eq('user_id', userId);

    const levels: Record<string, number> = {};
    const scores: Record<string, number> = {};

    if (progressData && Array.isArray(progressData)) {
      for (const row of progressData) {
        if (row.game_id) {
          levels[row.game_id] = row.unlocked_level || 1;
          scores[row.game_id] = row.best_score || 0;
        }
      }
    }

    // 2. Fetch user stats
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const stats: Partial<UserStats> = {};
    if (statsData) {
      stats.streak = statsData.streak || 0;
      stats.totalSolved = statsData.total_solved || 0;
      stats.totalTimeMinutes = statsData.total_time_minutes || 0;
      stats.accuracyRate = statsData.accuracy_rate || 100;
      stats.arcadeRank = statsData.arcade_rank || 'BEGINNER // NOVICE';
      stats.lastPlayedDate = statsData.last_played_date || '';
    }

    return { stats, levels, scores };
  } catch (err) {
    console.warn('[Supabase] Cloud fetch skipped:', err);
    return null;
  }
}

/**
 * Merge local user profile with cloud data seamlessly.
 * Highest unlocked level & highest score always takes precedence.
 */
export async function syncLocalWithCloud(user: UserProfile): Promise<UserProfile> {
  if (!user || !user.id || user.id === 'guest_primary') {
    return user;
  }

  try {
    // Sync profile details
    syncProfileToCloud(user);

    // Fetch cloud state
    const cloudData = await fetchCloudUserData(user.id);
    if (!cloudData) {
      // If no cloud data yet, push local state to cloud
      syncStatsToCloud(user.id, user.stats);
      if (user.stats.levels) {
        for (const [gameId, lvl] of Object.entries(user.stats.levels)) {
          syncGameProgressToCloud(user.id, gameId, lvl, user.stats.scores?.[gameId] || 0);
        }
      }
      return user;
    }

    // Merge Levels (Highest level wins)
    const mergedLevels = { ...(user.stats.levels || {}) };
    let levelsChanged = false;
    if (cloudData.levels) {
      for (const [gameId, cloudLvl] of Object.entries(cloudData.levels)) {
        const localLvl = mergedLevels[gameId] || 1;
        if (cloudLvl > localLvl) {
          mergedLevels[gameId] = cloudLvl;
          levelsChanged = true;
        } else if (localLvl > cloudLvl) {
          // Push superior local level to cloud
          syncGameProgressToCloud(user.id, gameId, localLvl, user.stats.scores?.[gameId] || 0);
        }
      }
    }

    // Merge Scores (Highest score wins)
    const mergedScores = { ...(user.stats.scores || {}) };
    if (cloudData.scores) {
      for (const [gameId, cloudScore] of Object.entries(cloudData.scores)) {
        const localScore = mergedScores[gameId] || 0;
        if (cloudScore > localScore) {
          mergedScores[gameId] = cloudScore;
        } else if (localScore > cloudScore) {
          syncGameProgressToCloud(user.id, gameId, mergedLevels[gameId] || 1, localScore);
        }
      }
    }

    // Merge Overall Stats
    const mergedStats: UserStats = {
      ...user.stats,
      streak: Math.max(user.stats.streak || 0, cloudData.stats?.streak || 0),
      totalSolved: Math.max(user.stats.totalSolved || 0, cloudData.stats?.totalSolved || 0),
      totalTimeMinutes: Math.max(user.stats.totalTimeMinutes || 0, cloudData.stats?.totalTimeMinutes || 0),
      levels: mergedLevels,
      scores: mergedScores,
    };

    // Update cloud if local was higher
    syncStatsToCloud(user.id, mergedStats);

    return {
      ...user,
      stats: mergedStats,
    };
  } catch (err) {
    console.warn('[Supabase] Sync failed gracefully:', err);
    return user;
  }
}

/**
 * Fetch Top Global Players from Supabase for live leaderboard
 */
export async function fetchGlobalLeaderboard(): Promise<
  Array<{ rank: number; username: string; avatar: string; score: number; streak: number }>
> {
  try {
    const { data } = await supabase
      .from('user_stats')
      .select('user_id, total_solved, streak')
      .order('total_solved', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) return [];

    // Fetch matching profiles
    const userIds = data.map(d => d.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar')
      .in('user_id', userIds);

    const profileMap = new Map<string, { username: string; avatar: string }>();
    if (profiles) {
      for (const p of profiles) {
        profileMap.set(p.user_id, { username: p.username, avatar: p.avatar });
      }
    }

    return data.map((row, idx) => {
      const prof = profileMap.get(row.user_id);
      return {
        rank: idx + 1,
        username: prof?.username || `OPERATOR-${row.user_id.slice(0, 6)}`,
        avatar: prof?.avatar || '/anime/kakashi.svg',
        score: (row.total_solved || 0) * 100,
        streak: row.streak || 0,
      };
    });
  } catch (err) {
    console.warn('[Supabase] Global leaderboard skipped:', err);
    return [];
  }
}
