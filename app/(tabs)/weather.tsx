import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { WeatherBottle } from '@/components/weather/WeatherBottle';
import { MoodForm } from '@/components/weather/MoodForm';
import { MoodHistory } from '@/components/weather/MoodHistory';
import { useAuthStore } from '@/stores/authStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { confirm } from '@/stores/uiStore';
import { COLORS } from '@/utils/constants';
import { WEATHER_CONFIG } from '@/types/weather';
import type { WeatherType } from '@/types';

export default function WeatherScreen() {
  const { currentBabyId } = useAuthStore();
  const { moods, load, addMood, deleteMood, getStatistics, getRecentRecords } = useWeatherStore();
  const [formVisible, setFormVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (currentBabyId) load(currentBabyId);
    }, [currentBabyId])
  );

  const handleAdd = async (data: Parameters<typeof addMood>[1]) => {
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
  const trendText = {
    improving: '↗️ 心情在变好',
    stable: '➡️ 心情平稳',
    declining: '↘️ 心情需要关注',
  }[stats.weeklyTrend];

  // 天气分布
  const distribution = (Object.keys(WEATHER_CONFIG) as WeatherType[])
    .map((w) => ({ weather: w, count: stats.distribution[w] || 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <Header title="心情天气瓶" subtitle="认识每一种情绪" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 今日天气瓶 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={styles.todayCard}>
            <Text style={styles.todayTitle}>{latest ? '最近一次心情' : '今天还没有记录'}</Text>
            {latest ? (
              <View style={styles.todayBottleWrap}>
                <WeatherBottle weather={latest.weather} size="lg" />
              </View>
            ) : (
              <View style={styles.todayBottleWrap}>
                <WeatherBottle weather="cloudy" size="lg" />
              </View>
            )}
            {latest?.note ? <Text style={styles.todayNote}>「{latest.note}」</Text> : null}
            <Text style={styles.trend}>{trendText}</Text>
          </Card>
        </View>

        {/* 统计 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>情绪统计</Text>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent + '12' }]}>
              <Text style={styles.statValue}>{stats.totalRecords}</Text>
              <Text style={styles.statLabel}>总记录</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent2 + '12' }]}>
              <Text style={styles.statValue}>{stats.averageMood}</Text>
              <Text style={styles.statLabel}>平均分</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent3 + '40' }]}>
              <Text style={styles.statValue}>{stats.mostFrequent ? WEATHER_CONFIG[stats.mostFrequent].icon : '-'}</Text>
              <Text style={styles.statLabel}>最常见</Text>
            </Card>
          </View>

          {/* 分布图 */}
          {distribution.length > 0 && (
            <Card style={styles.distCard}>
              <Text style={styles.distTitle}>情绪分布</Text>
              {distribution.map((d) => {
                const cfg = WEATHER_CONFIG[d.weather];
                return (
                  <View key={d.weather} style={styles.distRow}>
                    <Text style={styles.distIcon}>{cfg.icon}</Text>
                    <Text style={styles.distLabel}>{cfg.label}</Text>
                    <View style={styles.distBarWrap}>
                      <View
                        style={[styles.distBar, { width: `${(d.count / maxCount) * 100}%`, backgroundColor: cfg.color }]}
                      />
                    </View>
                    <Text style={styles.distCount}>{d.count}</Text>
                  </View>
                );
              })}
            </Card>
          )}
        </View>

        {/* 历史记录 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>心情日记</Text>
        </View>
      </ScrollView>

      {/* 历史记录列表（独立滚动） */}
      <View style={{ flex: 1, paddingHorizontal: 0 }}>
        <MoodHistory records={recent} onDelete={handleDelete} />
      </View>

      {/* 浮动添加按钮 */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <MoodForm visible={formVisible} onClose={() => setFormVisible(false)} onSubmit={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flexShrink: 1,
    flexGrow: 0,
  },
  todayCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
  },
  todayTitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  todayBottleWrap: {
    marginVertical: 12,
  },
  todayNote: {
    fontSize: 14,
    color: COLORS.ink,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  trend: {
    fontSize: 13,
    color: COLORS.accent2,
    marginTop: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  distCard: {
    padding: 18,
    borderRadius: 20,
  },
  distTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 14,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distIcon: {
    fontSize: 20,
    width: 32,
  },
  distLabel: {
    fontSize: 12,
    color: COLORS.muted,
    width: 56,
  },
  distBarWrap: {
    flex: 1,
    height: 14,
    backgroundColor: COLORS.bg2,
    borderRadius: 7,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  distBar: {
    height: '100%',
    borderRadius: 7,
  },
  distCount: {
    fontSize: 13,
    color: COLORS.ink,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    marginTop: -2,
  },
});
