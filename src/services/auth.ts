import { UserProfile, UserStats, ActivityRecord } from '../types';

const ACCOUNTS_KEY = 'arcadex_registered_accounts';
const CURRENT_USER_KEY = 'arcadex_active_user_id';

export function createFreshStats(): UserStats {
  return {
    streak: 0,
    lastPlayedDate: '',
    totalSolved: 0,
    totalTimeMinutes: 0,
    accuracyRate: 100,
    arcadeRank: 'BEGINNER // NOVICE',
    scores: {},
    levels: {},
    activeDays: [],
  };
}

export const INITIAL_GUEST_STATS: UserStats = createFreshStats();

export function createDefaultGuestUser(): UserProfile {
  return {
    id: 'guest_primary',
    username: 'OPERATOR',
    email: '',
    avatar: '/anime/kakashi.svg',
    provider: 'guest',
    createdAt: new Date().toISOString(),
    stats: createFreshStats(),
    recentActivity: [],
  };
}

export const AVAILABLE_AVATARS = [
  { id: 'kakashi', name: 'Kakashi Hatake', src: '/anime/kakashi.svg', anime: 'Naruto' },
  { id: 'gojo', name: 'Gojo Satoru', src: '/anime/gojo.svg', anime: 'Jujutsu Kaisen' },
  { id: 'sukuna', name: 'Ryomen Sukuna', src: '/anime/sukuna.svg', anime: 'Jujutsu Kaisen' },
  { id: 'naruto', name: 'Naruto Uzumaki', src: '/anime/naruto.svg', anime: 'Naruto' },
  { id: 'sasuke', name: 'Sasuke Uchiha', src: '/anime/sasuke.svg', anime: 'Naruto' },
  { id: 'itachi', name: 'Itachi Uchiha', src: '/anime/itachi.svg', anime: 'Naruto' },
  { id: 'luffy', name: 'Monkey D. Luffy', src: '/anime/luffy.svg', anime: 'One Piece' },
  { id: 'zoro', name: 'Roronoa Zoro', src: '/anime/zoro.svg', anime: 'One Piece' },
  { id: 'sanji', name: 'Vinsmoke Sanji', src: '/anime/sanji.svg', anime: 'One Piece' },
  { id: 'levi', name: 'Levi Ackerman', src: '/anime/levi.svg', anime: 'Attack on Titan' },
  { id: 'eren', name: 'Eren Yeager', src: '/anime/eren.svg', anime: 'Attack on Titan' },
  { id: 'mikasa', name: 'Mikasa Ackerman', src: '/anime/mikasa.svg', anime: 'Attack on Titan' },
  { id: 'goku', name: 'Son Goku', src: '/anime/goku.svg', anime: 'Dragon Ball Super' },
  { id: 'vegeta', name: 'Prince Vegeta', src: '/anime/vegeta.svg', anime: 'Dragon Ball Super' },
  { id: 'tanjiro', name: 'Tanjiro Kamado', src: '/anime/tanjiro.svg', anime: 'Demon Slayer' },
  { id: 'nezuko', name: 'Nezuko Kamado', src: '/anime/nezuko.svg', anime: 'Demon Slayer' },
  { id: 'rengoku', name: 'Kyojuro Rengoku', src: '/anime/rengoku.svg', anime: 'Demon Slayer' },
  { id: 'saitama', name: 'Saitama', src: '/anime/saitama.svg', anime: 'One Punch Man' },
  { id: 'jinwoo', name: 'Sung Jin-woo', src: '/anime/jinwoo.svg', anime: 'Solo Leveling' },
  { id: 'light', name: 'Light Yagami', src: '/anime/light.svg', anime: 'Death Note' },
  { id: 'killua', name: 'Killua Zoldyck', src: '/anime/killua.svg', anime: 'Hunter x Hunter' },
  { id: 'kaneki', name: 'Ken Kaneki', src: '/anime/kaneki.svg', anime: 'Tokyo Ghoul' },
];

