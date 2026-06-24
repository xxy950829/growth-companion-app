// 数据库服务 - 基于 CloudBase 云数据库
// 文档：https://docs.cloudbase.net/api-reference/webv3/database

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Archive, Habits, Moods, Baby, Milestone, Task, TaskCompletion, PlanetState, MoodRecord, GrowthStats, MoodStatistics } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { CLOUDBASE_ENABLED, db, COLLECTIONS } from './cloudbase';
import { generateId, getTodayKey } from '@/utils/helpers';
import { WEATHER_CONFIG } from '@/types/weather';
import type { WeatherType } from '@/types';

// ===== 通用本地存储工具 =====

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.warn('readJSON error:', key, e);
    return null;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('writeJSON error:', key, e);
  }
}

// ===== 统计计算（共享逻辑） =====

function calcGrowthStats(milestones: Milestone[]): GrowthStats {
  const stats: GrowthStats = {
    totalMilestones: milestones.length,
    milestonesByType: {},
  };
  for (const m of milestones) {
    stats.milestonesByType[m.type] = (stats.milestonesByType[m.type] || 0) + 1;
    if (m.type === 'first_steps' && !stats.firstStepsDate) stats.firstStepsDate = m.date;
    if (m.type === 'first_words' && !stats.firstWordsDate) stats.firstWordsDate = m.date;
    if (m.type === 'weight') stats.lastWeight = m.weight;
    if (m.type === 'height') stats.lastHeight = m.height;
  }
  return stats;
}

function calcMoodStats(records: MoodRecord[]): MoodStatistics {
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

// ===== 宝宝档案 =====

export async function loadBabies(): Promise<Baby[]> {
  if (CLOUDBASE_ENABLED && db) {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!user) return [];
    const { uid } = JSON.parse(user) as { uid: string };
    const res = await db.collection(COLLECTIONS.BABIES).where({ userId: uid }).get();
    return (res.data || []).map((d: any) => {
      const { _id, _createTime, _updateTime, ...rest } = d;
      return { ...rest, id: _id } as Baby;
    });
  }
  return (await readJSON<Baby[]>(STORAGE_KEYS.BABIES)) || [];
}

export async function saveBabies(babies: Baby[]): Promise<void> {
  if (!CLOUDBASE_ENABLED) {
    await writeJSON(STORAGE_KEYS.BABIES, babies);
  }
}

export async function addBaby(baby: Baby): Promise<void> {
  const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!user) throw new Error('未登录');
  const { uid } = JSON.parse(user) as { uid: string };

  if (CLOUDBASE_ENABLED && db) {
    await db.collection(COLLECTIONS.BABIES).add({
      _id: baby.id,
      userId: uid,
      name: baby.name,
      gender: baby.gender,
      birthday: baby.birthday,
      avatarUrl: baby.avatarUrl,
      createdAt: baby.createdAt,
    });
    // 初始化星球状态
    const planet: PlanetState = {
      level: 1,
      stars: 0,
      experience: 0,
      achievements: [],
      lastUpdated: Date.now(),
    };
    await db.collection(COLLECTIONS.PLANET_STATES).add({
      _id: generateId('planet'),
      babyId: baby.id,
      ...planet,
    });
    return;
  }

  const babies = await loadBabies();
  babies.push(baby);
  await saveBabies(babies);
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
  if (CLOUDBASE_ENABLED && db) {
    const res = await db.collection(COLLECTIONS.MILESTONES).where({ babyId }).get();
    const milestones: Milestone[] = (res.data || []).map((d: any) => {
      const { _id, _createTime, _updateTime, ...rest } = d;
      return { ...rest, id: _id } as Milestone;
    });
    return {
      babyId,
      milestones: milestones.sort((a, b) => b.date - a.date),
      stats: calcGrowthStats(milestones),
    };
  }
  return readJSON<Archive>(`${STORAGE_KEYS.ARCHIVE}_${babyId}`);
}

export async function saveArchive(archive: Archive): Promise<void> {
  if (!CLOUDBASE_ENABLED) {
    await writeJSON(`${STORAGE_KEYS.ARCHIVE}_${archive.babyId}`, archive);
  }
}

