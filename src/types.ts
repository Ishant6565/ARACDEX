export type GameCategory = 'logic' | 'math' | 'memory' | 'spatial';

export interface GameInfo {
  id: string;
  number: string; // e.g. "01", "02"
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
  accuracyRate: number; // percentage e.g. 96
  arcadeRank: string; // e.g. "ARCHITECT // LVL 4"
  scores: Record<string, number>;
}
