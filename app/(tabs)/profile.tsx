import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { usePlanetStore } from '@/stores/planetStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { COLORS, GENDER_CONFIG } from '@/utils/constants';
import { formatAge, formatDateChinese } from '@/utils/helpers';

export default function ProfileScreen() {
  const { user, babies, currentBabyId, switchBaby, logout } = useAuthStore();
  const archive = useArchiveStore((s) => s.archive);
  const habits = usePlanetStore((s) => s.habits);
  const moods = useWeatherStore((s) => s.moods);

  const handleAddBaby = () => {
    router.push('/onboarding');
  };

  const handleSwitch = (babyId: string) => {
    if (babyId === currentBabyId) return;
    switchBaby(babyId);
    Alert.alert('已切换', '已切换到另一个宝宝档案');
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const currentBaby = babies.find((b) => b.id === currentBabyId);

  return (
    <View style={styles.container}>
      <Header title="个人中心" subtitle="账户与设置" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 用户信息 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Card style={styles.userCard}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatar}>{user?.displayName?.[0] || '👤'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.displayName || '未设置'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.phone ? <Text style={styles.userPhone}>📱 {user.phone}</Text> : null}
            </View>
          </Card>
        </View>

        {/* 数据概览 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>数据概览</Text>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent + '15' }]}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{archive?.stats.totalMilestones || 0}</Text>
              <Text style={styles.statLabel}>成长记录</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent2 + '15' }]}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{habits?.planet.stars || 0}</Text>
              <Text style={styles.statLabel}>获得星星</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent3 + '30' }]}>
              <Text style={styles.statIcon}>🌈</Text>
              <Text style={styles.statValue}>{moods?.records.length || 0}</Text>
              <Text style={styles.statLabel}>心情记录</Text>
            </Card>
          </View>
        </View>

        {/* 宝宝档案管理 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>宝宝档案</Text>
            <TouchableOpacity onPress={handleAddBaby}>
              <Text style={styles.addBtn}>+ 添加</Text>
            </TouchableOpacity>
          </View>

          {babies.length === 0 ? (
            <Card style={styles.empty}>
              <Text style={styles.emptyText}>还没有宝宝档案</Text>
              <Button title="创建宝宝档案" onPress={handleAddBaby} size="sm" style={{ marginTop: 12 }} />
            </Card>
          ) : (
            babies.map((baby) => {
              const active = baby.id === currentBabyId;
              const cfg = GENDER_CONFIG[baby.gender];
              return (
                <TouchableOpacity
                  key={baby.id}
                  onPress={() => handleSwitch(baby.id)}
                  activeOpacity={0.7}
                >
                  <Card style={[styles.babyCard, active && styles.babyCardActive]}>
                    <Text style={styles.babyIcon}>{cfg.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.babyNameRow}>
                        <Text style={styles.babyName}>{baby.name}</Text>
                        {active && <Text style={styles.activeBadge}>当前</Text>}
                      </View>
                      <Text style={styles.babyInfo}>
                        {cfg.label} · {formatAge(baby.birthday)}
                      </Text>
                      <Text style={styles.babyBirthday}>生日：{formatDateChinese(baby.birthday)}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 关于 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>关于</Text>
          <Card style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>应用名称</Text>
              <Text style={styles.aboutValue}>童伴星球</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>v1.0.0 (MVP)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>技术栈</Text>
              <Text style={styles.aboutValue}>React Native + Expo</Text>
            </View>
            <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.aboutLabel}>数据存储</Text>
              <Text style={styles.aboutValue}>本地（AsyncStorage）</Text>
            </View>
          </Card>
        </View>

        {/* 退出登录 */}
        <View style={{ paddingHorizontal: 16 }}>
          <Button title="退出登录" variant="ghost" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatar: {
    fontSize: 28,
    color: COLORS.accent,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtn: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
  },
  babyCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '08',
  },
  babyIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
  },
  activeBadge: {
    fontSize: 11,
    color: '#FFFFFF',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  babyInfo: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  babyBirthday: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  aboutCard: {
    padding: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  aboutLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  aboutValue: {
    fontSize: 14,
    color: COLORS.ink,
    fontWeight: '500',
  },
});
