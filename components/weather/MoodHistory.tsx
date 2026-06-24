import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { WEATHER_CONFIG } from '@/types/weather';
import type { MoodRecord } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface MoodHistoryProps {
  records: MoodRecord[];
  onDelete?: (id: string) => void;
}

export function MoodHistory({ records, onDelete }: MoodHistoryProps) {
  if (records.length === 0) {
    return (
      <Card style={styles.empty}>
        <Text style={styles.emptyIcon}>🌈</Text>
        <Text style={styles.emptyText}>还没有心情记录</Text>
        <Text style={styles.emptyTip}>点击 + 记录今天的心情</Text>
      </Card>
    );
  }

  const renderItem: ListRenderItem<MoodRecord> = ({ item }) => {
    const cfg = WEATHER_CONFIG[item.weather];
    return (
      <Card style={[styles.card, { borderLeftColor: cfg.color, borderLeftWidth: 4 }]}>
        <View style={styles.row}>
          <Text style={styles.icon}>{cfg.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.weather}>{cfg.label}</Text>
              <Text style={styles.mood}>{cfg.mood}</Text>
            </View>
            <Text style={styles.date}>{formatDateTime(item.date)}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </View>
          {onDelete && (
            <Text style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
              删除
            </Text>
          )}
        </View>
      </Card>
    );
  };

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weather: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ink,
  },
  mood: {
    fontSize: 13,
    color: COLORS.muted,
    backgroundColor: COLORS.bg2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  date: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  note: {
    fontSize: 13,
    color: COLORS.ink,
    marginTop: 6,
    lineHeight: 18,
  },
  deleteBtn: {
    fontSize: 12,
    color: COLORS.danger,
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.ink,
  },
  emptyTip: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
});
