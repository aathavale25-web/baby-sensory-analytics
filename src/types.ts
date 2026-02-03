/**
 * Core data types for Baby Sensory Analytics
 */

export interface Session {
  id: string;
  timestamp: number;
  theme: string;
  duration: number;
  touches: number;
  colorCounts: Record<string, number>;
  objectCounts: Record<string, number>;
  nurseryRhymesPlayed: string[];
  streaks: number;
  milestones: number[];
  completedFull: boolean;
}

export interface AnalyticsCache {
  lastUpdated: number;
  favoriteTheme: string;
  favoriteColor: string;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
  totalSessions: number;
  totalTouches: number;
  averageSessionDuration: number;
  topObjects: Array<{ emoji: string; count: number }>;
  topNurseryRhymes: Array<{ name: string; plays: number }>;
}

export interface CreateSessionRequest {
  theme: string;
  duration: number;
  touches: number;
  colorCounts: Record<string, number>;
  objectCounts: Record<string, number>;
  nurseryRhymesPlayed: string[];
  streaks: number;
  milestones: number[];
  completedFull: boolean;
}

export interface WeeklySummary {
  message?: string;
  totalSessions: number;
  totalTouches: number;
  averageDuration: number;
  favoriteTheme: string;
  favoriteColor: string;
  topObjects: Array<{ emoji: string; count: number }>;
  topRhymes: Array<{ name: string; plays: number }>;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
}
