import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal as RNModal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BabyAvatar } from '@/components/ui/BabyAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { usePlanetStore } from '@/stores/planetStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { confirm } from '@/stores/uiStore';
import { COLORS, GENDER_CONFIG } from '@/utils/constants';
import { formatAge, formatDateChinese } from '@/utils/helpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

export default function ProfileScreen() {
  const { user, babies, currentBabyId, switchBaby, logout } = useAuthStore();
  const archive = useArchiveStore((s) => s.archive);
  const habits = usePlanetStore((s) => s.habits);
  const moods = useWeatherStore((s) => s.moods);

  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const handleAddBaby = () => {
    router.push('/onboarding');
  };

  const handleEditBaby = (babyId: string) => {
    router.push(`/onboarding?editId=${babyId}`);
  };

  // 直接切换，无弹框（卡片有"当前"徽章和高亮反馈）
  const handleSwitch = (babyId: string) => {
    if (babyId === currentBabyId) return;
    switchBaby(babyId);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleLogout = () => {
    confirm('退出登录', '确定要退出登录吗？', () => logout(), { danger: true });
  };

  return (
    <View style={styles.container}>
      <Header title="个人中心" subtitle="账户与设置" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
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

        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>数据概览</Text>
            <TouchableOpacity onPress={openMenu} activeOpacity={0.6} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent + '12' }]}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{archive?.stats.totalMilestones || 0}</Text>
              <Text style={styles.statLabel}>成长记录</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent2 + '12' }]}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{habits?.planet.stars || 0}</Text>
              <Text style={styles.statLabel}>获得星星</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: COLORS.accent3 + '40' }]}>
              <Text style={styles.statIcon}>🌈</Text>
              <Text style={styles.statValue}>{moods?.records.length || 0}</Text>
              <Text style={styles.statLabel}>心情记录</Text>
            </Card>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>宝宝档案</Text>
            <TouchableOpacity onPress={handleAddBaby} activeOpacity={0.7}>
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
                <Card key={baby.id} style={[styles.babyCard, active && styles.babyCardActive]}>
                  <TouchableOpacity
                    style={styles.babyCardMain}
                    onPress={() => handleSwitch(baby.id)}
                    activeOpacity={0.7}
                  >
                    <BabyAvatar baby={baby} size={52} style={styles.babyAvatar} />
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
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditBaby(baby.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 右侧设置抽屉 */}
      <RNModal transparent visible={menuVisible} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <Animated.View
            style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>设置</Text>
              <TouchableOpacity onPress={closeMenu} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.drawerClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                setTimeout(() => setAboutVisible(true), 220);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuLabel}>关于应用</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                setTimeout(handleLogout, 220);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuLabel, { color: COLORS.danger }]}>退出登录</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.drawerFooter}>
              <Text style={styles.drawerVersion}>童伴星球 v1.0.0</Text>
            </View>
          </Animated.View>
        </Pressable>
      </RNModal>

      {/* 关于应用弹窗 */}
      <Modal visible={aboutVisible} title="关于应用" onClose={() => setAboutVisible(false)}>
        <View style={styles.aboutHero}>
          <Text style={styles.aboutLogo}>🌟</Text>
          <Text style={styles.aboutName}>童伴星球</Text>
          <Text style={styles.aboutSlogan}>陪伴宝宝成长的每一刻</Text>
        </View>
        <View style={styles.aboutList}>
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
            <Text style={styles.aboutValue}>本地 + 云端同步</Text>
          </View>
        </View>
      </Modal>
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
  settingsIcon: {
    fontSize: 22,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 30,
    color: COLORS.accent,
    fontWeight: '700',
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.ink,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 3,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingVertical: 16,
    borderRadius: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.rule,
  },
  babyCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '08',
  },
  babyAvatar: {
    marginRight: 14,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  activeBadge: {
    fontSize: 11,
    color: '#FFFFFF',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: '600',
  },
  babyInfo: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
  babyBirthday: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editBtnText: {
    fontSize: 18,
  },
  empty: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  // 设置抽屉
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.cardBg,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.rule,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ink,
  },
  drawerClose: {
    fontSize: 22,
    color: COLORS.muted,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.ink,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.muted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.rule,
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 24,
    left: 20,
  },
  drawerVersion: {
    fontSize: 12,
    color: COLORS.muted,
  },
  // 关于弹窗
  aboutHero: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  aboutLogo: {
    fontSize: 56,
    marginBottom: 8,
  },
  aboutName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  aboutSlogan: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
  },
  aboutList: {
    backgroundColor: COLORS.bg2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
