// 成长小星球类型

export interface Task {
  id: string;
  name: string;
  icon: string;
  schedule: string[]; // ["08:00", "12:00", "18:00"]
  points: number;
  isActive: boolean;
}

export interface TaskCompletion {
  taskId: string;
  completedAt: number;
  completedBy: 'parent' | 'child';
  note?: string;
  dateKey?: string; // YYYYMMDD，后端返回时携带，用于按日期分组
}

// 按日期组织的完成记录
export type CompletionMap = Record<string, Record<string, TaskCompletion>>; // { "2024-01-15": { task_001: {...} } }

export interface PlanetState {
  level: number;
  stars: number;
  experience: number;
  achievements: string[];
  lastUpdated: number;
}

export interface Habits {
  babyId: string;
  tasks: Task[];
  completions: CompletionMap;
  planet: PlanetState;
}

// 星球等级配置
export interface PlanetLevel {
  level: number;
  name: string;
  minExp: number;
  appearance: string;
  reward: string;
}

export const PLANET_LEVELS: readonly PlanetLevel[] = [
  { level: 1, name: '种子', minExp: 0, appearance: '🌱', reward: '解锁基础任务' },
  { level: 2, name: '幼苗', minExp: 100, appearance: '🌿', reward: '解锁自定义任务' },
  { level: 3, name: '小树', minExp: 300, appearance: '🌳', reward: '解锁新背景' },
  { level: 4, name: '大树', minExp: 600, appearance: '🌲', reward: '解锁宠物伙伴' },
  { level: 5, name: '星球', minExp: 1000, appearance: '🪐', reward: '解锁星球装饰' },
];

// 任务图标预设
export const TASK_ICONS = [
  { name: '喝奶', icon: '🍼' },
  { name: '吃饭', icon: '🍚' },
  { name: '刷牙', icon: '🪥' },
  { name: '睡觉', icon: '😴' },
  { name: '读书', icon: '📖' },
  { name: '运动', icon: '⚽' },
  { name: '洗手', icon: '🧼' },
  { name: '收拾', icon: '🧹' },
] as const;
