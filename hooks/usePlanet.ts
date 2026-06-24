// 成长星球 Hook
import { useEffect } from 'react';
import { usePlanetStore } from '@/stores/planetStore';
import { useAuthStore } from '@/stores/authStore';

export function usePlanet() {
  const store = usePlanetStore();
  const currentBabyId = useAuthStore((s) => s.currentBabyId);

  useEffect(() => {
    if (currentBabyId) {
      store.load(currentBabyId);
    }
  }, [currentBabyId]);

  return {
    habits: store.habits,
    loading: store.loading,
    tasks: store.habits?.tasks || [],
    activeTasks: (store.habits?.tasks || []).filter((t) => t.isActive),
    inactiveTasks: (store.habits?.tasks || []).filter((t) => !t.isActive),
    planet: store.habits?.planet,
    planetInfo: store.getPlanetInfo(),
    todayCompletions: store.getTodayCompletions(),
    addTask: store.addTask,
    toggleTask: store.toggleTask,
    deleteTask: store.deleteTask,
    completeTask: store.completeTask,
    uncompleteTask: store.uncompleteTask,
    isCompletedToday: store.isCompletedToday,
    reload: () => currentBabyId && store.load(currentBabyId),
  };
}
