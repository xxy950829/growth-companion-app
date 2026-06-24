// 心情天气瓶类型

export type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'thunderstorm'
  | 'rainbow';

export type Temperature = 'warm' | 'cool' | 'hot' | 'cold';

export interface MoodRecord {
  id: string;
  weather: WeatherType;
  temperature: Temperature;
  note?: string;
  drawingUrl?: string;
  audioUrl?: string;
  date: number;
  createdBy: 'parent' | 'child';
  createdAt: number;
}

export interface MoodStatistics {
  totalRecords: number;
  mostFrequent: WeatherType | null;
  averageMood: number; // 1-5
  weeklyTrend: 'improving' | 'stable' | 'declining';
  distribution: Record<string, number>;
}

export interface Moods {
  babyId: string;
  records: MoodRecord[];
  statistics: MoodStatistics;
}

// 天气类型配置
export const WEATHER_CONFIG: Record<
  WeatherType,
  { label: string; icon: string; color: string; mood: string; description: string; score: number }
> = {
  sunny: {
    label: '晴天',
    icon: '☀️',
    color: '#FFD93D',
    mood: '开心',
    description: '今天心情很好，很开心',
    score: 5,
  },
  cloudy: {
    label: '多云',
    icon: '⛅',
    color: '#A8D4E6',
    mood: '平静',
    description: '今天心情一般，比较平静',
    score: 4,
  },
  rainy: {
    label: '小雨',
    icon: '🌧️',
    color: '#7BC9A6',
    mood: '有点难过',
    description: '今天有点不开心',
    score: 2,
  },
  thunderstorm: {
    label: '雷阵雨',
    icon: '⛈️',
    color: '#8B5CF6',
    mood: '烦躁',
    description: '今天很烦躁，发脾气了',
    score: 1,
  },
  rainbow: {
    label: '彩虹',
    icon: '🌈',
    color: '#FF8C5A',
    mood: '好转',
    description: '虽然不开心，但已经好多了',
    score: 3,
  },
};

export const TEMPERATURE_CONFIG: Record<
  Temperature,
  { label: string; icon: string }
> = {
  warm: { label: '温暖', icon: '🌡️' },
  cool: { label: '凉爽', icon: '🍃' },
  hot: { label: '炎热', icon: '🔥' },
  cold: { label: '寒冷', icon: '❄️' },
};
