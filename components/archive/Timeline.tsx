import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MilestoneCard } from './MilestoneCard';
import type { Milestone } from '@/types';
import { COLORS } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';

interface TimelineProps {
  milestones: Milestone[];
  onDelete?: (id: string) => void;
  emptyText?: string;
}

interface Group {
  dateKey: string;
  dateLabel: string;
  data: Milestone[];
}

export function Timeline({ milestones, onDelete, emptyText = '还没有记录，点击 + 创建第一条吧' }: TimelineProps) {
  // 按日期分组
  const groups: Group[] = [];
  const groupMap = new Map<string, Milestone[]>();
  for (const m of milestones) {
    const key = formatDate(m.date);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(m);
  }
  for (const [key, list] of groupMap.entries()) {
    groups.push({
      dateKey: key,
      dateLabel: key,
      data: list.sort((a, b) => b.date - a.date),
    });
  }
  groups.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));

  if (milestones.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  const renderGroup = (item: Group) => (
    <View style={styles.group}>
      <View style={styles.dateRow}>
        <View style={styles.dateDot} />
        <Text style={styles.dateText}>{item.dateLabel}</Text>
      </View>
      {item.data.map((m) => (
        <View key={m.id} style={styles.itemWrap}>
          <View style={styles.line} />
          <View style={{ flex: 1 }}>
            <MilestoneCard milestone={m} onDelete={onDelete} showDate={false} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.list}>
      {groups.map((item) => (
        <View key={item.dateKey}>{renderGroup(item)}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  group: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  itemWrap: {
    flexDirection: 'row',
  },
  line: {
    width: 2,
    backgroundColor: COLORS.rule,
    marginLeft: 4,
    marginRight: 12,
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