export async function addMilestone(babyId: string, milestone: Milestone): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    const { id, ...rest } = milestone;
    await db.collection(COLLECTIONS.MILESTONES).add({ _id: id, babyId, ...rest });
    return;
  }
  // 本地模式
  const archive = (await loadArchive(babyId)) || {
    babyId,
    milestones: [],
    stats: { totalMilestones: 0, milestonesByType: {} },
  };
  archive.milestones = [milestone, ...archive.milestones];
  archive.stats = calcGrowthStats(archive.milestones);
  await saveArchive(archive);
}

export async function deleteMilestone(babyId: string, milestoneId: string): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    await db.collection(COLLECTIONS.MILESTONES).doc(milestoneId).remove();
    return;
  }
  const archive = await loadArchive(babyId);
  if (!archive) return;
  archive.milestones = archive.milestones.filter((m) => m.id !== milestoneId);
  archive.stats = calcGrowthStats(archive.milestones);
  await saveArchive(archive);
}

// ===== 习惯任务 =====

export async function loadHabits(babyId: string): Promise<Habits | null> {
  if (CLOUDBASE_ENABLED && db) {
    // 并行查询任务定义、完成记录、星球状态
    const [tasksRes, completionsRes, planetRes] = await Promise.all([
      db.collection(COLLECTIONS.TASKS).where({ babyId }).get(),
      db.collection(COLLECTIONS.TASK_COMPLETIONS).where({ babyId }).get(),
      db.collection(COLLECTIONS.PLANET_STATES).where({ babyId }).get(),
    ]);

    const tasks: Task[] = (tasksRes.data || []).map((d: any) => {
      const { _id, _createTime, _updateTime, ...rest } = d;
      return { ...rest, id: _id } as Task;
    });

    // 按日期组织完成记录
    const completions: Record<string, Record<string, TaskCompletion>> = {};
    for (const c of completionsRes.data || []) {
      const { _id, _createTime, _updateTime, date, taskId, ...rest } = c;
      if (!completions[date]) completions[date] = {};
      completions[date][taskId] = { taskId, ...rest } as TaskCompletion;
    }

    const planetData = planetRes.data?.[0];
    const planet: PlanetState = planetData
      ? {
          level: planetData.level || 1,
          stars: planetData.stars || 0,
          experience: planetData.experience || 0,
          achievements: planetData.achievements || [],
          lastUpdated: planetData.lastUpdated || Date.now(),
        }
      : {
          level: 1,
          stars: 0,
          experience: 0,
          achievements: [],
          lastUpdated: Date.now(),
        };

    return { babyId, tasks, completions, planet };
  }
  return readJSON<Habits>(`${STORAGE_KEYS.HABITS}_${babyId}`);
}

export async function saveHabits(habits: Habits): Promise<void> {
  if (!CLOUDBASE_ENABLED) {
    await writeJSON(`${STORAGE_KEYS.HABITS}_${habits.babyId}`, habits);
  }
}

export async function addTask(babyId: string, task: Task): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    const { id, ...rest } = task;
    await db.collection(COLLECTIONS.TASKS).add({ _id: id, babyId, ...rest });
    return;
  }
  const habits = (await loadHabits(babyId)) || {
    babyId,
    tasks: [],
    completions: {},
    planet: { level: 1, stars: 0, experience: 0, achievements: [], lastUpdated: Date.now() },
  };
  habits.tasks.push(task);
  await saveHabits(habits);
}

export async function updateTask(babyId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    await db.collection(COLLECTIONS.TASKS).doc(taskId).update(updates);
    return;
  }
  const habits = await loadHabits(babyId);
  if (!habits) return;
  habits.tasks = habits.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
  await saveHabits(habits);
}

export async function deleteTask(babyId: string, taskId: string): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    await db.collection(COLLECTIONS.TASKS).doc(taskId).remove();
    // 同时删除该任务的所有完成记录
    const res = await db.collection(COLLECTIONS.TASK_COMPLETIONS).where({ taskId }).get();
    for (const c of res.data || []) {
      await db.collection(COLLECTIONS.TASK_COMPLETIONS).doc(c._id).remove();
    }
    return;
  }
  const habits = await loadHabits(babyId);
  if (!habits) return;
  habits.tasks = habits.tasks.filter((t) => t.id !== taskId);
  // 本地模式同样需要清理完成记录，避免今日完成数统计错误
  for (const dateKey of Object.keys(habits.completions)) {
    delete habits.completions[dateKey][taskId];
    if (Object.keys(habits.completions[dateKey]).length === 0) {
      delete habits.completions[dateKey];
    }
  }
  await saveHabits(habits);
}

