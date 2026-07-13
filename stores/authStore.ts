// 认证状态管理
import { create } from 'zustand';
import type { User, Baby } from '@/types';
import * as authService from '@/services/api-auth';
import * as db from '@/services/api-database';
import { generateId } from '@/utils/helpers';

interface AuthState {
  user: User | null;
  babies: Baby[];
  currentBabyId: string | null;
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  register: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  createBaby: (data: Omit<Baby, 'id' | 'createdAt'>) => Promise<Baby>;
  updateBaby: (babyId: string, data: Partial<Omit<Baby, 'id' | 'createdAt'>>) => Promise<void>;
  switchBaby: (babyId: string) => Promise<void>;
  refreshBabies: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  babies: [],
  currentBabyId: null,
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const babies = await db.loadBabies();
        let currentBabyId = await db.getCurrentBabyId();
        if (!currentBabyId && babies.length > 0) {
          currentBabyId = babies[0].id;
          await db.setCurrentBaby(currentBabyId);
        }
        set({ user, babies, currentBabyId });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, displayName, phone) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.register(email, password, displayName, phone);
      set({ user });
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.login(email, password);
      const babies = await db.loadBabies();
      let currentBabyId = await db.getCurrentBabyId();
      if (!currentBabyId && babies.length > 0) {
        currentBabyId = babies[0].id;
        await db.setCurrentBaby(currentBabyId);
      }
      set({ user, babies, currentBabyId });
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, babies: [], currentBabyId: null });
  },

  createBaby: async (data) => {
    // 后端生成 id，前端只传数据
    const baby: Baby = {
      ...data,
      id: generateId('baby'), // 临时 id，addBaby 会返回后端生成的真实数据
      createdAt: Date.now(),
    };
    const created = await db.addBaby(baby);
    await db.setCurrentBaby(created.id);
    const babies = [...get().babies, created];
    set({ babies, currentBabyId: created.id });
    return created;
  },

  updateBaby: async (babyId, data) => {
    await db.updateBaby(babyId, data);
    const babies = await db.loadBabies();
    set({ babies });
  },

  switchBaby: async (babyId) => {
    await db.setCurrentBaby(babyId);
    set({ currentBabyId: babyId });
  },

  refreshBabies: async () => {
    const babies = await db.loadBabies();
    set({ babies });
  },

  clearError: () => set({ error: null }),
}));
