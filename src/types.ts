export type GameCategory = 'arcade' | 'logic' | 'memory' | 'puzzle' | 'anime';

export interface GameInfo {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: GameCategory;
  difficulty: 'Elementary' | 'Intermediate' | 'Master' | 'Grandmaster';
  estimatedTime: string;
  description: string;
  instructions: string[];
  controls: string;
  bestScoreKey: string;
  badge?: string;
}

export interface UserStats {
  streak: number;
  lastPlayedDate: string;
  totalSolved: number;
  totalTimeMinutes: number;
  accuracyRate: number;
  arcadeRank: string;
  scores: Record<string, number>;
  levels?: Record<string, number>; // Game level progression (1..100)
  activeDays?: string[]; // Array of YYYY-MM-DD
}

export interface ActivityRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  score: number;
  timestamp: string;
  grade: 'S' | 'A' | 'B' | 'C';
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  provider: 'google' | 'custom' | 'guest';
  createdAt: string;
  stats: UserStats;
  recentActivity: ActivityRecord[];
}

export interface TierInfo {
  tierNumber: number;
  levelName: string;
  title: string;
  minSolved: number;
  maxSolved: number;
  perk: string;
  badgeIcon: string;
  accentColor: string;
  description: string;
}
