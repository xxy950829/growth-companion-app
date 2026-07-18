import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, PALETTE } from '@/utils/constants';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 卡片：白色背景、16px 圆角、柔和阴影、细微边框（与设计稿 .card 一致）
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});