export function getAllAccounts(): Record<string, UserProfile> {
  if (typeof window === 'undefined') {
    const guest = createDefaultGuestUser();
    return { [guest.id]: guest };
  }
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      const guest = createDefaultGuestUser();
      const initial = { [guest.id]: guest };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const accounts: Record<string, UserProfile> = JSON.parse(raw) || {};

    // Ensure every loaded account has safe initialized stats objects
    for (const id of Object.keys(accounts)) {
      if (!accounts[id].stats) {
        accounts[id].stats = createFreshStats();
      } else {
        if (!accounts[id].stats.levels) accounts[id].stats.levels = {};
        if (!accounts[id].stats.scores) accounts[id].stats.scores = {};
      }
    }

    // If real accounts exist, remove the temporary guest placeholder
    const nonGuestKeys = Object.keys(accounts).filter(k => k !== 'guest_primary');
    if (nonGuestKeys.length > 0 && accounts['guest_primary']) {
      delete accounts['guest_primary'];
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    return accounts;
  } catch {
    const guest = createDefaultGuestUser();
    return { [guest.id]: guest };
  }
}

export function saveAccounts(accounts: Record<string, UserProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return createDefaultGuestUser();
  const accounts = getAllAccounts();
  const currentId = localStorage.getItem(CURRENT_USER_KEY);
  
  if (currentId && accounts[currentId]) {
    return accounts[currentId];
  }
  
  // If currentId doesn't exist, pick the first real account
  const nonGuestKey = Object.keys(accounts).find(k => k !== 'guest_primary');
  if (nonGuestKey && accounts[nonGuestKey]) {
    localStorage.setItem(CURRENT_USER_KEY, nonGuestKey);
    return accounts[nonGuestKey];
  }

  const firstId = Object.keys(accounts)[0];
  if (firstId && accounts[firstId]) {
    localStorage.setItem(CURRENT_USER_KEY, firstId);
    return accounts[firstId];
  }

  const freshGuest = createDefaultGuestUser();
  accounts[freshGuest.id] = freshGuest;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, freshGuest.id);
  return freshGuest;
}

export function setCurrentUserId(userId: string): UserProfile {
  if (typeof window === 'undefined') return createDefaultGuestUser();
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return getCurrentUser();
}

export function hasActiveRealUser(): boolean {
  if (typeof window === 'undefined') return false;
  const current = getCurrentUser();
  return Boolean(current && current.id !== 'guest_primary' && current.email && current.email.includes('@'));
}

export function getSavedRealAccounts(): UserProfile[] {
  const accounts = getAllAccounts();
  return Object.values(accounts).filter(
    a => a.id !== 'guest_primary' && Boolean(a.email && a.email.includes('@'))
  );
}

/**
 * Logout the CURRENT session without destroying other saved user accounts on this device.
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    // Note: We deliberately preserve ACCOUNTS_KEY so the user's progress is not destroyed!
  } catch (err) {
    console.error('Logout error:', err);
  }
}

/**
 * Permanently remove a specific user profile if requested
 */
export function deleteAccount(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getAllAccounts();
    delete accounts[userId];
    saveAccounts(accounts);
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentId === userId) {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Delete account error:', err);
  }
}

/**
 * Real Gmail Sign In: registers / switches to user's verified Gmail account
 * Every new user receives their own clean, isolated game progress starting from Level 1!
 */
