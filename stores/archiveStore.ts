// 成长档案状态管理
import { create } from 'zustand';
import type { Archive, Milestone, MilestoneType, GrowthStats } from '@/types';
import { isMeasurementType, isFirstMilestoneType } from '@/types/archive';
import * as db from '@/services/api-database';
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
    // 基于字段统计最新身高体重（取第一条有值的，milestones 按 date 降序），兼容历史 height/weight 类型
    if (stats.lastHeight == null && m.height != null) stats.lastHeight = m.height;
    if (stats.lastWeight == null && m.weight != null) stats.lastWeight = m.weight;
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
      // 确保按日期倒序排列（最新的在最前面）
      archive.milestones = [...archive.milestones].sort((a, b) => b.date - a.date);
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
    // 后端创建并返回真实数据（含后端生成的 id）
    const created = await db.addMilestone(babyId, milestone);
    // 更新本地状态
    const archive = get().archive || emptyArchive(babyId);
    const milestones = [created, ...archive.milestones];
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
      // 筛选身高体重时，同时匹配历史 height/weight 类型数据
      // 筛选"宝宝的第一次"时，同时匹配历史 first_steps/first_words 类型数据
      list = list.filter((m) =>
        filterType === 'measurement'
          ? isMeasurementType(m.type)
          : filterType === 'first_milestone'
            ? isFirstMilestoneType(m.type)
            : m.type === filterType
      );
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
