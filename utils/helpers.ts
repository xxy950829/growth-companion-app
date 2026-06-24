// 工具函数

// 生成唯一 ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化日期为中文
export function formatDateChinese(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 格式化日期时间
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const date = formatDate(timestamp);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} ${time}`;
}

// 计算年龄（月龄）
export function calcAge(birthday: number): { years: number; months: number; total: number } {
  const birth = new Date(birthday);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (now.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  return { years, months, total: years * 12 + months };
}

// 格式化年龄
export function formatAge(birthday: number): string {
  const { years, months } = calcAge(birthday);
  if (years === 0) return `${months}个月`;
  if (years < 3) return `${years}岁${months}个月`;
  return `${years}岁`;
}

// 获取今天的日期键
export function getTodayKey(): string {
  return formatDate(Date.now());
}

// 相对时间
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDateChinese(timestamp);
}

// 根据经验值获取星球等级
import { PLANET_LEVELS } from '@/types/planet';

export function getPlanetLevel(experience: number) {
  let current = PLANET_LEVELS[0];
  for (const lvl of PLANET_LEVELS) {
    if (experience >= lvl.minExp) current = lvl;
  }
  const nextLevel = PLANET_LEVELS.find((l) => l.minExp > experience);
  return {
    current,
    next: nextLevel || null,
    progress: nextLevel
      ? (experience - current.minExp) / (nextLevel.minExp - current.minExp)
      : 1,
  };
}
