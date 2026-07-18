import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Svg, Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { GradientBg } from '@/components/ui/Decor';
import { TaskItem } from '@/components/planet/TaskItem';
import { TaskForm } from '@/components/planet/TaskForm';
import { useAuthStore } from '@/stores/authStore';
import { usePlanetStore } from '@/stores/planetStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { toast, confirm } from '@/stores/uiStore';
import { COLORS, PALETTE } from '@/utils/constants';
import { PLANET_LEVELS } from '@/types/planet';
import type { Milestone } from '@/types';
import { formatDate } from '@/utils/helpers';

// 年龄筛选标签
const AGE_TABS = ['0-3月', '4-6月', '7-12月', '1岁+', '全部'] as const;
type AgeTab = typeof AGE_TABS[number];

// 星座节点：里程碑映射为画布上的星点
interface StarNode {
  x: number;
  y: number;
  label: string;
  dateLabel: string;
  size: number;
  color: string;
  dim?: boolean;
}

// 将里程碑序列化为星座节点（出生为起点，按时间分布）
function buildConstellation(milestones: Milestone[], babyBirthday?: number): StarNode[] {
  const canvasW = 330;
  const canvasH = 380;
  const startX = 60;
  const startY = 320;
  const endX = 280;
  const endY = 80;

  const now = Date.now();
  const start = babyBirthday || now - 365 * 86400000;
  const span = Math.max(now - start, 30 * 86400000);

  // 取最近 6 条里程碑作为可视化星点（避免过密）
  const sorted = [...milestones].sort((a, b) => a.date - b.date).slice(-6);
  const nodes: StarNode[] = [];

  // 出生节点
  nodes.push({
    x: startX,
    y: startY,
    label: '出生',
    dateLabel: babyBirthday ? formatDate(babyBirthday).slice(5) : '',
    size: 10,
    color: PALETTE.brand[500],
  });

  sorted.forEach((m, i) => {
    const t = Math.min(1, Math.max(0, (m.date - start) / span));
    // 主对角线分布 + 交替偏移
    const baseX = startX + t * (endX - startX);
    const baseY = startY - t * (startY - endY);
    const wobble = (i % 2 === 0 ? -1 : 1) * 25;
    nodes.push({
      x: Math.max(40, Math.min(canvasW - 40, baseX + wobble * 0.5)),
      y: Math.max(50, Math.min(canvasH - 40, baseY + (i % 3 === 0 ? -15 : 10))),
      label: m.title.length > 5 ? m.title.slice(0, 4) + '…' : m.title,
      dateLabel: formatDate(m.date).slice(5),
      size: 8,
      color: PALETTE.honey[500],
    });
  });

  // 未来的小星点（装饰）
  if (nodes.length < 5) {
    nodes.push({
      x: endX,
      y: endY,
      label: '未来',
      dateLabel: '',
      size: 6,
      color: PALETTE.sage[500],
      dim: true,
    });
  }

  return nodes;
}

