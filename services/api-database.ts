// 数据库服务 - 基于后端 REST API（babies/milestones/tasks/moods 增删改查）

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { STORAGE_KEYS } from '@/utils/constants';
import { getTodayKey } from '@/utils/helpers';
import type {
  Archive, Habits, Moods, Baby, Milestone, Task, TaskCompletion,
  PlanetState, MoodRecord, GrowthStats, MoodStatistics,
} from '@/types';
import { WEATHER_CONFIG } from '@/types/weather';
import type { WeatherType } from '@/types';

// ===== 统计计算（与 database.ts 保持一致） =====

function calcGrowthStats(milestones: Milestone[]): GrowthStats {
  const stats: GrowthStats = {
    totalMilestones: milestones.length,
    milestonesByType: {},
  };
  for (const m of milestones) {
    stats.milestonesByType[m.type] = (stats.milestonesByType[m.type] || 0) + 1;
    if (stats.lastHeight == null && m.height != null) stats.lastHeight = m.height;
    if (stats.lastWeight == null && m.weight != null) stats.lastWeight = m.weight;
  }
  return stats;
}

function calcMoodStats(records: MoodRecord[]): MoodStatistics {
  if (records.length === 0) {
    return { totalRecords: 0, mostFrequent: null, averageMood: 0, weeklyTrend: 'stable', distribution: {} };
  }
  const distribution: Record<string, number> = {};
  let totalScore = 0;
  for (const r of records) {
    distribution[r.weather] = (distribution[r.weather] || 0) + 1;
    totalScore += WEATHER_CONFIG[r.weather].score;
  }
  const mostFrequent = (Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'sunny') as WeatherType;
  const now = Date.now();
  const weekMs = 7 * 24 * 3600 * 1000;
  const recentWeek = records.filter((r) => r.date >= now - weekMs);
  const prevWeek = records.filter((r) => r.date >= now - 2 * weekMs && r.date < now - weekMs);
  const recentAvg = recentWeek.length ? recentWeek.reduce((s, r) => s + WEATHER_CONFIG[r.weather].score, 0) / recentWeek.length : 0;
  const prevAvg = prevWeek.length ? prevWeek.reduce((s, r) => s + WEATHER_CONFIG[r.weather].score, 0) / prevWeek.length : 0;
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

// ===== 宝宝档案 =====

export async function loadBabies(): Promise<Baby[]> {
  return api.get<Baby[]>('/babies');
}

// REST 模式不需要本地缓存写入，保留空函数兼容 store 调用
export async function saveBabies(_babies: Baby[]): Promise<void> {}

export async function addBaby(baby: Baby): Promise<Baby> {
  return api.post<Baby>('/babies', {
    name: baby.name,
    gender: baby.gender,
    birthday: baby.birthday,
    avatarUrl: baby.avatarUrl,
  });
}

export async function updateBaby(babyId: string, updates: Partial<Omit<Baby, 'id' | 'createdAt'>>): Promise<void> {
  await api.put<Baby>(`/babies/${babyId}`, updates);
}

export async function setCurrentBaby(babyId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BABY, babyId);
}

export async function getCurrentBabyId(): Promise<string | null> {
  const id = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BABY);
  if (id) return id;
  const babies = await loadBabies();
  if (babies.length > 0) {
    await setCurrentBaby(babies[0].id);
    return babies[0].id;
  }
  return null;
}

// ===== 成长档案 =====

export async function loadArchive(babyId: string): Promise<Archive | null> {
  // 后端返回分页对象 { list, total, page, pageSize }，取 list 字段
  const res = await api.get<{ list: Milestone[]; total: number }>(`/babies/${babyId}/milestones?pageSize=1000`);
  const sorted = [...res.list].sort((a, b) => b.date - a.date);
  return { babyId, milestones: sorted, stats: calcGrowthStats(sorted) };
}

export async function saveArchive(_archive: Archive): Promise<void> {}

export async function addMilestone(babyId: string, milestone: Milestone): Promise<Milestone> {
  // 后端生成 id，前端只传数据
  const { id: _id, createdAt: _createdAt, createdBy: _createdBy, ...data } = milestone;
  return api.post<Milestone>(`/babies/${babyId}/milestones`, data);
}

export async function deleteMilestone(babyId: string, milestoneId: string): Promise<void> {
  await api.delete<void>(`/babies/${babyId}/milestones/${milestoneId}`);
}

// ===== 习惯任务 =====

export async function loadHabits(babyId: string): Promise<Habits | null> {
  // 并行加载任务列表、完成记录、星球状态
  const [tasks, completions, planet] = await Promise.all([
    api.get<Task[]>(`/babies/${babyId}/tasks`),
    api.get<TaskCompletion[]>(`/babies/${babyId}/tasks/completions`),
    api.get<PlanetState>(`/babies/${babyId}/tasks/planet`),
  ]);

  // 将完成记录数组转为 { dateKey: { taskId: completion } } 结构
  const completionsMap: Record<string, Record<string, TaskCompletion>> = {};
  for (const c of completions) {
    const dateKey = c.dateKey || getTodayKey();
    if (!completionsMap[dateKey]) completionsMap[dateKey] = {};
    completionsMap[dateKey][c.taskId] = c;
  }

  return { babyId, tasks, completions: completionsMap, planet };
}

export async function saveHabits(_habits: Habits): Promise<void> {}

export async function addTask(babyId: string, task: Task): Promise<Task> {
  const { id: _id, isActive: _isActive, ...data } = task;
  return api.post<Task>(`/babies/${babyId}/tasks`, data);
}

export async function updateTask(babyId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  await api.put<Task>(`/babies/${babyId}/tasks/${taskId}`, updates);
}

export async function deleteTask(babyId: string, taskId: string): Promise<void> {
  await api.delete<void>(`/babies/${babyId}/tasks/${taskId}`);
}

export async function addCompletion(babyId: string, taskId: string, completion: TaskCompletion): Promise<void> {
  await api.post<TaskCompletion>(`/babies/${babyId}/tasks/${taskId}/complete`, {
    dateKey: getTodayKey(),
    completedBy: completion.completedBy,
    note: completion.note,
  });
}

export async function removeCompletion(babyId: string, taskId: string, dateKey?: string): Promise<void> {
  const key = dateKey || getTodayKey();
  await api.delete<void>(`/babies/${babyId}/tasks/${taskId}/complete?dateKey=${key}`);
}

export async function updatePlanet(babyId: string, planet: PlanetState): Promise<void> {
  await api.put<PlanetState>(`/babies/${babyId}/tasks/planet`, planet);
}

// ===== 心情天气瓶 =====

export async function loadMoods(babyId: string): Promise<Moods | null> {
  // 后端返回分页对象 { list, total, page, pageSize }，取 list 字段
  const res = await api.get<{ list: MoodRecord[]; total: number }>(`/babies/${babyId}/moods?pageSize=1000`);
  const sorted = [...res.list].sort((a, b) => b.date - a.date);
  return { babyId, records: sorted, statistics: calcMoodStats(sorted) };
}

export async function saveMoods(_moods: Moods): Promise<void> {}

export async function addMoodRecord(babyId: string, record: MoodRecord): Promise<MoodRecord> {
  const { id: _id, createdAt: _createdAt, createdBy: _createdBy, ...data } = record;
  return api.post<MoodRecord>(`/babies/${babyId}/moods`, data);
}

export async function deleteMoodRecord(babyId: string, moodId: string): Promise<void> {
  await api.delete<void>(`/babies/${babyId}/moods/${moodId}`);
}
