import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Icon, IconName } from '@/components/ui/Icon';
import { GradientBg } from '@/components/ui/Decor';
import { BabyAvatar } from '@/components/ui/BabyAvatar';
import { Timeline } from '@/components/archive/Timeline';
import { MilestoneForm } from '@/components/archive/MilestoneForm';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { COLORS, PALETTE, GENDER_CONFIG } from '@/utils/constants';
import { MILESTONE_TYPE_CONFIG, SELECTABLE_MILESTONE_TYPES, isFirstMilestoneType } from '@/types/archive';
import type { Milestone, Baby } from '@/types';
import { formatAge } from '@/utils/helpers';
import { EVENTS, logEvent } from '@/services/analytics';

// 自出生以来的天数
function daysSinceBirth(birthday: number): number {
  return Math.max(0, Math.floor((Date.now() - birthday) / 86400000));
}

// 根据当前小时生成问候语
function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return '早安';
  if (h >= 11 && h < 13) return '午安';
  if (h >= 13 && h < 18) return '下午好';
  if (h >= 18 && h < 22) return '晚上好';
  return '夜深了';
}

// 今日日期文案：M月D日 周X
function getTodayLabel(): string {
  const d = new Date();
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`;
}

// 是否今日
function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// 时间 HH:MM
function timeHHMM(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 各里程碑类型对应的图标与配色
const TYPE_VISUAL: Record<string, { icon: IconName; color: string; bgFrom: string; bgTo: string }> = {
  first_milestone: { icon: 'star', color: PALETTE.state.success, bgFrom: PALETTE.brand[100], bgTo: PALETTE.brand[200] },
  food: { icon: 'sparkles', color: PALETTE.honey[500], bgFrom: PALETTE.sand[100], bgTo: PALETTE.sand[200] },
  measurement: { icon: 'ruler', color: PALETTE.state.warning, bgFrom: PALETTE.sage[100], bgTo: PALETTE.sage[200] },
  vaccine: { icon: 'heart', color: PALETTE.state.error, bgFrom: PALETTE.brand[50], bgTo: PALETTE.brand[100] },
  other: { icon: 'camera', color: PALETTE.text[500], bgFrom: PALETTE.bg[200], bgTo: PALETTE.bg[300] },
};

function getTypeVisual(type: string) {
  if (isFirstMilestoneType(type)) return TYPE_VISUAL.first_milestone;
  return TYPE_VISUAL[type] || TYPE_VISUAL.other;
}

export default function ArchiveScreen() {
  const { user, babies, currentBabyId, switchBaby } = useAuthStore();
  const {
    archive,
    load,
    addMilestone,
    deleteMilestone,
    filterType,
    setFilterType,
    searchKeyword,
    setSearchKeyword,
    getFilteredMilestones,
  } = useArchiveStore();
  const [formVisible, setFormVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');

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

  const currentBaby: Baby | undefined = babies.find((b) => b.id === currentBabyId);
  const stats = archive?.stats;
  const filtered = getFilteredMilestones();
  const todayMilestones = filtered.filter((m) => isToday(m.date));
  // 今日为空时退化为最近 5 条，避免首页空荡
  const homeMilestones = todayMilestones.length > 0 ? todayMilestones : filtered.slice(0, 5);
  const isShowingToday = todayMilestones.length > 0;

  const onBabyCardPress = () => {
    if (babies.length <= 1) return;
    // 多宝宝时直接切换到下一个，简洁交互
    const idx = babies.findIndex((b) => b.id === currentBabyId);
    const next = babies[(idx + 1) % babies.length];
    switchBaby(next.id);
  };

  const onAvatarLongPress = () => {
    // 长按头像进入 onboarding 编辑当前宝宝
    if (currentBabyId) router.push(`/onboarding?editId=${currentBabyId}`);
  };

  return (
    <View style={styles.container}>
      <Header
        smallLabel={getTodayLabel()}
        title={`${getGreeting()}，${user?.displayName || '宝妈'} ☀️`}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 宝宝信息卡：渐变背景 + 头像 + 名字 + 性别 + 月龄 */}
        <View style={styles.section}>
          <GradientBg colors={['#FFFFFF', PALETTE.brand[50]]} style={styles.babyCard}>
            <TouchableOpacity
              style={styles.babyCardInner}
              onPress={onBabyCardPress}
              onLongPress={onAvatarLongPress}
              activeOpacity={0.85}
              disabled={babies.length <= 1}
            >
              <GradientBg colors={[PALETTE.brand[200], PALETTE.brand[400]]} style={styles.avatarRing}>
                <BabyAvatar baby={currentBaby} size={48} style={styles.avatarInner} />
              </GradientBg>
              <View style={styles.babyInfo}>
                <View style={styles.babyNameRow}>
                  <Text style={styles.babyName}>{currentBaby?.name || '未设置'}</Text>
                  {currentBaby ? (
                    <View style={[styles.genderChip, { backgroundColor: PALETTE.brand[100] }]}>
                      <Text style={[styles.genderText, { color: PALETTE.brand[700] }]}>
                        {GENDER_CONFIG[currentBaby.gender].label}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.babyMeta}>
                  {currentBaby ? `${formatAge(currentBaby.birthday)} · 第${daysSinceBirth(currentBaby.birthday)}天` : '请创建宝宝档案'}
                </Text>
              </View>
              {babies.length > 1 ? <Icon name="chevron-right" size={20} color={PALETTE.text[400]} /> : null}
            </TouchableOpacity>
          </GradientBg>
        </View>

        {/* 快速统计：身高 / 体重 / 记录 */}
        <View style={[styles.section, { flexDirection: 'row', gap: 10 }]}>
          <StatPill icon="ruler" iconColor={PALETTE.brand[500]} label="身高" value={stats?.lastHeight != null ? String(stats.lastHeight) : '-'} unit="cm" />
          <StatPill icon="scale" iconColor={PALETTE.sage[500]} label="体重" value={stats?.lastWeight != null ? String(stats.lastWeight) : '-'} unit="kg" />
          <StatPill icon="sparkles" iconColor={PALETTE.honey[500]} label="记录" value={String(stats?.totalMilestones || 0)} unit="条" />
        </View>

        {/* 区块标题 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{isShowingToday ? '今日里程碑' : '最近里程碑'}</Text>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'today' ? 'all' : 'today')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sectionLink}>{viewMode === 'today' ? '查看全部' : '收起'}</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'today' ? (
          <View style={styles.section}>
            {homeMilestones.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyText}>还没有记录，点击右下角 + 添加第一条里程碑</Text>
              </Card>
            ) : (
              <View style={{ gap: 12 }}>
                {homeMilestones.map((m) => (
                  <HomeMilestoneCard key={m.id} milestone={m} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {/* 搜索 */}
            <View style={styles.searchWrap}>
              <Icon name="filter" size={16} color={PALETTE.text[400]} />
              <TextInput
                style={styles.search}
                placeholder="搜索标题、描述或标签..."
                placeholderTextColor={PALETTE.text[400]}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
            </View>

            {/* 类型筛选 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, paddingBottom: 4 }}>
              <FilterChip label="全部" active={filterType === 'all'} onPress={() => setFilterType('all')} />
              {SELECTABLE_MILESTONE_TYPES.map((t) => (
                <FilterChip
                  key={t}
                  label={MILESTONE_TYPE_CONFIG[t].label}
                  active={filterType === t}
                  onPress={() => setFilterType(t)}
                />
              ))}
            </ScrollView>

            <View style={{ marginTop: 4 }}>
              <Timeline milestones={filtered} onDelete={handleDelete} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 浮动添加按钮 */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setFormVisible(true)}
      >
        <Icon name="plus" size={26} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <MilestoneForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleAdd}
      />
    </View>
  );
}

// 统计胶囊：图标 + 标签 + 数值
function StatPill({ icon, iconColor, label, value, unit }: { icon: IconName; iconColor: string; label: string; value: string; unit: string }) {
  return (
    <View style={styles.statPill}>
      <View style={styles.statPillHead}>
        <Icon name={icon} size={14} color={iconColor} strokeWidth={2} />
        <Text style={styles.statPillLabel}>{label}</Text>
      </View>
      <Text style={styles.statPillValue}>
        {value}
        <Text style={styles.statPillUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

// 首页里程碑卡片：照片缩略图 + 类型图标 + 标题 + 描述 + 时间
function HomeMilestoneCard({ milestone }: { milestone: Milestone }) {
  const cfg = MILESTONE_TYPE_CONFIG[milestone.type];
  const visual = getTypeVisual(milestone.type);
  const hasPhoto = milestone.mediaUrls.length > 0;

  return (
    <Card style={styles.homeCard}>
      {/* 缩略图：有照片显示图片，否则渐变占位 + 类型图标 */}
      {hasPhoto ? (
        <Image source={{ uri: milestone.mediaUrls[0] }} style={styles.homePhoto} />
      ) : (
        <GradientBg colors={[visual.bgFrom, visual.bgTo]} style={styles.homePhoto}>
          <Icon name={visual.icon} size={28} color={visual.color} strokeWidth={1.8} />
        </GradientBg>
      )}
      <View style={styles.homeContent}>
        <View style={styles.homeTitleRow}>
          <View style={[styles.homeTypeDot, { backgroundColor: PALETTE.state.successSurface }]}>
            <Icon name="star" size={12} color={PALETTE.state.success} strokeWidth={2.2} />
          </View>
          <Text style={styles.homeTitle} numberOfLines={1}>{milestone.title}</Text>
        </View>
        {milestone.description ? (
          <Text style={styles.homeDesc} numberOfLines={2}>{milestone.description}</Text>
        ) : null}
        <View style={styles.homeMetaRow}>
          <View style={styles.homeMetaItem}>
            <Icon name="clock" size={11} color={PALETTE.text[400]} strokeWidth={2} />
            <Text style={styles.homeMetaText}>{timeHHMM(milestone.date)}</Text>
          </View>
          <View style={styles.homeMetaItem}>
            <Icon name="heart" size={11} color={PALETTE.brand[400]} strokeWidth={2} />
            <Text style={styles.homeMetaText}>{cfg.label}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: PALETTE.brand[500], borderColor: PALETTE.brand[500] },
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: PALETTE.text[700],
  },
  sectionLink: {
    fontSize: 13,
    color: PALETTE.brand[500],
    fontWeight: '500',
  },
  // 宝宝卡
  babyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  babyCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  babyInfo: {
    flex: 1,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  babyName: {
    fontSize: 17,
    fontWeight: '600',
    color: PALETTE.text[800],
  },
  genderChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '500',
  },
  babyMeta: {
    fontSize: 13,
    color: PALETTE.text[400],
  },
  // 统计胶囊
  statPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statPillHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  statPillLabel: {
    fontSize: 11,
    color: PALETTE.text[400],
  },
  statPillValue: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.text[700],
  },
  statPillUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: PALETTE.text[400],
  },
  // 首页里程碑卡片
  homeCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  homePhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  homeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  homeTypeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: PALETTE.text[700],
    flex: 1,
  },
  homeDesc: {
    fontSize: 13,
    color: PALETTE.text[400],
    lineHeight: 19,
    marginBottom: 8,
  },
  homeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  homeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  homeMetaText: {
    fontSize: 11,
    color: PALETTE.text[400],
  },
  // 空状态
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: PALETTE.text[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  // 搜索与筛选
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.rule,
    marginBottom: 10,
  },
  search: {
    flex: 1,
    fontSize: 14,
    color: PALETTE.text[800],
    padding: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.rule,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    color: PALETTE.text[700],
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