export default function PlanetScreen() {
  const { currentBabyId, babies } = useAuthStore();
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
  const archive = useArchiveStore((s) => s.archive);
  const [formVisible, setFormVisible] = useState(false);
  const [ageTab, setAgeTab] = useState<AgeTab>('全部');

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
  const currentBaby = babies.find((b) => b.id === currentBabyId);
  const milestoneCount = archive?.stats.totalMilestones || 0;
  const constellationNodes = buildConstellation(archive?.milestones || [], currentBaby?.birthday);

  return (
    <View style={styles.container}>
      <Header
        title="成长星球"
        subtitle="探索宝宝的成长宇宙"
        right={
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="filter" size={18} color={PALETTE.text[600]} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 年龄筛选 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }} style={{ marginBottom: 16 }}>
          {AGE_TABS.map((tab) => {
            const active = ageTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setAgeTab(tab)}
                style={[styles.ageTab, active && styles.ageTabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.ageTabText, active && styles.ageTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 星座地图 */}
        <View style={styles.section}>
          <GradientBg colors={['#FFFFFF', PALETTE.sand[50]]} style={styles.constellationCard}>
            <ConstellationSvg nodes={constellationNodes} />
            {/* 装饰小星 */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PALETTE.brand[500] }]} />
                <Text style={styles.legendText}>出生</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PALETTE.honey[500] }]} />
                <Text style={styles.legendText}>已记录</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PALETTE.sage[500] }]} />
                <Text style={styles.legendText}>待解锁</Text>
              </View>
            </View>
          </GradientBg>
        </View>

        {/* 里程碑统计 */}
        <View style={[styles.section, { flexDirection: 'row', gap: 10 }]}>
          <StatPill bg={PALETTE.brand[50]} value={String(milestoneCount)} label="已达成" valueColor={PALETTE.brand[600]} />
          <StatPill bg={PALETTE.state.warningSurface} value={String(activeTasks.length)} label="进行中" valueColor={PALETTE.honey[500]} />
          <StatPill bg={PALETTE.bg[100]} value="∞" label="待解锁" valueColor={PALETTE.text[500]} />
        </View>

        {/* 今日完成进度 */}
        <View style={styles.section}>
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

        {/* 今日任务 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日任务</Text>
            <TouchableOpacity onPress={() => setFormVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.addBtn}>
                <Icon name="plus" size={14} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addBtnText}>添加</Text>
              </View>
            </TouchableOpacity>
          </View>

          {activeTasks.length === 0 && inactiveTasks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>还没有任务，点击 + 添加第一个任务吧</Text>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
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
              {inactiveTasks.length > 0 ? (
                <Text style={styles.inactiveTitle}>已暂停的任务</Text>
              ) : null}
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
            </View>
          )}
        </View>

        {/* 等级之路 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>等级之路</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
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
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setFormVisible(true)}
      >
        <Icon name="plus" size={26} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <TaskForm visible={formVisible} onClose={() => setFormVisible(false)} onSubmit={handleAddTask} />
    </View>
  );
}

// 星座图 SVG
function ConstellationSvg({ nodes }: { nodes: StarNode[] }) {
  const canvasW = 330;
  const canvasH = 380;
  return (
    <View style={styles.constellationWrap}>
      <Svg width="100%" height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`} fill="none">
        {/* 背景小亮点 */}
        <G>
          <Circle cx="40" cy="60" r="1.5" fill={PALETTE.sand[400]} opacity="0.5" />
          <Circle cx="300" cy="50" r="1" fill={PALETTE.sand[400]} opacity="0.4" />
          <Circle cx="20" cy="200" r="1.2" fill={PALETTE.sand[400]} opacity="0.5" />
          <Circle cx="310" cy="280" r="1.5" fill={PALETTE.sand[400]} opacity="0.4" />
          <Circle cx="80" cy="40" r="1" fill={PALETTE.sand[400]} opacity="0.3" />
          <Circle cx="280" cy="330" r="1.2" fill={PALETTE.sand[400]} opacity="0.5" />
        </G>
        {/* 连线 */}
        {nodes.length > 1 &&
          nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1];
            const midX = (n.x + next.x) / 2;
            const midY = (n.y + next.y) / 2 - 20;
            return (
              <Path
                key={`line-${i}`}
                d={`M${n.x} ${n.y} Q${midX} ${midY} ${next.x} ${next.y}`}
                stroke={PALETTE.sand[300]}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                fill="none"
                opacity={next.dim ? 0.4 : 0.7}
              />
            );
          })}
        {/* 节点 */}
        {nodes.map((n, i) => (
          <G key={`node-${i}`} transform={`translate(${n.x}, ${n.y})`} opacity={n.dim ? 0.4 : 1}>
            <Circle r={n.size + 8} fill={n.color} opacity="0.15" />
            <Circle r={n.size + 4} fill={n.color} opacity="0.3" />
            <Circle r={n.size} fill={n.color} />
            {/* 标签 */}
            {i === 0 ? (
              <>
                <SvgText y="28" textAnchor="middle" fontSize="10" fill={PALETTE.text[500]} fontWeight="500">
                  {n.label}
                </SvgText>
                {n.dateLabel ? (
                  <SvgText y="40" textAnchor="middle" fontSize="9" fill={PALETTE.text[400]}>
                    {n.dateLabel}
                  </SvgText>
                ) : null}
              </>
            ) : n.dim ? (
              <SvgText y="22" textAnchor="middle" fontSize="9" fill={PALETTE.text[400]}>
                {n.label}
              </SvgText>
            ) : (
              <>
                <SvgText y="-14" textAnchor="middle" fontSize="10" fill={PALETTE.text[600]} fontWeight="600">
                  {n.label}
                </SvgText>
                {n.dateLabel ? (
                  <SvgText y="-2" textAnchor="middle" fontSize="9" fill={PALETTE.text[400]}>
                    {n.dateLabel}
                  </SvgText>
                ) : null}
              </>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}

// 统计胶囊
function StatPill({ bg, value, label, valueColor }: { bg: string; value: string; label: string; valueColor: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: bg }]}>
      <Text style={[styles.statPillValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: PALETTE.text[700],
    marginBottom: 12,
  },
  // 右上角筛选圆钮
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  // 年龄标签
  ageTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
  },
  ageTabActive: {
    backgroundColor: PALETTE.brand[500],
    borderColor: PALETTE.brand[500],
  },
  ageTabText: {
    fontSize: 13,
    color: PALETTE.text[700],
    fontWeight: '500',
  },
  ageTabTextActive: {
    color: '#FFFFFF',
  },
  // 星座卡
  constellationCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  constellationWrap: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: PALETTE.text[400],
  },
  // 统计胶囊
  statPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statPillValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statPillLabel: {
    fontSize: 11,
    color: PALETTE.text[400],
    marginTop: 2,
  },
  // 今日完成卡
  todayCard: {
    padding: 18,
    borderRadius: 16,
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
    color: PALETTE.text[700],
  },
  todayCount: {
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.sage[500],
  },
  todayTrack: {
    height: 12,
    backgroundColor: PALETTE.bg[200],
    borderRadius: 6,
    overflow: 'hidden',
  },
  todayFill: {
    height: '100%',
    backgroundColor: PALETTE.sage[500],
    borderRadius: 6,
  },
  todayTip: {
    fontSize: 12,
    color: PALETTE.text[400],
    marginTop: 10,
  },
  // 添加按钮
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: PALETTE.brand[500],
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // 等级胶囊
  levelChip: {
    width: 100,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.rule,
  },
  levelChipCurrent: {
    borderColor: PALETTE.brand[500],
    backgroundColor: PALETTE.brand[50],
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
    color: PALETTE.text[800],
  },
  levelChipDesc: {
    fontSize: 11,
    color: PALETTE.text[400],
    marginTop: 2,
  },
  levelChipExp: {
    fontSize: 10,
    color: PALETTE.brand[500],
    marginTop: 6,
    fontWeight: '600',
  },
  // 空状态
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: PALETTE.text[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  inactiveTitle: {
    fontSize: 13,
    color: PALETTE.text[400],
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.brand[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
});
