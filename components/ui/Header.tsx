import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PALETTE } from '@/utils/constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  // 标题上方的小标签（如"今日心情"、"7月18日 星期六"）
  smallLabel?: string;
  right?: React.ReactNode;
}

// 通用页头：左上为小标签 + 大标题 + 副标题，右侧可选操作区
export function Header({ title, subtitle, smallLabel, right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
      <View style={styles.left}>
        {smallLabel ? <Text style={styles.smallLabel}>{smallLabel}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
  },
  smallLabel: {
    fontSize: 13,
    color: PALETTE.text[400],
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PALETTE.text[800],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.text[400],
    marginTop: 4,
  },
});
