// 认证服务 - 基于 CloudBase
// 文档：https://docs.cloudbase.net/api-reference/webv3/authentication

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId } from '@/utils/helpers';
import { CLOUDBASE_ENABLED, auth, db, COLLECTIONS } from './cloudbase';

// 本地用户存储（CloudBase 未启用时使用）
interface LocalUser extends User {
  password: string;
}

const USERS_KEY = 'gc_local_users';

async function loadLocalUsers(): Promise<LocalUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveLocalUsers(users: LocalUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function stripPassword(u: LocalUser): User {
  const { password: _pw, ...rest } = u;
  return rest;
}

// ===== CloudBase 模式 =====

// 从 CloudBase 文档对象提取 User（剥离内部字段）
function extractUser(doc: any): User | null {
  if (!doc) return null;
  const { _id, _createTime, _updateTime, ...rest } = doc;
  return { ...rest, uid: _id } as User;
}

async function cbRegister(
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<User> {
  if (!auth || !db) throw new Error('CloudBase 未初始化');
  // 1. CloudBase Auth 注册并登录
  await auth.signUpWithEmailAndPassword(email, password);
  await auth.signInWithEmailAndPassword(email, password);
  const cbUser = await auth.getCurrentUser();
  const uid = cbUser?.uid;
  if (!uid) throw new Error('注册后未获取到 uid');
  // 2. 写入 users 集合（_id 使用 auth uid，便于关联查询）
  const now = Date.now();
  const user: User = {
    uid,
    email,
    phone,
    displayName,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection(COLLECTIONS.USERS).add({ ...user, _id: uid });
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

async function cbLogin(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('CloudBase 未初始化');
  await auth.signInWithEmailAndPassword(email, password);
  const cbUser = await auth.getCurrentUser();
  const uid = cbUser?.uid;
  if (!uid) throw new Error('登录后未获取到 uid');
  // 从 users 集合读取用户信息（doc().get() 返回单个文档对象）
  const res = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const user = extractUser(res.data);
  if (!user) throw new Error('用户档案不存在');
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

async function cbLogout(): Promise<void> {
  if (!auth) return;
  await auth.signOut();
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

async function cbGetCurrentUser(): Promise<User | null> {
  if (!auth || !db) return null;
  const cbUser = await auth.getCurrentUser();
  if (!cbUser?.uid) return null;
  const res = await db.collection(COLLECTIONS.USERS).doc(cbUser.uid).get();
  return extractUser(res.data);
}

// ===== 本地模式（CloudBase 未启用时的回退） =====

async function localRegister(
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<User> {
  const users = await loadLocalUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('该邮箱已注册');
  }
  const now = Date.now();
  const user: LocalUser = {
    uid: generateId('user'),
    email,
    password,
    displayName,
    phone,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  await saveLocalUsers(users);
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return stripPassword(user);
}

async function localLogin(email: string, password: string): Promise<User> {
  const users = await loadLocalUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('用户不存在');
  if (user.password !== password) throw new Error('密码错误');
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return stripPassword(user);
}

// ===== 统一接口 =====

export async function register(
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<User> {
  return CLOUDBASE_ENABLED
    ? cbRegister(email, password, displayName, phone)
    : localRegister(email, password, displayName, phone);
}

export async function login(email: string, password: string): Promise<User> {
  return CLOUDBASE_ENABLED ? cbLogin(email, password) : localLogin(email, password);
}

export async function logout(): Promise<void> {
  if (CLOUDBASE_ENABLED) {
    return cbLogout();
  }
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw) as User;
    // CloudBase 模式下尝试刷新最新数据
    if (CLOUDBASE_ENABLED) {
      const fresh = await cbGetCurrentUser();
      if (fresh) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fresh));
        return fresh;
      }
    }
    return cached;
  } catch {
    return null;
  }
}

export async function updateProfile(updates: Partial<User>): Promise<User | null> {
  const current = await getCurrentUser();
  if (!current) return null;

  if (CLOUDBASE_ENABLED && db) {
    const updated = { ...updates, updatedAt: Date.now() };
    await db.collection(COLLECTIONS.USERS).doc(current.uid).update(updated);
    const fresh = { ...current, ...updated } as User;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fresh));
    return fresh;
  }

  // 本地模式
  const users = await loadLocalUsers();
  const idx = users.findIndex((u) => u.uid === current.uid);
  if (idx < 0) return null;
  const updated = { ...users[idx], ...updates, updatedAt: Date.now() };
  users[idx] = updated;
  await saveLocalUsers(users);
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  return stripPassword(updated);
}
