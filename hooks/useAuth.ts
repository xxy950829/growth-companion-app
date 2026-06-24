// 认证 Hook - 封装常用认证操作
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.user) {
      store.init();
    }
  }, []);

  return {
    user: store.user,
    babies: store.babies,
    currentBabyId: store.currentBabyId,
    currentBaby: store.babies.find((b) => b.id === store.currentBabyId) || null,
    loading: store.loading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    createBaby: store.createBaby,
    switchBaby: store.switchBaby,
    clearError: store.clearError,
  };
}
