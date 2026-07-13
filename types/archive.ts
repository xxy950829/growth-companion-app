// 成长档案类型

export type MilestoneType =
  | 'first_milestone'
  | 'food'
  | 'measurement'
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
// 注意：first_steps/first_words/height/weight 仅用于兼容历史数据展示，不再作为可选类型
const FIRST_CFG = { label: '宝宝的第一次', icon: '🌟', color: '#FF8C5A' };
const MEASUREMENT_CFG = { label: '身高体重', icon: '📏', color: '#FFD93D' };

export const MILESTONE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  first_milestone: FIRST_CFG,
  food: { label: '辅食添加', icon: '🍼', color: '#A8D4E6' },
  measurement: MEASUREMENT_CFG,
  vaccine: { label: '疫苗接种', icon: '💉', color: '#EF4444' },
  other: { label: '其他时刻', icon: '⭐', color: '#64748B' },
  // 兼容历史数据：旧的 first_steps/first_words 统一按"宝宝的第一次"展示
  first_steps: FIRST_CFG,
  first_words: FIRST_CFG,
  // 兼容历史数据：旧的 height/weight 统一按身高体重展示
  height: MEASUREMENT_CFG,
  weight: MEASUREMENT_CFG,
};

// 可选择的里程碑类型（排除仅用于兼容的历史类型）
export const SELECTABLE_MILESTONE_TYPES: MilestoneType[] = [
  'first_milestone',
  'food',
  'measurement',
  'vaccine',
  'other',
];

// 判断是否为身高体重类记录（含历史数据）
export function isMeasurementType(type: string): boolean {
  return type === 'measurement' || type === 'height' || type === 'weight';
}

// 判断是否为"宝宝的第一次"类记录（含历史数据）
export function isFirstMilestoneType(type: string): boolean {
  return type === 'first_milestone' || type === 'first_steps' || type === 'first_words';
}
