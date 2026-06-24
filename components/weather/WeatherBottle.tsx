import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { WEATHER_CONFIG } from '@/types/weather';
import type { WeatherType } from '@/types';

interface WeatherBottleProps {
  weather: WeatherType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WeatherBottle({ weather, size = 'md', showLabel = true }: WeatherBottleProps) {
  const cfg = WEATHER_CONFIG[weather];
  const dims = {
    sm: { width: 60, height: 80, iconSize: 28 },
    md: { width: 120, height: 150, iconSize: 56 },
    lg: { width: 180, height: 220, iconSize: 80 },
  }[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bottle,
          {
            width: dims.width,
            height: dims.height,
            backgroundColor: cfg.color + '30',
            borderColor: cfg.color,
          },
        ]}
      >
        {/* 瓶口 */}
        <View style={[styles.neck, { width: dims.width * 0.4, backgroundColor: cfg.color + '50' }]} />

        {/* 瓶内液体 */}
        <View style={styles.liquidWrap}>
          <View
            style={[
              styles.liquid,
              {
                backgroundColor: cfg.color,
                height: dims.height * 0.55,
              },
            ]}
          />
          <Text style={[styles.weatherIcon, { fontSize: dims.iconSize }]}>{cfg.icon}</Text>
        </View>

        {/* 装饰气泡 */}
        <View style={[styles.bubble, styles.b1, { backgroundColor: cfg.color }]} />
        <View style={[styles.bubble, styles.b2, { backgroundColor: cfg.color }]} />
      </View>

      {showLabel && (
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{cfg.label}</Text>
          <Text style={styles.mood}>{cfg.mood}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bottle: {
    borderRadius: 30,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  neck: {
    height: 12,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: 'absolute',
    top: 0,
  },
  liquidWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  liquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
  },
  weatherIcon: {
    zIndex: 2,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 99,
    opacity: 0.4,
  },
  b1: {
    width: 12,
    height: 12,
    top: 30,
    left: 15,
  },
  b2: {
    width: 8,
    height: 8,
    top: 50,
    right: 18,
  },
  labelWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  mood: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
});
