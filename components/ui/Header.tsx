import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { COLORS } from '@/utils/constants';
import { formatAge } from '@/utils/helpers';
import { BabyAvatar } from './BabyAvatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function Header({ title, subtitle, right }: HeaderProps) {
  const { babies, currentBabyId, switchBaby } = useAuthStore();
  const baby = babies.find((b) => b.id === currentBabyId);

  const handleSwitch = () => {
    if (babies.length <= 1) return;
    const idx = babies.findIndex((b) => b.id === currentBabyId);
    const next = babies[(idx + 1) % babies.length];
    switchBaby(next.id);
  };

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <TouchableOpacity onPress={handleSwitch} disabled={babies.length <= 1} activeOpacity={0.7}>
          <View style={styles.babyInfo}>
            <BabyAvatar baby={baby} size={40} style={styles.babyIcon} />
            <View>
              <Text style={styles.babyName}>{baby?.name || '未设置'}</Text>
              <Text style={styles.babyAge}>
                {baby ? `${formatAge(baby.birthday)} · 共${babies.length}个宝宝` : '点击创建'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.right}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
  },
  left: {
    flex: 1,
  },
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyIcon: {
    marginRight: 10,
  },
  babyName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
  },
  babyAge: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
});
