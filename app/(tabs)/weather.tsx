import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Icon, IconName } from '@/components/ui/Icon';
import { GradientBg, Blob, SunCloudArt } from '@/components/ui/Decor';
import { MoodForm } from '@/components/weather/MoodForm';
import { MoodHistory } from '@/components/weather/MoodHistory';
import { useAuthStore } from '@/stores/authStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { toast, confirm } from '@/stores/uiStore';
import { COLORS, PALETTE } from '@/utils/constants';
import { WEATHER_CONFIG } from '@/types/weather';
import type { WeatherType, MoodRecord } from '@/types';

// 心情快速选项：emoji + 标签 + 对应天气类型
const MOOD_OPTIONS: { emoji: string; label: string; weather: WeatherType }[] = [
  { emoji: '😢', label: '难过', weather: 'rainy' },
  { emoji: '😐', label: '平静', weather: 'cloudy' },
  { emoji: '🙂', label: '不错', weather: 'rainbow' },
  { emoji: '😄', label: '开心', weather: 'sunny' },
  { emoji: '🤩', label: '超棒', weather: 'sunny' },
];

// 心情分数映射到日历单元格颜色
function scoreToColor(score: number | null): string {
  if (score == null) return PALETTE.bg[200];
  if (score >= 5) return PALETTE.honey[400];
  if (score >= 4) return PALETTE.sage[300];
  if (score >= 3) return PALETTE.brand[300];
  if (score >= 2) return PALETTE.sand[400];
  return PALETTE.text[400];
}

// 计算最近 7 天的心情分数（按日期对齐）
function buildWeekData(records: MoodRecord[]): { date: Date; score: number | null; isToday: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: { date: Date; score: number | null; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStart = d.getTime();
    const dayEnd = dayStart + 86400000;
    // 取该天最近一条记录的分数
    const dayRecords = records.filter((r) => r.date >= dayStart && r.date < dayEnd);
    const latest = dayRecords.sort((a, b) => b.date - a.date)[0];
    result.push({
      date: d,
      score: latest ? WEATHER_CONFIG[latest.weather].score : null,
      isToday: i === 0,
    });
  }
  return result;
}

// 周一起始的星期几标签
function weekdayLabel(d: Date): string {
  return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
}

