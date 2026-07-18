// 分析服务 - 事件记录
// 上报到后端 /api/analytics，未登录时静默跳过

import api from './api';

type EventParams = Record<string, unknown>;

// 上报单个事件（异步，不阻塞主流程）
export function logEvent(name: string, params?: EventParams): void {
  if (__DEV__) {
    console.log('[Analytics]', name, params || {});
  }
  // 异步上报，不等待结果
  api.post('/analytics/event', { eventName: name, eventData: params }).catch(() => {
    // 静默失败，避免影响主流程
  });
}

// 设置用户属性（更新到用户资料）
export function setUserProperty(key: string, value: string): void {
  if (__DEV__) {
    console.log('[Analytics setUserProperty]', key, value);
  }
  api.put('/auth/me', { [key]: value }).catch(() => {
    // 静默失败
  });
}

// 预定义事件
export const EVENTS = {
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  CREATE_MILESTONE: 'create_milestone',
  COMPLETE_TASK: 'complete_task',
  RECORD_MOOD: 'record_mood',
  LEVEL_UP: 'level_up',
} as const;
