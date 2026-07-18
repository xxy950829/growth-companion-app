import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { PLANET_LEVELS } from '@/types/planet';

interface PlanetViewProps {
  level: number;
  experience: number;
  stars: number;
}

export function PlanetView({ level, experience, stars }: PlanetViewProps) {
  const current = PLANET_LEVELS.find((l) => l.level === level) || PLANET_LEVELS[0];
  const next = PLANET_LEVELS.find((l) => l.level === level + 1) || null;
  const progress = next
    ? (experience - current.minExp) / (next.minExp - current.minExp)
    : 1;

  return (
    <Card style={styles.card}>
      <View style={styles.planetWrap}>
        <View style={[styles.glow, { backgroundColor: COLORS.accent2 }]} />
        <Text style={styles.planetEmoji}>{current.appearance}</Text>
      </View>

      <Text style={styles.levelName}>
        Lv.{current.level} · {current.name}
      </Text>
      <Text style={styles.levelReward}>{current.reward}</Text>

      {/* 进度条 */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {next ? `还需 ${next.minExp - experience} 经验升级` : '已达到最高等级 🎉'}
          </Text>
          <Text style={styles.expText}>{experience} EXP</Text>
        </View>
      </View>

      {/* 星星数 */}
      <View style={styles.starsRow}>
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.starsValue}>{stars}</Text>
        <Text style={styles.starsLabel}>颗星星</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 16,
    borderRadius: 24,
  },
  planetWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.25,
  },
  planetEmoji: {
    fontSize: 80,
  },
  levelName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  levelReward: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
  },
  progressWrap: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  progressTrack: {
    height: 12,
    backgroundColor: COLORS.bg2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  expText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.accent3 + '60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  starIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  starsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4940A',
    marginRight: 6,
  },
  starsLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
});
