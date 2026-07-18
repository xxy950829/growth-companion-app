// 后端 REST API 客户端 - 基于 axios 封装
// 统一处理鉴权、{ code, data, message } 响应解包与 access token 自动刷新

import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { STORAGE_KEYS } from '@/utils/constants';

// 后端统一响应结构
interface ApiResult<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 标记已重试过的请求，避免刷新后无限循环
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// baseURL 优先读环境变量；开发时 Android 模拟器用 10.0.2.2 访问宿主机，iOS 用 localhost
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${DEV_HOST}:3000/api`;

// ===== token 读写辅助 =====

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// ===== axios 实例 =====

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 Authorization Bearer token
instance.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 刷新锁：并发 401 时只触发一次刷新
let refreshing: Promise<boolean> | null = null;

// 用刷新令牌换取新的访问令牌（用裸 axios，避免触发本实例拦截器递归）
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await axios.post<ApiResult<{ accessToken: string; refreshToken?: string }>>(
      `${BASE_URL}/auth/refresh`,
      { refreshToken }
    );
    const data = res.data?.data;
    if (!data?.accessToken) return false;
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    return true;
  } catch {
    return false;
  }
}

// 清除登录态并跳转登录页
async function handleAuthFailure(): Promise<void> {
  await clearTokens();
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  try {
    router.replace('/(auth)/login');
  } catch (e) {
    console.warn('[api] 跳转登录页失败:', e);
  }
}

// 响应拦截器：统一解包 data + 401 自动刷新重试
instance.interceptors.response.use(
  // 统一返回后端 data 字段
  (response) => response.data?.data,
  async (error: AxiosError<ApiResult>) => {
    const original = error.config as RetryConfig | undefined;
    // 401 且未重试过：尝试刷新令牌后重放原请求
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const ok = await refreshing;
      refreshing = null;
      if (ok) {
        return instance.request(original);
      }
      await handleAuthFailure();
    }
    // 提取后端 message 作为错误信息抛出
    const msg = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

// 类型安全的请求方法（响应拦截器已解包 data，用第二泛型对齐返回类型）
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => instance.get<unknown, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post<unknown, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.put<unknown, T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete<unknown, T>(url, config),
};

export default api;
