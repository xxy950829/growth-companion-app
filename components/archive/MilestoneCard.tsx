import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { MILESTONE_TYPE_CONFIG } from '@/types/archive';
import type { Milestone } from '@/types';
import { formatDateChinese } from '@/utils/helpers';

interface MilestoneCardProps {
  milestone: Milestone;
  onDelete?: (id: string) => void;
  showDate?: boolean;
}

export function MilestoneCard({ milestone, onDelete, showDate = true }: MilestoneCardProps) {
  const cfg = MILESTONE_TYPE_CONFIG[milestone.type];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: cfg.color + '20' }]}>
          <Text style={styles.typeIcon}>{cfg.icon}</Text>
          <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {showDate && <Text style={styles.date}>{formatDateChinese(milestone.date)}</Text>}
      </View>

      <Text style={styles.title}>{milestone.title}</Text>
      {milestone.description ? <Text style={styles.desc}>{milestone.description}</Text> : null}

      {/* 身高体重特有 */}
      {(milestone.type === 'height' || milestone.type === 'weight') && (
        <View style={styles.metricRow}>
          {milestone.height != null && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>身高</Text>
              <Text style={styles.metricValue}>{milestone.height} cm</Text>
            </View>
          )}
          {milestone.weight != null && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>体重</Text>
              <Text style={styles.metricValue}>{milestone.weight} kg</Text>
            </View>
          )}
        </View>
      )}

      {/* 疫苗特有 */}
      {milestone.type === 'vaccine' && milestone.vaccineName && (
        <View style={styles.vaccineRow}>
          <Text style={styles.vaccineName}>💉 {milestone.vaccineName}</Text>
          {milestone.nextVaccineDate ? (
            <Text style={styles.nextVaccine}>下次：{formatDateChinese(milestone.nextVaccineDate)}</Text>
          ) : null}
        </View>
      )}

      {milestone.mediaUrls.length > 0 && (
        <View style={styles.imageRow}>
          {milestone.mediaUrls.slice(0, 3).map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.image} />
          ))}
        </View>
      )}

      {milestone.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {milestone.tags.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(milestone.id)}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.muted,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  metric: {
    flex: 1,
    backgroundColor: COLORS.bg2,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 4,
  },
  vaccineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  nextVaccine: {
    fontSize: 12,
    color: COLORS.muted,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: COLORS.bg2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.danger,
  },
});
