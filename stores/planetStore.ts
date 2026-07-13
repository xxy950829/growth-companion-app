// 成长小星球状态管理
import { create } from 'zustand';
import type { Habits, Task, TaskCompletion, PlanetState, PlanetLevel, CompletionMap } from '@/types';
import { PLANET_LEVELS } from '@/types/planet';
import * as db from '@/services/api-database';
import { generateId, getTodayKey } from '@/utils/helpers';
import { useAuthStore } from './authStore';
import { EVENTS, logEvent } from '@/services/analytics';

interface PlanetStoreState {
  habits: Habits | null;
  loading: boolean;

  load: (babyId: string) => Promise<void>;
  addTask: (babyId: string, data: Omit<Task, 'id' | 'isActive'>) => Promise<void>;
  toggleTask: (babyId: string, taskId: string) => Promise<void>;
  deleteTask: (babyId: string, taskId: string) => Promise<void>;
  completeTask: (babyId: string, taskId: string, completedBy: 'parent' | 'child', note?: string) => Promise<void>;
  uncompleteTask: (babyId: string, taskId: string, dateKey?: string) => Promise<void>;
  isCompletedToday: (taskId: string) => boolean;
  getTodayCompletions: () => TaskCompletion[];
  getPlanetInfo: () => { level: PlanetLevel; exp: number; stars: number; nextLevel: PlanetLevel | null; progress: number };
}

function emptyHabits(babyId: string): Habits {
  return {
    babyId,
    tasks: [],
    completions: {},
    planet: {
      level: 1,
      stars: 0,
      experience: 0,
      achievements: [],
      lastUpdated: Date.now(),
    },
  };
}

function calcLevel(exp: number): number {
  let level = 1;
  for (const l of PLANET_LEVELS) {
    if (exp >= l.minExp) level = l.level;
  }
  return level;
}

export const usePlanetStore = create<PlanetStoreState>((set, get) => ({
  habits: null,
  loading: false,

  load: async (babyId) => {
    set({ loading: true });
    try {
      const habits = (await db.loadHabits(babyId)) || emptyHabits(babyId);
      set({ habits });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (babyId, data) => {
    const task: Task = {
      ...data,
      id: generateId('task'),
      isActive: true,
    };
    const created = await db.addTask(babyId, task);
    const habits = get().habits || emptyHabits(babyId);
    const updated: Habits = { ...habits, babyId, tasks: [...habits.tasks, created] };
    set({ habits: updated });
  },

  toggleTask: async (babyId, taskId) => {
    const habits = get().habits;
    if (!habits) return;
    const task = habits.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newActive = !task.isActive;
    await db.updateTask(babyId, taskId, { isActive: newActive });
    const tasks = habits.tasks.map((t) =>
      t.id === taskId ? { ...t, isActive: newActive } : t
    );
    set({ habits: { ...habits, tasks } });
  },

  deleteTask: async (babyId, taskId) => {
    await db.deleteTask(babyId, taskId);
    const habits = get().habits;
    if (!habits) return;
    const tasks = habits.tasks.filter((t) => t.id !== taskId);
    // 清理已删除任务的所有完成记录，避免今日完成数统计错误
    const completions: CompletionMap = {};
    for (const [dateKey, dayCompletions] of Object.entries(habits.completions)) {
      const { [taskId]: _removed, ...rest } = dayCompletions;
      if (Object.keys(rest).length > 0) {
        completions[dateKey] = rest;
      }
    }
    set({ habits: { ...habits, tasks, completions } });
  },

  completeTask: async (babyId, taskId, completedBy, note) => {
    const habits = get().habits;
    if (!habits) return;
    const task = habits.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const dateKey = getTodayKey();
    if (habits.completions[dateKey]?.[taskId]) return; // 已完成

    const completion: TaskCompletion = {
      taskId,
      completedAt: Date.now(),
      completedBy,
      note,
    };

    // 写入数据库
    await db.addCompletion(babyId, taskId, completion);

    // 更新星球状态
    const newExp = habits.planet.experience + task.points;
    const newStars = habits.planet.stars + 1;
    const oldLevel = habits.planet.level;
    const newLevel = calcLevel(newExp);
    const planet: PlanetState = {
      ...habits.planet,
      experience: newExp,
      stars: newStars,
      level: newLevel,
      lastUpdated: Date.now(),
    };
    await db.updatePlanet(babyId, planet);

    if (newLevel > oldLevel) {
      logEvent(EVENTS.LEVEL_UP, { level: newLevel });
    }

    // 更新本地状态
    const dayCompletions = { ...(habits.completions[dateKey] || {}) };
    dayCompletions[taskId] = completion;
    const updated: Habits = {
      ...habits,
      completions: { ...habits.completions, [dateKey]: dayCompletions },
      planet,
    };
    set({ habits: updated });
    logEvent(EVENTS.COMPLETE_TASK, { taskId, points: task.points });
  },

  uncompleteTask: async (babyId, taskId, dateKey) => {
    const habits = get().habits;
    if (!habits) return;
    const key = dateKey || getTodayKey();
    const dayCompletions = habits.completions[key];
    if (!dayCompletions || !dayCompletions[taskId]) return;
    const task = habits.tasks.find((t) => t.id === taskId);
    if (!task) return;

    await db.removeCompletion(babyId, taskId, key);

    const newExp = Math.max(0, habits.planet.experience - task.points);
    const newStars = Math.max(0, habits.planet.stars - 1);
    const planet: PlanetState = {
      ...habits.planet,
      experience: newExp,
      stars: newStars,
      level: calcLevel(newExp),
      lastUpdated: Date.now(),
    };
    await db.updatePlanet(babyId, planet);

    const newCompletions = { ...dayCompletions };
    delete newCompletions[taskId];
    const updated: Habits = {
      ...habits,
      completions: { ...habits.completions, [key]: newCompletions },
      planet,
    };
    set({ habits: updated });
  },

  isCompletedToday: (taskId) => {
    const habits = get().habits;
    if (!habits) return false;
    const key = getTodayKey();
    return Boolean(habits.completions[key]?.[taskId]);
  },

  getTodayCompletions: () => {
    const habits = get().habits;
    if (!habits) return [];
    const key = getTodayKey();
    return Object.values(habits.completions[key] || {});
  },

  getPlanetInfo: () => {
    const habits = get().habits;
    const exp = habits?.planet.experience || 0;
    const stars = habits?.planet.stars || 0;
    let current = PLANET_LEVELS[0];
    for (const l of PLANET_LEVELS) {
      if (exp >= l.minExp) current = l;
    }
    const nextLevel = PLANET_LEVELS.find((l) => l.minExp > exp) || null;
    const progress = nextLevel
      ? (exp - current.minExp) / (nextLevel.minExp - current.minExp)
      : 1;
    return { level: current, exp, stars, nextLevel, progress };
  },
}));
