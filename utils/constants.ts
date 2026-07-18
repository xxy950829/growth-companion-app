// 应用常量

// 完整设计色板（与 UI 重设计方案一致：赤陶珊瑚 / 鼠尾草绿 / 蜂蜜金 / 砂石暖白）
export const PALETTE = {
  brand: {
    50: '#FDF2EE',
    100: '#FAE2D9',
    200: '#F4C3B2',
    300: '#ECA086',
    400: '#E28260',
    500: '#D4725C',
    600: '#BF5A44',
    700: '#9E4534',
    800: '#7E372A',
    900: '#5C2820',
  },
  sage: {
    50: '#F1F4EF',
    100: '#DDE6D7',
    200: '#BDCEB3',
    300: '#9AB38D',
    400: '#7D9A70',
    500: '#68835B',
    600: '#526948',
  },
  sand: {
    50: '#FBF8F3',
    100: '#F5EFE6',
    200: '#EDE3D3',
    300: '#E0D1BB',
    400: '#D0BA9E',
    500: '#B89F7E',
  },
  honey: {
    400: '#E8B84B',
    500: '#D9A238',
  },
  bg: {
    50: '#FDFBF8',
    100: '#FAF6F1',
    200: '#F5EEE5',
    300: '#EBE2D6',
    400: '#D9CDBD',
    500: '#B8A994',
  },
  text: {
    300: '#C4B8A5',
    400: '#9A8B76',
    500: '#6E6050',
    600: '#4D4238',
    700: '#3A3029',
    800: '#2D2420',
    900: '#1C1613',
  },
  state: {
    success: '#6A9B5E',
    successSurface: '#EDF3EA',
    warning: '#D9A238',
    warningSurface: '#FBF3E2',
    error: '#C4533F',
    errorSurface: '#F9ECE8',
    info: '#B89F7E',
    infoSurface: '#F5EFE6',
  },
} as const;

// 主题色（向后兼容别名，指向新色板）
export const COLORS = {
  // 主背景与表面
  bg: PALETTE.bg[50], // 屏幕主背景 #FDFBF8
  bg2: PALETTE.bg[200], // 次级表面 #F5EEE5
  rule: PALETTE.bg[300], // 分割线 #EBE2D6
  cardBg: '#FFFFFF',
  // 文字
  ink: PALETTE.text[800], // 主文字 #2D2420
  muted: PALETTE.text[400], // 次级文字 #9A8B76
  // 主色调
  accent: PALETTE.brand[500], // 赤陶珊瑚 #D4725C
  accent2: PALETTE.sage[500], // 鼠尾草绿 #68835B
  accent3: PALETTE.honey[500], // 蜂蜜金 #D9A238
  // 阴影与状态
  shadow: 'rgba(45, 36, 32, 0.05)',
  success: PALETTE.state.success,
  warning: PALETTE.state.warning,
  danger: PALETTE.state.error,
} as const;

// 存储键
export const STORAGE_KEYS = {
  USER: 'gc_user',
  BABIES: 'gc_babies',
  ARCHIVE: 'gc_archive', // gc_archive_{babyId}
  HABITS: 'gc_habits', // gc_habits_{babyId}
  MOODS: 'gc_moods', // gc_moods_{babyId}
  CURRENT_BABY: 'gc_current_baby',
  ACCESS_TOKEN: 'gc_access_token', // 后端 API 访问令牌
  REFRESH_TOKEN: 'gc_refresh_token', // 后端 API 刷新令牌
} as const;

// 默认宝宝头像
export const DEFAULT_BABY_AVATAR = '👶';

// 性别配置（颜色与设计稿一致）
export const GENDER_CONFIG = {
  male: { label: '男宝', icon: '👦', color: PALETTE.sage[500] },
  female: { label: '女宝', icon: '👧', color: PALETTE.brand[500] },
  unknown: { label: '保密', icon: '👶', color: PALETTE.sand[500] },
} as const;

// 圆角半径
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
