// 认证状态管理
import { create } from 'zustand';
import type { User, Baby } from '@/types';
import * as authService from '@/services/auth';
import * as db from '@/services/database';
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
    const baby: Baby = {
      ...data,
      id: generateId('baby'),
      createdAt: Date.now(),
    };
    await db.addBaby(baby);
    await db.setCurrentBaby(baby.id);
    const babies = await db.loadBabies();
    set({ babies, currentBabyId: baby.id });
    return baby;
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
