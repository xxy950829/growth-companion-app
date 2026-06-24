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
        <View style={[styles.glow, { backgroundColor: current.appearance === '🪐' ? '#8B5CF6' : COLORS.accent2 }]} />
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
    paddingVertical: 24,
    marginBottom: 16,
  },
  planetWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.2,
  },
  planetEmoji: {
    fontSize: 72,
  },
  levelName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ink,
  },
  levelReward: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  progressWrap: {
    width: '100%',
    marginTop: 16,
  },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.bg2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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
    marginTop: 12,
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  starIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  starsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.warning,
    marginRight: 4,
  },
  starsLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
