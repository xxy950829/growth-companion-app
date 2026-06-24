import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { COLORS } from '@/utils/constants';

export default function Index() {
  const { user, loading, babies, currentBabyId } = useAuthStore();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
});
