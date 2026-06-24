// 成长档案状态管理
import { create } from 'zustand';
import type { Archive, Milestone, MilestoneType, GrowthStats } from '@/types';
import * as db from '@/services/database';
import { generateId } from '@/utils/helpers';
import { useAuthStore } from './authStore';

interface ArchiveState {
  archive: Archive | null;
  loading: boolean;
  filterType: MilestoneType | 'all';
  searchKeyword: string;

  load: (babyId: string) => Promise<void>;
  addMilestone: (babyId: string, data: Omit<Milestone, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  deleteMilestone: (babyId: string, milestoneId: string) => Promise<void>;
  setFilterType: (type: MilestoneType | 'all') => void;
  setSearchKeyword: (keyword: string) => void;
  getFilteredMilestones: () => Milestone[];
}

function calcStats(milestones: Milestone[]): GrowthStats {
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

function emptyArchive(babyId: string): Archive {
  return {
    babyId,
    milestones: [],
    stats: {
      totalMilestones: 0,
      milestonesByType: {},
    },
  };
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archive: null,
  loading: false,
  filterType: 'all',
  searchKeyword: '',

  load: async (babyId) => {
    set({ loading: true });
    try {
      const archive = (await db.loadArchive(babyId)) || emptyArchive(babyId);
      set({ archive });
    } finally {
      set({ loading: false });
    }
  },

  addMilestone: async (babyId, data) => {
    const user = useAuthStore.getState().user;
    const milestone: Milestone = {
      ...data,
      id: generateId('milestone'),
      createdBy: user?.uid || 'anonymous',
      createdAt: Date.now(),
    };
    // 写入数据库（CloudBase 或本地）
    await db.addMilestone(babyId, milestone);
    // 更新本地状态
    const archive = get().archive || emptyArchive(babyId);
    const milestones = [milestone, ...archive.milestones];
    const updated: Archive = {
      ...archive,
      babyId,
      milestones,
      stats: calcStats(milestones),
    };
    set({ archive: updated });
  },

  deleteMilestone: async (babyId, milestoneId) => {
    await db.deleteMilestone(babyId, milestoneId);
    const archive = get().archive;
    if (!archive) return;
    const milestones = archive.milestones.filter((m) => m.id !== milestoneId);
    const updated: Archive = {
      ...archive,
      milestones,
      stats: calcStats(milestones),
    };
    set({ archive: updated });
  },

  setFilterType: (type) => set({ filterType: type }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  getFilteredMilestones: () => {
    const { archive, filterType, searchKeyword } = get();
    if (!archive) return [];
    let list = archive.milestones;
    if (filterType !== 'all') {
      list = list.filter((m) => m.type === filterType);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(kw) ||
          (m.description?.toLowerCase().includes(kw) ?? false) ||
          m.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    return list.sort((a, b) => b.date - a.date);
  },
}));
