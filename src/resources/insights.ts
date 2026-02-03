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

/**
 * Compute engagement trends over time
 * Shows daily engagement progression and identifies trends
 */
export function computeEngagementTrends(sessions: Session[]): {
  daily: Array<{ date: string; touches: number; sessions: number }>;
  weekly: Array<{ week: string; touches: number; sessions: number; avgTouches: number }>;
  trend: 'improving' | 'stable' | 'declining';
  growthRate: number;
} {
  if (sessions.length === 0) {
    return {
      daily: [],
      weekly: [],
      trend: 'stable',
      growthRate: 0
    };
  }

  // Group by day
  const dailyStats: Record<string, { touches: number; sessions: number }> = {};

  sessions.forEach(session => {
    const date = new Date(session.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = { touches: 0, sessions: 0 };
    }
    dailyStats[dateKey].touches += session.touches;
    dailyStats[dateKey].sessions += 1;
  });

  const daily = Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group by week
  const weeklyStats: Record<string, { touches: number; sessions: number }> = {};

  sessions.forEach(session => {
    const date = new Date(session.timestamp);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { touches: 0, sessions: 0 };
    }
    weeklyStats[weekKey].touches += session.touches;
    weeklyStats[weekKey].sessions += 1;
  });

  const weekly = Object.entries(weeklyStats)
    .map(([week, stats]) => ({
      week,
      touches: stats.touches,
      sessions: stats.sessions,
      avgTouches: Math.round(stats.touches / stats.sessions)
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Calculate trend (based on last 2 weeks if available)
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let growthRate = 0;

  if (weekly.length >= 2) {
    const lastWeek = weekly[weekly.length - 1];
    const prevWeek = weekly[weekly.length - 2];
    const change = lastWeek.avgTouches - prevWeek.avgTouches;
    growthRate = Math.round((change / prevWeek.avgTouches) * 100);

    if (growthRate > 10) trend = 'improving';
    else if (growthRate < -10) trend = 'declining';
  }

  return { daily, weekly, trend, growthRate };
}

/**
 * Compare current week vs previous week
 */
export function computeWeekOverWeekComparison(sessions: Session[]): {
  currentWeek: {
    sessions: number;
    touches: number;
    avgTouches: number;
    completionRate: number;
    topTheme: string;
  };
  previousWeek: {
    sessions: number;
    touches: number;
    avgTouches: number;
    completionRate: number;
    topTheme: string;
  };
  changes: {
    sessions: { value: number; percent: number };
    touches: { value: number; percent: number };
    avgTouches: { value: number; percent: number };
    completionRate: { value: number; percent: number };
  };
  summary: string;
} {
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

  // Current week sessions
  const currentWeekSessions = sessions.filter(s => s.timestamp >= oneWeekAgo);

  // Previous week sessions
  const previousWeekSessions = sessions.filter(
    s => s.timestamp >= twoWeeksAgo && s.timestamp < oneWeekAgo
  );

  const computeWeekStats = (weekSessions: Session[]) => {
    if (weekSessions.length === 0) {
      return {
        sessions: 0,
        touches: 0,
        avgTouches: 0,
        completionRate: 0,
        topTheme: 'None'
      };
    }

    const totalTouches = weekSessions.reduce((sum, s) => sum + s.touches, 0);
    const completed = weekSessions.filter(s => s.completedFull).length;
    const topTheme = getMostFrequent(weekSessions.map(s => s.theme));

    return {
      sessions: weekSessions.length,
      touches: totalTouches,
      avgTouches: Math.round(totalTouches / weekSessions.length),
      completionRate: Math.round((completed / weekSessions.length) * 100),
      topTheme
    };
  };

  const currentWeek = computeWeekStats(currentWeekSessions);
  const previousWeek = computeWeekStats(previousWeekSessions);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: current, percent: 0 };
    const value = current - previous;
    const percent = Math.round((value / previous) * 100);
    return { value, percent };
  };

  const changes = {
    sessions: calculateChange(currentWeek.sessions, previousWeek.sessions),
    touches: calculateChange(currentWeek.touches, previousWeek.touches),
    avgTouches: calculateChange(currentWeek.avgTouches, previousWeek.avgTouches),
    completionRate: calculateChange(currentWeek.completionRate, previousWeek.completionRate)
  };

  // Generate summary
  let summary = '';
  if (previousWeek.sessions === 0) {
    summary = 'First week of data! Keep playing to see trends.';
  } else if (changes.touches.percent > 10) {
    summary = `Great progress! Engagement is up ${changes.touches.percent}% this week.`;
  } else if (changes.touches.percent < -10) {
    summary = `Engagement dropped ${Math.abs(changes.touches.percent)}% this week. Try introducing new themes!`;
  } else {
    summary = 'Steady engagement. Maintaining consistent play patterns.';
  }

  return {
    currentWeek,
    previousWeek,
    changes,
    summary
  };
}
