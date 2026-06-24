// 心情天气瓶 Hook
import { useEffect } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import { useAuthStore } from '@/stores/authStore';

export function useWeather() {
  const store = useWeatherStore();
  const currentBabyId = useAuthStore((s) => s.currentBabyId);

  useEffect(() => {
    if (currentBabyId) {
      store.load(currentBabyId);
    }
  }, [currentBabyId]);

  return {
    moods: store.moods,
    loading: store.loading,
    records: store.moods?.records || [],
    statistics: store.getStatistics(),
    recentRecords: store.getRecentRecords(20),
    latest: store.moods?.records[0] || null,
    addMood: store.addMood,
    deleteMood: store.deleteMood,
    reload: () => currentBabyId && store.load(currentBabyId),
  };
}
