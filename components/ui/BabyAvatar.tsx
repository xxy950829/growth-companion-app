import React from 'react';
import { View, Text, Image, StyleSheet, ImageStyle } from 'react-native';
import { COLORS, GENDER_CONFIG } from '@/utils/constants';
import type { Baby } from '@/types';

interface BabyAvatarProps {
  baby?: Pick<Baby, 'avatarUrl' | 'gender'> | null;
  size?: number;
  style?: ImageStyle;
}

// 宝宝头像：有 avatarUrl 显示图片，否则显示性别 emoji
export function BabyAvatar({ baby, size = 48, style }: BabyAvatarProps) {
  const icon = GENDER_CONFIG[baby?.gender || 'unknown'].icon;
  if (baby?.avatarUrl) {
    return (
      <Image
        source={{ uri: baby.avatarUrl }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.55 }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
