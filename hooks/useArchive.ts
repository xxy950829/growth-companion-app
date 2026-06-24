// 成长档案 Hook
import { useEffect } from 'react';
import { useArchiveStore } from '@/stores/archiveStore';
import { useAuthStore } from '@/stores/authStore';

export function useArchive() {
  const store = useArchiveStore();
  const currentBabyId = useAuthStore((s) => s.currentBabyId);

  useEffect(() => {
    if (currentBabyId) {
      store.load(currentBabyId);
    }
  }, [currentBabyId]);

  return {
    archive: store.archive,
    loading: store.loading,
    filterType: store.filterType,
    searchKeyword: store.searchKeyword,
    filteredMilestones: store.getFilteredMilestones(),
    stats: store.archive?.stats,
    addMilestone: store.addMilestone,
    deleteMilestone: store.deleteMilestone,
    setFilterType: store.setFilterType,
    setSearchKeyword: store.setSearchKeyword,
    reload: () => currentBabyId && store.load(currentBabyId),
  };
}
