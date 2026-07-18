import React from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { PALETTE } from '@/utils/constants';
import { GradientBg, Blob, PlanetLogo } from '@/components/ui/Decor';

export default function Index() {
  const { user, loading, babies, currentBabyId } = useAuthStore();
  const insets = useSafeAreaInsets();

  // 加载中：渲染品牌启动页（与设计稿 Splash 一致）
  if (loading) {
    return (
      <GradientBg colors={[PALETTE.brand[500], PALETTE.brand[400], PALETTE.brand[300]]} style={styles.splash}>
        <Blob color="#FFFFFF" size={220} opacity={0.18} style={{ top: -40, right: -60 }} />
        <Blob color={PALETTE.brand[200]} size={280} opacity={0.4} style={{ bottom: -80, left: -80 }} />
        <Blob color={PALETTE.honey[400]} size={120} opacity={0.25} style={{ top: 200, right: 40 }} />

        <View style={styles.splashContent}>
          <View style={styles.logoWrap}>
            <PlanetLogo size={160} />
          </View>
          <Text style={styles.splashTitle}>童伴星球</Text>
          <Text style={styles.splashSubtitle}>记录成长每一刻</Text>
          <View style={[styles.spinnerWrap, { marginBottom: 20 + insets.bottom }]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        </View>
      </GradientBg>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 已登录但没有宝宝档案，去创建
  if (babies.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  if (!currentBabyId) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/archive" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    overflow: 'hidden',
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoWrap: {
    marginBottom: 40,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  spinnerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