export function loginWithRealGmail(email: string, callsign?: string, customAvatar?: string): UserProfile {
  const accounts = getAllAccounts();
  let cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    cleanEmail = `${cleanEmail}@gmail.com`;
  }

  // Derive callsign from email if not given
  const derivedName = callsign?.trim()
    ? callsign.trim().toUpperCase()
    : cleanEmail.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();

  const userId = `gmail_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  if (accounts[userId]) {
    // Existing user: update name/avatar if changed and switch to their saved database
    accounts[userId] = {
      ...accounts[userId],
      username: derivedName || accounts[userId].username,
      avatar: customAvatar || accounts[userId].avatar,
      email: cleanEmail,
      stats: {
        ...accounts[userId].stats,
        levels: accounts[userId].stats.levels || {},
        scores: accounts[userId].stats.scores || {},
      }
    };
    delete accounts['guest_primary'];
    saveAccounts(accounts);
    localStorage.setItem(CURRENT_USER_KEY, userId);
    return accounts[userId];
  }

  // BRAND NEW USER: Always initialize pure, independent stats starting at Level 1
  const newProfile: UserProfile = {
    id: userId,
    username: derivedName,
    email: cleanEmail,
    avatar: customAvatar || '/anime/kakashi.svg',
    provider: 'google',
    createdAt: new Date().toISOString(),
    stats: createFreshStats(),
    recentActivity: [],
  };

  delete accounts['guest_primary'];
  accounts[userId] = newProfile;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return newProfile;
}

export function loginWithGoogle(email: string, name: string, customAvatar?: string): UserProfile {
  return loginWithRealGmail(email, name, customAvatar);
}

export function loginWithGitHubAccount(usernameOrEmail: string, displayName?: string, avatarUrl?: string): UserProfile {
  const accounts = getAllAccounts();
  const cleanInput = usernameOrEmail.trim();
  const email = cleanInput.includes('@') ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@github.user`;
  const name = displayName?.trim() ? displayName.trim().toUpperCase() : cleanInput.toUpperCase();
  const userId = `github_${cleanInput.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (accounts[userId]) {
    accounts[userId] = {
      ...accounts[userId],
      username: name || accounts[userId].username,
      avatar: avatarUrl || accounts[userId].avatar,
      email: email,
      stats: {
        ...accounts[userId].stats,
        levels: accounts[userId].stats.levels || {},
        scores: accounts[userId].stats.scores || {},
      }
    };
    delete accounts['guest_primary'];
    saveAccounts(accounts);
    localStorage.setItem(CURRENT_USER_KEY, userId);
    return accounts[userId];
  }

  // BRAND NEW GITHUB USER: fresh isolated stats starting at Level 1
  const newProfile: UserProfile = {
    id: userId,
    username: name,
    email: email,
    avatar: avatarUrl || '/anime/jinwoo.svg',
    provider: 'github',
    createdAt: new Date().toISOString(),
    stats: createFreshStats(),
    recentActivity: [],
  };

  delete accounts['guest_primary'];
  accounts[userId] = newProfile;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return newProfile;
}

export function loginWithOAuthProvider(
  authUid: string,
  email: string,
  displayName: string,
  avatarUrl: string,
  provider: 'google' | 'github'
): UserProfile {
  if (provider === 'github') {
    return loginWithGitHubAccount(email, displayName, avatarUrl);
  }
  return loginWithRealGmail(email, displayName, avatarUrl);
}

export function registerCustomUser(username: string, email: string, avatar: string): UserProfile {
  const accounts = getAllAccounts();
  const cleanUsername = username.trim().toUpperCase();
  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const newProfile: UserProfile = {
    id: userId,
    username: cleanUsername,
    email: email.trim().toLowerCase() || `${cleanUsername.toLowerCase()}@arcadex.local`,
    avatar: avatar || '/anime/luffy.svg',
    provider: 'custom',
    createdAt: new Date().toISOString(),
    stats: createFreshStats(),
    recentActivity: [],
  };

  accounts[userId] = newProfile;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return newProfile;
}

export function switchAccount(userId: string): UserProfile {
  return setCurrentUserId(userId);
}

export function updateCurrentUserProfile(updates: Partial<UserProfile>): UserProfile {
  const currentUser = getCurrentUser();
  const accounts = getAllAccounts();

  const updated: UserProfile = {
    ...currentUser,
    ...updates,
    stats: updates.stats ? { ...currentUser.stats, ...updates.stats } : currentUser.stats,
  };

  accounts[currentUser.id] = updated;
  saveAccounts(accounts);
  return updated;
}

export function logActivity(gameId: string, gameTitle: string, score: number): ActivityRecord {
  const currentUser = getCurrentUser();
  let grade: 'S' | 'A' | 'B' | 'C' = 'B';
  if (score >= 1000) grade = 'S';
  else if (score >= 500) grade = 'A';
  else if (score >= 200) grade = 'B';
  else grade = 'C';

  const record: ActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    gameId,
    gameTitle,
    score,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    grade,
  };

  const updatedActivity = [record, ...(currentUser.recentActivity || [])].slice(0, 15);
  updateCurrentUserProfile({ recentActivity: updatedActivity });
  return record;
}
