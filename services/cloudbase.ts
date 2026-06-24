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
export const CLOUDBASE_ACCESS_KEY =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2hpYmlzY3VzLTE5OTUtZDRnMnlzYzRzNDRkNDQwZDEuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW91ZGFwaS5jb20iLCJzdWIiOiJhbm9ueW1vdXMiLCJhdWQiOiJoaWJpc2N1cy0xOTk1LWQ0ZzJ5c2M0czQ0ZDQ0MGQxIiwiZXhwIjo0MDg1NDMyMjkyLCJpYXQiOjE3ODE3NDkwOTIsIm5vbmNlIjoiVGdhbE52LXpKS1NLYWU5U3ZXM0tRIiwiYXRfaGFzaCI6IlRnYWxOdi16U0pTS1llYzlTdlczS1EiLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoiaGliaXNjdXMtMTk5NS1kNGcyeXNjNHM0NGQ0NDBkMSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.p_qiVpIwjky9lkRacjuFFkQsrX7Yk6qjmP-QjWZ37VBQtwBt2VNng-6wjumvOBLyeRhjEPOR46zGV-NYZbSZfrcmi-trXSFV__x9p-RBArKMXBHcGHx9bGKBE35aqcH-5sR9zvvzXxJgzBoXdUnjinNh4hBS6OYBWqhEZGqrRrj7Q15Th0LnsGLp-2AmqCUimzIXKXmRPZjPEsXF5tqk3hCyTbV0yACCPmHRWP3-6kyvb9mMeV9ndzwm_e6t3-89h1ssbFjBDKykkI71sRMUkEqbdp5OKF7_afMUQJscSmoHHo_40OlRF7Cg6k5n0Md-xnOFMORQY4-FqIihv6nlCw';

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
