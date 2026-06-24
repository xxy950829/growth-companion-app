// 分析服务 - 事件记录
// 基于 CloudBase 应用数据，未启用时输出到控制台

import { CLOUDBASE_ENABLED, app, db, COLLECTIONS } from './cloudbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

type EventParams = Record<string, unknown>;

export function logEvent(name: string, params?: EventParams): void {
  if (__DEV__) {
    console.log('[Analytics]', name, params || {});
  }
  if (!CLOUDBASE_ENABLED || !db) return;
  // 异步写入事件集合，不阻塞主流程
  (async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const uid = userJson ? (JSON.parse(userJson) as { uid: string }).uid : null;
      await db.collection('events').add({
        _id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        params: params || {},
        uid,
        createdAt: Date.now(),
      });
    } catch (e) {
      // 静默失败，避免影响主流程
    }
  })();
}

export function setUserProperty(key: string, value: string): void {
  if (__DEV__) {
    console.log('[Analytics setUserProperty]', key, value);
  }
  if (!CLOUDBASE_ENABLED || !app) return;
  (async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (!userJson) return;
      const { uid } = JSON.parse(userJson) as { uid: string };
      await db!.collection(COLLECTIONS.USERS).doc(uid).update({ [key]: value });
    } catch (e) {
      // 静默失败
    }
  })();
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
