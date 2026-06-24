// CloudBase 初始化配置
// 文档：https://docs.cloudbase.net/api-reference/webv2/adapter/rn-adapter

import cloudbase from '@cloudbase/js-sdk';
import adapter from '@cloudbase/adapter-rn';
import { Alert } from 'react-native';

// CloudBase 环境配置
// 在 CloudBase 控制台创建环境后获取：https://console.cloud.tencent.com/tcb
export const CLOUDBASE_ENV = 'hibiscus-1995-d4g2ysc4s44d440d1';
export const CLOUDBASE_REGION = 'ap-shanghai';
// 匿名访问令牌（Publishable Key，可公开）
export const CLOUDBASE_ACCESS_KEY =''
// 是否启用 CloudBase
export const CLOUDBASE_ENABLED = CLOUDBASE_ENV.length > 0;

// CloudBase 应用实例（启用时初始化）
let app: ReturnType<typeof cloudbase.init> | null = null;
let dbInstance: any = null;
let authInstance: any = null;

if (CLOUDBASE_ENABLED) {
  try {
    // 重要：适配器必须在 init() 之前注册
    cloudbase.useAdapters(adapter);
    app = cloudbase.init({
      env: CLOUDBASE_ENV,
      region: CLOUDBASE_REGION,
      accessKey: CLOUDBASE_ACCESS_KEY,
    });
    dbInstance = app.database();
    authInstance = app.auth({ persistence: 'local' });

    // 注册验证码处理器（RN 环境下无法显示 Web 验证码，用 Alert 替代）
    if (authInstance && typeof authInstance.setCaptchaHandler === 'function') {
      authInstance.setCaptchaHandler(async () => {
        return new Promise<string>((resolve) => {
          Alert.alert(
            '安全验证',
            '请在控制台检查验证码',
            [
              { text: '取消', onPress: () => resolve(''), style: 'cancel' },
              { text: '确定', onPress: () => resolve('1234') },
            ],
            { cancelable: false }
          );
        });
      });
    }
  } catch (e) {
    console.warn('CloudBase 初始化失败，回退到本地模式:', e);
  }
}

export { app, dbInstance as db, authInstance as auth };

// 集合名称
export const COLLECTIONS = {
  USERS: 'users',
  BABIES: 'babies',
  MILESTONES: 'milestones',
  TASKS: 'tasks',
  TASK_COMPLETIONS: 'task_completions',
  PLANET_STATES: 'planet_states',
  MOODS: 'moods',
} as const;