export default function WeatherScreen() {
  const { currentBabyId } = useAuthStore();
  const { moods, load, addMood, deleteMood, getStatistics, getRecentRecords } = useWeatherStore();
  const [formVisible, setFormVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBabyId) load(currentBabyId);
    }, [currentBabyId])
  );

  const handleQuickAdd = async (weather: WeatherType) => {
    if (!currentBabyId) return;
    await addMood(currentBabyId, { weather, temperature: 'warm', date: Date.now() });
    toast.success(`已记录今天的心情：${WEATHER_CONFIG[weather].mood}`);
  };

  const handleFormAdd = async (data: Parameters<typeof addMood>[1]) => {
    if (!currentBabyId) return;
    await addMood(currentBabyId, data);
  };

  const handleDelete = (id: string) => {
    if (!currentBabyId) return;
    confirm('确认删除', '确定要删除这条心情记录吗？', () => deleteMood(currentBabyId, id), { danger: true });
  };

  const stats = getStatistics();
  const recent = getRecentRecords(20);
  const latest = moods?.records[0];
  const weekData = buildWeekData(moods?.records || []);
  const latestWeather: WeatherType = latest?.weather || 'sunny';
  const latestCfg = WEATHER_CONFIG[latestWeather];

  // 周日期范围文案
  const weekStart = weekData[0]?.date;
  const weekEnd = weekData[6]?.date;
  const weekRangeText = weekStart && weekEnd
    ? `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
    : '';

  // 心情洞察文案
  const insightText = latest
    ? stats.weeklyTrend === 'improving'
      ? `最近心情在变好，平均分 ${stats.averageMood}，继续保持 🌈`
      : stats.weeklyTrend === 'declining'
        ? `最近心情有些起伏，平均分 ${stats.averageMood}，多陪陪宝宝吧 💕`
        : `宝宝心情平稳，平均分 ${stats.averageMood}，状态不错 ✨`
    : '还没有记录，点击下方表情快速记录今天的心情吧';

  const insightIcon: IconName = latest
    ? stats.weeklyTrend === 'improving'
      ? 'laugh'
      : stats.weeklyTrend === 'declining'
        ? 'cloud-rain'
        : 'smile'
    : 'sparkles';

  return (
    <View style={styles.container}>
      <Header smallLabel="今日心情" title="心情天气" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 今日天气卡：渐变 + 太阳云朵插画 */}
        <View style={styles.section}>
          <GradientBg colors={[PALETTE.honey[400], PALETTE.brand[300]]} style={styles.todayCard}>
            <Blob color="#FFFFFF" size={150} opacity={0.18} style={{ top: -40, right: -40 }} />
            <View style={styles.todayRow}>
              <SunCloudArt size={90} />
              <View style={styles.todayText}>
                <Text style={styles.todayWeather}>{latestCfg.label}</Text>
                <Text style={styles.todayDesc}>{latest?.note || latestCfg.description}</Text>
              </View>
            </View>
          </GradientBg>
        </View>

        {/* 心情选择器 */}
        <View style={styles.section}>
          <Text style={styles.selectorTitle}>现在的心情是？</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((opt) => {
              const active = latestWeather === opt.weather && opt.label === latestCfg.mood;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.moodBtn, active && styles.moodBtnActive]}
                  onPress={() => handleQuickAdd(opt.weather)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.moodLabelRow}>
            {MOOD_OPTIONS.map((opt) => {
              const active = latestWeather === opt.weather && opt.label === latestCfg.mood;
              return (
                <Text key={opt.label} style={[styles.moodLabel, active && styles.moodLabelActive]}>
                  {opt.label}
                </Text>
              );
            })}
          </View>
        </View>

        {/* 心情洞察卡 */}
        <View style={styles.section}>
          <Card style={styles.insightCard}>
            <View style={styles.insightIconWrap}>
              <Icon name={insightIcon} size={18} color={PALETTE.state.success} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{latest ? '心情小贴士' : '开始记录'}</Text>
              <Text style={styles.insightText}>{insightText}</Text>
            </View>
          </Card>
        </View>

        {/* 本周心情日历 */}
        <View style={styles.section}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>本周心情</Text>
            <Text style={styles.weekRange}>{weekRangeText}</Text>
          </View>
          <Card style={styles.weekCard}>
            <View style={styles.weekGrid}>
              {weekData.map((d, i) => (
                <View key={i} style={styles.weekCell}>
                  <View
                    style={[
                      styles.calCell,
                      { backgroundColor: scoreToColor(d.score) },
                      d.isToday && styles.calCellToday,
                    ]}
                  >
                    {d.score != null ? (
                      <Text style={styles.calCellText}>{d.score}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.weekDayLabel, d.isToday && styles.weekDayLabelToday]}>
                    {d.isToday ? '今' : weekdayLabel(d.date)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* 心情日记 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>心情日记</Text>
          <MoodHistory records={recent} onDelete={handleDelete} />
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

      <MoodForm visible={formVisible} onClose={() => setFormVisible(false)} onSubmit={handleFormAdd} />
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
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: PALETTE.text[700],
    marginBottom: 12,
  },
  // 今日天气卡
  todayCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  todayText: {
    flex: 1,
  },
  todayWeather: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  todayDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  // 心情选择器
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text[700],
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  moodBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  moodBtnActive: {
    backgroundColor: PALETTE.brand[50],
    borderColor: PALETTE.brand[500],
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  moodLabel: {
    flex: 1,
    fontSize: 10,
    color: PALETTE.text[400],
    textAlign: 'center',
  },
  moodLabelActive: {
    color: PALETTE.brand[500],
    fontWeight: '600',
  },
  // 心情洞察
  insightCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PALETTE.state.successSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text[700],
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: PALETTE.text[400],
    lineHeight: 18,
  },
  // 周日历
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text[700],
  },
  weekRange: {
    fontSize: 12,
    color: PALETTE.text[400],
  },
  weekCard: {
    padding: 16,
    borderRadius: 16,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  calCell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellToday: {
    borderWidth: 2,
    borderColor: PALETTE.brand[500],
  },
  calCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekDayLabel: {
    fontSize: 11,
    color: PALETTE.text[400],
  },
  weekDayLabelToday: {
    color: PALETTE.brand[500],
    fontWeight: '600',
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
