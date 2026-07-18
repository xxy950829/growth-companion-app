import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { PlanetView } from '@/components/planet/PlanetView';
import { TaskItem } from '@/components/planet/TaskItem';
import { TaskForm } from '@/components/planet/TaskForm';
import { useAuthStore } from '@/stores/authStore';
import { usePlanetStore } from '@/stores/planetStore';
import { toast, confirm } from '@/stores/uiStore';
import { COLORS } from '@/utils/constants';
import { PLANET_LEVELS } from '@/types/planet';

export default function PlanetScreen() {
  const { currentBabyId } = useAuthStore();
  const {
    habits,
    load,
    addTask,
    toggleTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    isCompletedToday,
    getTodayCompletions,
    getPlanetInfo,
  } = usePlanetStore();
  const [formVisible, setFormVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBabyId) load(currentBabyId);
    }, [currentBabyId])
  );

  const handleComplete = async (taskId: string) => {
    if (!currentBabyId) return;
    await completeTask(currentBabyId, taskId, 'parent');
    toast.success('任务完成！获得积分和星星 🎉');
  };

  const handleUncomplete = async (taskId: string) => {
    if (!currentBabyId) return;
    await uncompleteTask(currentBabyId, taskId);
  };

  const handleAddTask = async (data: Parameters<typeof addTask>[1]) => {
    if (!currentBabyId) return;
    await addTask(currentBabyId, data);
  };

  const handleToggle = (taskId: string) => {
    if (!currentBabyId) return;
    toggleTask(currentBabyId, taskId);
  };

  const handleDelete = (taskId: string) => {
    if (!currentBabyId) return;
    confirm('确认删除', '确定要删除这个任务吗？', () => deleteTask(currentBabyId, taskId), { danger: true });
  };

  const planetInfo = getPlanetInfo();
  const todayCompletions = getTodayCompletions();
  const activeTasks = habits?.tasks.filter((t) => t.isActive) || [];
  const inactiveTasks = habits?.tasks.filter((t) => !t.isActive) || [];
  const todayProgress = activeTasks.length > 0 ? todayCompletions.length / activeTasks.length : 0;

  return (
    <View style={styles.container}>
      <Header title="成长星球" subtitle="坚持就是力量" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 星球可视化 */}
        <View style={{ paddingHorizontal: 16 }}>
          <PlanetView
            level={planetInfo.level.level}
            experience={planetInfo.exp}
            stars={planetInfo.stars}
          />
        </View>

        {/* 今日进度 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Card style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>今日完成</Text>
              <Text style={styles.todayCount}>
                {todayCompletions.length} / {activeTasks.length}
              </Text>
            </View>
            <View style={styles.todayTrack}>
              <View style={[styles.todayFill, { width: `${todayProgress * 100}%` }]} />
            </View>
            <Text style={styles.todayTip}>
              {todayProgress === 1 && activeTasks.length > 0
                ? '🎉 太棒了！今天的任务都完成啦！'
                : '继续加油，宝宝可以做到的！'}
            </Text>
          </Card>
        </View>

        {/* 等级列表 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>等级之路</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PLANET_LEVELS.map((l) => {
              const reached = planetInfo.exp >= l.minExp;
              const isCurrent = l.level === planetInfo.level.level;
              return (
                <View
                  key={l.level}
                  style={[
                    styles.levelChip,
                    isCurrent && styles.levelChipCurrent,
                    !reached && styles.levelChipLocked,
                  ]}
                >
                  <Text style={styles.levelChipEmoji}>{l.appearance}</Text>
                  <Text style={styles.levelChipName}>Lv.{l.level}</Text>
                  <Text style={styles.levelChipDesc}>{l.name}</Text>
                  <Text style={styles.levelChipExp}>{l.minExp} EXP</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 任务列表 */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日任务</Text>
            <TouchableOpacity onPress={() => setFormVisible(true)}>
              <Text style={styles.addBtn}>+ 添加</Text>
            </TouchableOpacity>
          </View>

          {activeTasks.length === 0 && inactiveTasks.length === 0 ? (
            <Card style={styles.empty}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyText}>还没有任务，点击 + 添加第一个任务吧</Text>
            </Card>
          ) : (
            <>
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  completed={isCompletedToday(task.id)}
                  onComplete={() => handleComplete(task.id)}
                  onUncomplete={() => handleUncomplete(task.id)}
                  onToggle={() => handleToggle(task.id)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
              {inactiveTasks.length > 0 && (
                <Text style={styles.inactiveTitle}>已暂停的任务</Text>
              )}
              {inactiveTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  completed={false}
                  onComplete={() => {}}
                  onUncomplete={() => {}}
                  onToggle={() => handleToggle(task.id)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <TaskForm visible={formVisible} onClose={() => setFormVisible(false)} onSubmit={handleAddTask} />
    </View>
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
  todayCard: {
    padding: 18,
    borderRadius: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  todayTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ink,
  },
  todayCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent2,
  },
  todayTrack: {
    height: 12,
    backgroundColor: COLORS.bg2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  todayFill: {
    height: '100%',
    backgroundColor: COLORS.accent2,
    borderRadius: 6,
  },
  todayTip: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtn: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  levelChip: {
    width: 100,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.rule,
  },
  levelChipCurrent: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  levelChipLocked: {
    opacity: 0.45,
  },
  levelChipEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  levelChipName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  levelChipDesc: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  levelChipExp: {
    fontSize: 10,
    color: COLORS.accent,
    marginTop: 6,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  inactiveTitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
});
