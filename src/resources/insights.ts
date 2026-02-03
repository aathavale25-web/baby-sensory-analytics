/**
 * Analytics computations for engagement insights
 */

import { Session, WeeklySummary } from '../types.js';

export function getMostFrequent(items: string[]): string {
  if (items.length === 0) return 'Unknown';

  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)[0][0];
}

export function getMostTouchedColor(sessions: Session[]): string {
  const allColors: Record<string, number> = {};

  sessions.forEach(session => {
    Object.entries(session.colorCounts).forEach(([color, count]) => {
      allColors[color] = (allColors[color] || 0) + count;
    });
  });

  if (Object.keys(allColors).length === 0) return '#FFFFFF';

  return Object.entries(allColors)
    .sort(([, a], [, b]) => b - a)[0][0];
}

export function getTopObjects(sessions: Session[], limit: number): Array<{ emoji: string; count: number }> {
  const allObjects: Record<string, number> = {};

  sessions.forEach(session => {
    Object.entries(session.objectCounts).forEach(([emoji, count]) => {
      allObjects[emoji] = (allObjects[emoji] || 0) + count;
    });
  });

  return Object.entries(allObjects)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopRhymes(sessions: Session[], limit: number): Array<{ name: string; plays: number }> {
  const allRhymes: Record<string, number> = {};

  sessions.forEach(session => {
    session.nurseryRhymesPlayed.forEach(rhyme => {
      allRhymes[rhyme] = (allRhymes[rhyme] || 0) + 1;
    });
  });

  return Object.entries(allRhymes)
    .map(([name, plays]) => ({ name, plays }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);
}

export function getBestTimeOfDay(sessions: Session[]): 'morning' | 'afternoon' | 'evening' {
  const timeBuckets = {
    morning: 0,    // 6am - 12pm
    afternoon: 0,  // 12pm - 6pm
    evening: 0     // 6pm - 6am
  };

  sessions.forEach(session => {
    const date = new Date(session.timestamp);
    const hour = date.getHours();

    if (hour >= 6 && hour < 12) {
      timeBuckets.morning += session.touches;
    } else if (hour >= 12 && hour < 18) {
      timeBuckets.afternoon += session.touches;
    } else {
      timeBuckets.evening += session.touches;
    }
  });

  const entries = Object.entries(timeBuckets) as Array<['morning' | 'afternoon' | 'evening', number]>;
  return entries.sort(([, a], [, b]) => b - a)[0][0];
}

export function computeWeeklySummary(sessions: Session[]): WeeklySummary {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter(s => s.timestamp >= weekAgo);

  if (recentSessions.length === 0) {
    return {
      message: 'No sessions this week!',
      totalSessions: 0,
      totalTouches: 0,
      averageDuration: 0,
      favoriteTheme: 'Unknown',
      favoriteColor: '#FFFFFF',
      topObjects: [],
      topRhymes: [],
      bestTimeOfDay: 'morning'
    };
  }

  return {
    totalSessions: recentSessions.length,
    totalTouches: recentSessions.reduce((sum, s) => sum + s.touches, 0),
    averageDuration: Math.round(
      recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length
    ),
    favoriteTheme: getMostFrequent(recentSessions.map(s => s.theme)),
    favoriteColor: getMostTouchedColor(recentSessions),
    topObjects: getTopObjects(recentSessions, 5),
    topRhymes: getTopRhymes(recentSessions, 3),
    bestTimeOfDay: getBestTimeOfDay(recentSessions)
  };
}

export function computeThemeRankings(sessions: Session[]): Array<{ theme: string; touches: number; sessions: number }> {
  const themeStats: Record<string, { touches: number; sessions: number }> = {};

  sessions.forEach(session => {
    if (!themeStats[session.theme]) {
      themeStats[session.theme] = { touches: 0, sessions: 0 };
    }
    themeStats[session.theme].touches += session.touches;
    themeStats[session.theme].sessions += 1;
  });

  return Object.entries(themeStats)
    .map(([theme, stats]) => ({ theme, ...stats }))
    .sort((a, b) => b.touches - a.touches);
}

export function computeColorEngagement(sessions: Session[]): Array<{ color: string; touches: number }> {
  const colorTouches: Record<string, number> = {};

  sessions.forEach(session => {
    Object.entries(session.colorCounts).forEach(([color, count]) => {
      colorTouches[color] = (colorTouches[color] || 0) + count;
    });
  });

  return Object.entries(colorTouches)
    .map(([color, touches]) => ({ color, touches }))
    .sort((a, b) => b.touches - a.touches);
}

export function computeTimingPatterns(sessions: Session[]): {
  byHour: Record<number, number>;
  byDayOfWeek: Record<string, number>;
  bestTime: string;
} {
  const byHour: Record<number, number> = {};
  const byDayOfWeek: Record<string, number> = {};
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  sessions.forEach(session => {
    const date = new Date(session.timestamp);
    const hour = date.getHours();
    const dayName = daysOfWeek[date.getDay()];

    byHour[hour] = (byHour[hour] || 0) + session.touches;
    byDayOfWeek[dayName] = (byDayOfWeek[dayName] || 0) + session.touches;
  });

  const bestHour = Object.entries(byHour)
    .sort(([, a], [, b]) => b - a)[0];

  const bestTime = bestHour
    ? `${bestHour[0]}:00 (${bestHour[1]} touches)`
    : 'Not enough data';

  return { byHour, byDayOfWeek, bestTime };
}
