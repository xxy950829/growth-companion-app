import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Timeline } from '@/components/archive/Timeline';
import { MilestoneForm } from '@/components/archive/MilestoneForm';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { COLORS } from '@/utils/constants';
import { MILESTONE_TYPE_CONFIG } from '@/types/archive';
import type { MilestoneType } from '@/types';
import { EVENTS, logEvent } from '@/services/analytics';

export default function ArchiveScreen() {
  const { currentBabyId } = useAuthStore();
  const { archive, load, addMilestone, deleteMilestone, filterType, setFilterType, searchKeyword, setSearchKeyword, getFilteredMilestones } = useArchiveStore();
  const [formVisible, setFormVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBabyId) load(currentBabyId);
    }, [currentBabyId])
  );

  const handleAdd = async (data: Parameters<typeof addMilestone>[1]) => {
    if (!currentBabyId) return;
    await addMilestone(currentBabyId, data);
    logEvent(EVENTS.CREATE_MILESTONE, { type: data.type });
  };

  const handleDelete = (id: string) => {
    if (!currentBabyId) return;
    deleteMilestone(currentBabyId, id);
  };

  const stats = archive?.stats;
  const filtered = getFilteredMilestones();

  return (
    <View style={styles.container}>
      <Header title="成长档案" subtitle="记录每一刻成长" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 统计卡片 */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: COLORS.accent + '15' }]}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statValue}>{stats?.totalMilestones || 0}</Text>
            <Text style={styles.statLabel}>总记录</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: COLORS.accent2 + '15' }]}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={styles.statValue}>{stats?.lastHeight ? `${stats.lastHeight}` : '-'}</Text>
            <Text style={styles.statLabel}>身高(cm)</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: COLORS.accent3 + '30' }]}>
            <Text style={styles.statIcon}>⚖️</Text>
            <Text style={styles.statValue}>{stats?.lastWeight ? `${stats.lastWeight}` : '-'}</Text>
            <Text style={styles.statLabel}>体重(kg)</Text>
          </Card>
        </View>

        {/* 搜索框 */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.search}
            placeholder="🔍 搜索标题、描述或标签..."
            placeholderTextColor={COLORS.muted}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        </View>

        {/* 类型筛选 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 16 }}>
          <FilterChip label="全部" active={filterType === 'all'} onPress={() => setFilterType('all')} />
          {(Object.keys(MILESTONE_TYPE_CONFIG) as MilestoneType[]).map((t) => (
            <FilterChip
              key={t}
              label={`${MILESTONE_TYPE_CONFIG[t].icon} ${MILESTONE_TYPE_CONFIG[t].label}`}
              active={filterType === t}
              onPress={() => setFilterType(t)}
            />
          ))}
        </ScrollView>

        {/* 时间轴 */}
        <View style={{ flex: 1, minHeight: 400 }}>
          <Timeline milestones={filtered} onDelete={handleDelete} />
        </View>
      </ScrollView>

      {/* 浮动添加按钮 */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setFormVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <MilestoneForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleAdd}
      />
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
      ]}
    >
      <Text style={[styles.chipText, active && { color: '#FFFFFF' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  search: {
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.rule,
  },
  filterRow: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.rule,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.ink,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
