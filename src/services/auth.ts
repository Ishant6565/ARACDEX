import { UserProfile, UserStats, ActivityRecord } from '../types';

const ACCOUNTS_KEY = 'arcadex_registered_accounts';
const CURRENT_USER_KEY = 'arcadex_active_user_id';

export const INITIAL_GUEST_STATS: UserStats = {
  streak: 0,
  lastPlayedDate: '',
  totalSolved: 0,
  totalTimeMinutes: 0,
  accuracyRate: 100,
  arcadeRank: 'BEGINNER // NOVICE',
  scores: {},
  activeDays: [],
};

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest_primary',
  username: 'GUEST OPERATOR',
  email: 'operator@arcadex.local',
  avatar: '/anime/gojo.svg',
  provider: 'guest',
  createdAt: new Date().toISOString(),
  stats: { ...INITIAL_GUEST_STATS },
  recentActivity: [],
};

export const AVAILABLE_AVATARS = [
  { id: 'gojo', name: 'Gojo Satoru', src: '/anime/gojo.svg', anime: 'Jujutsu Kaisen' },
  { id: 'sukuna', name: 'Ryomen Sukuna', src: '/anime/sukuna.svg', anime: 'Jujutsu Kaisen' },
  { id: 'naruto', name: 'Naruto Uzumaki', src: '/anime/naruto.svg', anime: 'Naruto' },
  { id: 'sasuke', name: 'Sasuke Uchiha', src: '/anime/sasuke.svg', anime: 'Naruto' },
  { id: 'itachi', name: 'Itachi Uchiha', src: '/anime/itachi.svg', anime: 'Naruto' },
  { id: 'kakashi', name: 'Kakashi Hatake', src: '/anime/kakashi.svg', anime: 'Naruto' },
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
  if (typeof window === 'undefined') return { [DEFAULT_GUEST_USER.id]: DEFAULT_GUEST_USER };
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      const initial = { [DEFAULT_GUEST_USER.id]: DEFAULT_GUEST_USER };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const accounts = JSON.parse(raw);
    let modified = false;
    for (const key of Object.keys(accounts)) {
      if (accounts[key]?.username && accounts[key].username.toLowerCase().includes('ishant sharma')) {
        accounts[key].username = 'KAKASHI HATAKE';
        accounts[key].email = 'kakashi.hatake@gmail.com';
        accounts[key].avatar = '/anime/kakashi.svg';
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    return accounts;
  } catch {
    return { [DEFAULT_GUEST_USER.id]: DEFAULT_GUEST_USER };
  }
}

export function saveAccounts(accounts: Record<string, UserProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_GUEST_USER;
  const accounts = getAllAccounts();
  const currentId = localStorage.getItem(CURRENT_USER_KEY) || DEFAULT_GUEST_USER.id;
  
  if (accounts[currentId]) {
    return accounts[currentId];
  }
  
  // If currentId doesn't exist, pick first or fallback to guest
  const firstId = Object.keys(accounts)[0];
  if (firstId && accounts[firstId]) {
    localStorage.setItem(CURRENT_USER_KEY, firstId);
    return accounts[firstId];
  }

  accounts[DEFAULT_GUEST_USER.id] = DEFAULT_GUEST_USER;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, DEFAULT_GUEST_USER.id);
  return DEFAULT_GUEST_USER;
}

export function setCurrentUserId(userId: string): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_GUEST_USER;
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return getCurrentUser();
}

export function loginWithGoogle(email: string, name: string, customAvatar?: string): UserProfile {
  const accounts = getAllAccounts();
  const userId = `google_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (accounts[userId]) {
    // Existing user: log in
    localStorage.setItem(CURRENT_USER_KEY, userId);
    return accounts[userId];
  }

  // Create new profile for this Google Account
  const newProfile: UserProfile = {
    id: userId,
    username: name.toUpperCase() || 'GOOGLE OPERATOR',
    email: email.toLowerCase(),
    avatar: customAvatar || '/anime/gojo.svg',
    provider: 'google',
    createdAt: new Date().toISOString(),
    stats: { ...INITIAL_GUEST_STATS },
    recentActivity: [],
  };

  accounts[userId] = newProfile;
  saveAccounts(accounts);
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return newProfile;
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
    stats: { ...INITIAL_GUEST_STATS },
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
