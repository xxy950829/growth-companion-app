// 成长档案类型

export type MilestoneType =
  | 'first_steps'
  | 'first_words'
  | 'food'
  | 'height'
  | 'weight'
  | 'vaccine'
  | 'other';

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description?: string;
  date: number; // 时间戳
  mediaUrls: string[];
  tags: string[];
  // 身高体重特有字段
  height?: number; // cm
  weight?: number; // kg
  // 疫苗特有字段
  vaccineName?: string;
  nextVaccineDate?: number;
  createdBy: string;
  createdAt: number;
}

export interface GrowthStats {
  totalMilestones: number;
  firstStepsDate?: number;
  firstWordsDate?: number;
  lastWeight?: number;
  lastHeight?: number;
  milestonesByType: Record<string, number>;
}

export interface Archive {
  babyId: string;
  milestones: Milestone[];
  stats: GrowthStats;
}

// 里程碑类型配置
export const MILESTONE_TYPE_CONFIG: Record<
  MilestoneType,
  { label: string; icon: string; color: string }
> = {
  first_steps: { label: '第一次走路', icon: '👣', color: '#FF8C5A' },
  first_words: { label: '第一次说话', icon: '💬', color: '#7BC9A6' },
  food: { label: '辅食添加', icon: '🍼', color: '#A8D4E6' },
  height: { label: '身高记录', icon: '📏', color: '#FFD93D' },
  weight: { label: '体重记录', icon: '⚖️', color: '#8B5CF6' },
  vaccine: { label: '疫苗接种', icon: '💉', color: '#EF4444' },
  other: { label: '其他时刻', icon: '⭐', color: '#64748B' },
};
