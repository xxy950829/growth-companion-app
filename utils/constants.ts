// 应用常量

// 主题色（与方案文档保持一致的童伴星球风格）
export const COLORS = {
  bg: '#FFF8F3',
  bg2: '#FFF0E6',
  ink: '#4A3728',
  muted: '#8B7355',
  rule: '#E8D5C4',
  accent: '#FF8C5A',
  accent2: '#7BC9A6',
  accent3: '#A8D4E6',
  cardBg: '#FFFFFF',
  shadow: 'rgba(74, 55, 40, 0.08)',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

// 存储键
export const STORAGE_KEYS = {
  USER: 'gc_user',
  BABIES: 'gc_babies',
  ARCHIVE: 'gc_archive', // gc_archive_{babyId}
  HABITS: 'gc_habits', // gc_habits_{babyId}
  MOODS: 'gc_moods', // gc_moods_{babyId}
  CURRENT_BABY: 'gc_current_baby',
} as const;

// 默认宝宝头像
export const DEFAULT_BABY_AVATAR = '👶';

// 性别配置
export const GENDER_CONFIG = {
  male: { label: '男宝宝', icon: '👦', color: '#A8D4E6' },
  female: { label: '女宝宝', icon: '👧', color: '#FF8C5A' },
  unknown: { label: '保密', icon: '👶', color: '#8B7355' },
} as const;