export async function addCompletion(babyId: string, taskId: string, completion: TaskCompletion): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    const dateKey = getTodayKey();
    await db.collection(COLLECTIONS.TASK_COMPLETIONS).add({
      _id: generateId('completion'),
      babyId,
      taskId,
      date: dateKey,
      completedAt: completion.completedAt,
      completedBy: completion.completedBy,
      note: completion.note,
    });
    return;
  }
  const habits = await loadHabits(babyId);
  if (!habits) return;
  const dateKey = getTodayKey();
  if (!habits.completions[dateKey]) habits.completions[dateKey] = {};
  habits.completions[dateKey][taskId] = completion;
  await saveHabits(habits);
}

export async function removeCompletion(babyId: string, taskId: string, dateKey?: string): Promise<void> {
  const key = dateKey || getTodayKey();
  if (CLOUDBASE_ENABLED && db) {
    const res = await db
      .collection(COLLECTIONS.TASK_COMPLETIONS)
      .where({ babyId, taskId, date: key })
      .get();
    for (const c of res.data || []) {
      await db.collection(COLLECTIONS.TASK_COMPLETIONS).doc(c._id).remove();
    }
    return;
  }
  const habits = await loadHabits(babyId);
  if (!habits || !habits.completions[key]?.[taskId]) return;
  delete habits.completions[key][taskId];
  await saveHabits(habits);
}

export async function updatePlanet(babyId: string, planet: PlanetState): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    const res = await db.collection(COLLECTIONS.PLANET_STATES).where({ babyId }).get();
    if (res.data?.length) {
      await db.collection(COLLECTIONS.PLANET_STATES).doc(res.data[0]._id).update(planet);
    } else {
      await db.collection(COLLECTIONS.PLANET_STATES).add({
        _id: generateId('planet'),
        babyId,
        ...planet,
      });
    }
    return;
  }
  const habits = await loadHabits(babyId);
  if (!habits) return;
  habits.planet = planet;
  await saveHabits(habits);
}

// ===== 心情天气瓶 =====

export async function loadMoods(babyId: string): Promise<Moods | null> {
  if (CLOUDBASE_ENABLED && db) {
    const res = await db.collection(COLLECTIONS.MOODS).where({ babyId }).orderBy('date', 'desc').get();
    const records: MoodRecord[] = (res.data || []).map((d: any) => {
      const { _id, _createTime, _updateTime, ...rest } = d;
      return { ...rest, id: _id } as MoodRecord;
    });
    return {
      babyId,
      records,
      statistics: calcMoodStats(records),
    };
  }
  return readJSON<Moods>(`${STORAGE_KEYS.MOODS}_${babyId}`);
}

export async function saveMoods(moods: Moods): Promise<void> {
  if (!CLOUDBASE_ENABLED) {
    await writeJSON(`${STORAGE_KEYS.MOODS}_${moods.babyId}`, moods);
  }
}

export async function addMoodRecord(babyId: string, record: MoodRecord): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    const { id, ...rest } = record;
    await db.collection(COLLECTIONS.MOODS).add({ _id: id, babyId, ...rest });
    return;
  }
  const moods = (await loadMoods(babyId)) || {
    babyId,
    records: [],
    statistics: { totalRecords: 0, mostFrequent: null, averageMood: 0, weeklyTrend: 'stable', distribution: {} },
  };
  moods.records = [record, ...moods.records];
  moods.statistics = calcMoodStats(moods.records);
  await saveMoods(moods);
}

export async function deleteMoodRecord(babyId: string, moodId: string): Promise<void> {
  if (CLOUDBASE_ENABLED && db) {
    await db.collection(COLLECTIONS.MOODS).doc(moodId).remove();
    return;
  }
  const moods = await loadMoods(babyId);
  if (!moods) return;
  moods.records = moods.records.filter((r) => r.id !== moodId);
  moods.statistics = calcMoodStats(moods.records);
  await saveMoods(moods);
}
