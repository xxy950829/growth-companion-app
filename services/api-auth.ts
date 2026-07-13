// 认证服务 - 基于后端 REST API（register/login/logout/getCurrentUser/updateProfile）

import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setTokens, clearTokens, getRefreshToken } from './api';
import { STORAGE_KEYS } from '@/utils/constants';
import type { User } from '@/types';

// 登录/注册返回结构（与后端约定：data 内含 user + 令牌）
interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 缓存用户到本地
async function cacheUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// 读取本地缓存的用户
async function getCachedUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// 注册
export async function register(
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<User> {
  const { user, accessToken, refreshToken } = await api.post<AuthResult>(
    '/auth/register',
    { email, password, displayName, phone }
  );
  await setTokens(accessToken, refreshToken);
  await cacheUser(user);
  return user;
}

// 登录
export async function login(email: string, password: string): Promise<User> {
  const { user, accessToken, refreshToken } = await api.post<AuthResult>(
    '/auth/login',
    { email, password }
  );
  await setTokens(accessToken, refreshToken);
  await cacheUser(user);
  return user;
}

// 登出
export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    await api.post<void>('/auth/logout', { refreshToken });
  } catch {
    // 登出接口失败不阻塞本地清理
  }
  await clearTokens();
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

// 获取当前用户：默认读本地缓存，refresh=true 时调 /auth/me 拉取最新
export async function getCurrentUser(refresh = false): Promise<User | null> {
  const cached = await getCachedUser();
  if (!refresh) return cached;
  try {
    const fresh = await api.get<User>('/auth/me');
    await cacheUser(fresh);
    return fresh;
  } catch {
    return cached;
  }
}

// 更新用户资料
export async function updateProfile(updates: Partial<User>): Promise<User> {
  const fresh = await api.put<User>('/auth/me', updates);
  await cacheUser(fresh);
  return fresh;
}
