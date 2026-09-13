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
}
