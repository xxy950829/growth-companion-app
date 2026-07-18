// 心情天气瓶状态管理
import { create } from 'zustand';
import type { Moods, MoodRecord, WeatherType, Temperature, MoodStatistics } from '@/types';
import { WEATHER_CONFIG } from '@/types/weather';
import * as db from '@/services/api-database';
import { generateId } from '@/utils/helpers';
import { EVENTS, logEvent } from '@/services/analytics';

interface WeatherStoreState {
  moods: Moods | null;
  loading: boolean;

  load: (babyId: string) => Promise<void>;
  addMood: (
    babyId: string,
    data: { weather: WeatherType; temperature: Temperature; note?: string; drawingUrl?: string; date: number }
  ) => Promise<void>;
  deleteMood: (babyId: string, moodId: string) => Promise<void>;
  getStatistics: () => MoodStatistics;
  getRecentRecords: (limit?: number) => MoodRecord[];
}

function emptyMoods(babyId: string): Moods {
  return {
    babyId,
    records: [],
    statistics: {
      totalRecords: 0,
      mostFrequent: null,
      averageMood: 0,
      weeklyTrend: 'stable',
      distribution: {},
    },
  };
}

function calcStats(records: MoodRecord[]): MoodStatistics {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      mostFrequent: null,
      averageMood: 0,
      weeklyTrend: 'stable',
      distribution: {},
    };
  }
  const distribution: Record<string, number> = {};
  let totalScore = 0;
  for (const r of records) {
    distribution[r.weather] = (distribution[r.weather] || 0) + 1;
    totalScore += WEATHER_CONFIG[r.weather].score;
  }
  const mostFrequent = (Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'sunny') as WeatherType;

  // 周趋势：比较最近7天和前7天的平均分
  const now = Date.now();
  const weekMs = 7 * 24 * 3600 * 1000;
  const recentWeek = records.filter((r) => r.date >= now - weekMs);
  const prevWeek = records.filter((r) => r.date >= now - 2 * weekMs && r.date < now - weekMs);
  const recentAvg = recentWeek.length
    ? recentWeek.reduce((s, r) => s + WEATHER_CONFIG[r.weather].score, 0) / recentWeek.length
    : 0;
  const prevAvg = prevWeek.length
    ? prevWeek.reduce((s, r) => s + WEATHER_CONFIG[r.weather].score, 0) / prevWeek.length
    : 0;
  let weeklyTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentAvg > prevAvg + 0.3) weeklyTrend = 'improving';
  else if (recentAvg < prevAvg - 0.3) weeklyTrend = 'declining';

  return {
    totalRecords: records.length,
    mostFrequent,
    averageMood: Number((totalScore / records.length).toFixed(1)),
    weeklyTrend,
    distribution,
  };
}

export const useWeatherStore = create<WeatherStoreState>((set, get) => ({
  moods: null,
  loading: false,

  load: async (babyId) => {
    set({ loading: true });
    try {
      const moods = (await db.loadMoods(babyId)) || emptyMoods(babyId);
      // 确保按日期倒序排列（最新的在最前面）
      moods.records = [...moods.records].sort((a, b) => b.date - a.date);
      set({ moods });
    } finally {
      set({ loading: false });
    }
  },

  addMood: async (babyId, data) => {
    const record: MoodRecord = {
      ...data,
      id: generateId('mood'),
      createdBy: 'parent',
      createdAt: Date.now(),
    };
    const created = await db.addMoodRecord(babyId, record);
    const moods = get().moods || emptyMoods(babyId);
    const records = [created, ...moods.records];
    const updated: Moods = {
      ...moods,
      babyId,
      records,
      statistics: calcStats(records),
    };
    set({ moods: updated });
    logEvent(EVENTS.RECORD_MOOD, { weather: data.weather });
  },

  deleteMood: async (babyId, moodId) => {
    const moods = get().moods;
    if (!moods) return;
    const records = moods.records.filter((r) => r.id !== moodId);
    const updated: Moods = {
      ...moods,
      records,
      statistics: calcStats(records),
    };
    await db.deleteMoodRecord(babyId, moodId);
    set({ moods: updated });
  },

  getStatistics: () => {
    const moods = get().moods;
    if (!moods) return calcStats([]);
    return calcStats(moods.records);
  },

  getRecentRecords: (limit = 7) => {
    const moods = get().moods;
    if (!moods) return [];
    return [...moods.records]
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);
  },
}));
