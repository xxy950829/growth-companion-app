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
import { Modal } from '@/components/ui/Modal';
import { Icon, IconName } from '@/components/ui/Icon';
import { GradientBg, Blob } from '@/components/ui/Decor';
import { BabyAvatar } from '@/components/ui/BabyAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveStore } from '@/stores/archiveStore';
import { usePlanetStore } from '@/stores/planetStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { confirm, toast } from '@/stores/uiStore';
import { COLORS, PALETTE, GENDER_CONFIG } from '@/utils/constants';
import { formatAge, formatDateChinese } from '@/utils/helpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

// 菜单项配置
interface MenuItem {
  icon: IconName;
  label: string;
  iconBg: string;
  iconColor: string;
  trailing?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { user, babies, currentBabyId, switchBaby, logout } = useAuthStore();
  const archive = useArchiveStore((s) => s.archive);
  const habits = usePlanetStore((s) => s.habits);
  const moods = useWeatherStore((s) => s.moods);

  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [babyMgrVisible, setBabyMgrVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  // 统计数据
  const totalMilestones = archive?.stats.totalMilestones || 0;
  const totalPhotos = archive?.milestones.reduce((sum, m) => sum + m.mediaUrls.length, 0) || 0;
  const recordedDays = user?.createdAt ? Math.max(1, Math.floor((Date.now() - user.createdAt) / 86400000)) : 0;

  const handleAddBaby = () => {
    router.push('/onboarding');
  };

  const handleEditBaby = (babyId: string) => {
    router.push(`/onboarding?editId=${babyId}`);
  };

  const handleSwitch = (babyId: string) => {
    if (babyId === currentBabyId) return;
    switchBaby(babyId);
    toast.success('已切换宝宝');
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

  const menuItems: MenuItem[] = [
    {
      icon: 'baby',
      label: '宝宝管理',
      iconBg: PALETTE.brand[50],
      iconColor: PALETTE.brand[500],
      trailing: `${babies.length}个`,
      onPress: () => setBabyMgrVisible(true),
    },
    {
      icon: 'users',
      label: '家庭成员',
      iconBg: PALETTE.sage[50],
      iconColor: PALETTE.sage[500],
      trailing: '1人',
      onPress: () => toast.info('家庭成员功能开发中'),
    },
    {
      icon: 'bell',
      label: '习惯提醒',
      iconBg: PALETTE.state.warningSurface,
      iconColor: PALETTE.honey[500],
      onPress: () => toast.info('习惯提醒功能开发中'),
    },
    {
      icon: 'download',
      label: '数据导出',
      iconBg: PALETTE.state.infoSurface,
      iconColor: PALETTE.sand[500],
      onPress: () => toast.info('数据导出功能开发中'),
    },
    {
      icon: 'help-circle',
      label: '帮助反馈',
      iconBg: PALETTE.bg[200],
      iconColor: PALETTE.text[500],
      onPress: () => setAboutVisible(true),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="我的"
        right={
          <TouchableOpacity style={styles.settingsBtn} onPress={openMenu} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="settings" size={18} color={PALETTE.text[600]} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 用户资料头部 */}
        <View style={styles.profileHeader}>
          <GradientBg colors={[PALETTE.brand[200], PALETTE.brand[400]]} style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user?.displayName?.[0] || '妈'}</Text>
            <View style={styles.editBadge}>
              <Icon name="camera" size={12} color={PALETTE.text[500]} strokeWidth={2} />
            </View>
          </GradientBg>
          <Text style={styles.userName}>{user?.displayName || '未设置'}</Text>
          <Text style={styles.userMeta}>
            已记录 <Text style={styles.userMetaHighlight}>{recordedDays}</Text> 天
          </Text>

          {/* 三栏统计 */}
          <View style={styles.statsBar}>
            <View style={styles.statsCell}>
              <Text style={[styles.statsValue, { color: PALETTE.brand[600] }]}>{recordedDays}</Text>
              <Text style={styles.statsLabel}>记录天数</Text>
            </View>
            <View style={styles.statsCell}>
              <Text style={[styles.statsValue, { color: PALETTE.sage[500] }]}>{totalMilestones}</Text>
              <Text style={styles.statsLabel}>里程碑</Text>
            </View>
            <View style={styles.statsCell}>
              <Text style={[styles.statsValue, { color: PALETTE.honey[500] }]}>{totalPhotos}</Text>
              <Text style={styles.statsLabel}>照片</Text>
            </View>
          </View>
        </View>

        {/* 会员卡 */}
        <View style={styles.section}>
          <GradientBg colors={[PALETTE.brand[50], PALETTE.sand[100]]} style={styles.premiumCard}>
            <Blob color={PALETTE.honey[400]} size={100} opacity={0.18} style={{ top: -30, right: -30 }} />
            <TouchableOpacity
              style={styles.premiumRow}
              activeOpacity={0.8}
              onPress={() => toast.info('会员功能开发中')}
            >
              <GradientBg colors={[PALETTE.honey[400], PALETTE.brand[400]]} style={styles.premiumIcon}>
                <Icon name="star" size={24} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
              </GradientBg>
              <View style={{ flex: 1 }}>
                <View style={styles.premiumTitleRow}>
                  <Text style={styles.premiumTitle}>童伴会员</Text>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.premiumDesc}>解锁无限照片存储、成长报告、专属星球皮肤</Text>
              </View>
              <Icon name="chevron-right" size={18} color={PALETTE.brand[500]} strokeWidth={2} />
            </TouchableOpacity>
          </GradientBg>
        </View>

        {/* 菜单列表 */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.trailing ? <Text style={styles.menuTrailing}>{item.trailing}</Text> : null}
                <Icon name="chevron-right" size={16} color={PALETTE.text[400]} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <Text style={styles.versionText}>童伴星球 v2.0.0</Text>
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
                <Icon name="x" size={20} color={PALETTE.text[400]} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                closeMenu();
                setTimeout(() => setAboutVisible(true), 220);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: PALETTE.bg[200] }]}>
                <Icon name="info" size={20} color={PALETTE.text[500]} strokeWidth={2} />
              </View>
              <Text style={styles.drawerItemLabel}>关于应用</Text>
              <Icon name="chevron-right" size={16} color={PALETTE.text[400]} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.drawerDivider} />

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                closeMenu();
                setTimeout(handleLogout, 220);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: PALETTE.state.errorSurface }]}>
                <Icon name="log-out" size={20} color={PALETTE.state.error} strokeWidth={2} />
              </View>
              <Text style={[styles.drawerItemLabel, { color: PALETTE.state.error }]}>退出登录</Text>
              <Icon name="chevron-right" size={16} color={PALETTE.text[400]} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.drawerFooter}>
              <Text style={styles.drawerVersion}>童伴星球 v2.0.0</Text>
            </View>
          </Animated.View>
        </Pressable>
      </RNModal>

      {/* 宝宝管理弹窗 */}
      <Modal visible={babyMgrVisible} title="宝宝管理" onClose={() => setBabyMgrVisible(false)}>
        <View style={{ gap: 10 }}>
          {babies.length === 0 ? (
            <View style={styles.babyEmpty}>
              <Text style={styles.babyEmptyEmoji}>👶</Text>
              <Text style={styles.babyEmptyText}>还没有宝宝档案</Text>
            </View>
          ) : (
            babies.map((baby) => {
              const active = baby.id === currentBabyId;
              const cfg = GENDER_CONFIG[baby.gender];
              return (
                <View key={baby.id} style={[styles.babyCard, active && styles.babyCardActive]}>
                  <TouchableOpacity
                    style={styles.babyCardMain}
                    onPress={() => handleSwitch(baby.id)}
                    activeOpacity={0.7}
                  >
                    <BabyAvatar baby={baby} size={48} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.babyNameRow}>
                        <Text style={styles.babyName}>{baby.name}</Text>
                        {active ? <Text style={styles.activeBadge}>当前</Text> : null}
                      </View>
                      <Text style={styles.babyInfo}>
                        {cfg.label} · {formatAge(baby.birthday)}
                      </Text>
                      <Text style={styles.babyBirthday}>{formatDateChinese(baby.birthday)}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                      setBabyMgrVisible(false);
                      setTimeout(() => handleEditBaby(baby.id), 200);
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="edit" size={16} color={PALETTE.text[500]} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <TouchableOpacity style={styles.addBabyBtn} onPress={() => { setBabyMgrVisible(false); setTimeout(handleAddBaby, 200); }} activeOpacity={0.7}>
            <Icon name="plus" size={18} color={PALETTE.brand[500]} strokeWidth={2.2} />
            <Text style={styles.addBabyText}>添加宝宝</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
            <Text style={styles.aboutValue}>v2.0.0</Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // 右上角设置钮
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  // 用户资料头部
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.text[800],
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 13,
    color: PALETTE.text[400],
    marginBottom: 16,
  },
  userMetaHighlight: {
    color: PALETTE.brand[500],
    fontWeight: '600',
  },
  // 三栏统计
  statsBar: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(235, 226, 214, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
  },
  statsCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 0.5,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: 11,
    color: PALETTE.text[400],
    marginTop: 2,
  },
  // 会员卡
  premiumCard: {
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.brand[100],
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: PALETTE.text[800],
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: PALETTE.honey[400],
  },
  proBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  premiumDesc: {
    fontSize: 12,
    color: PALETTE.text[500],
    lineHeight: 17,
  },
  // 菜单卡
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 226, 214, 0.5)',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text[700],
  },
  menuTrailing: {
    fontSize: 12,
    color: PALETTE.text[400],
  },
  // 版本
  versionText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
    color: PALETTE.text[300],
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
    color: PALETTE.text[800],
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text[700],
    fontWeight: '500',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.rule,
    marginVertical: 4,
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 24,
    left: 20,
  },
  drawerVersion: {
    fontSize: 12,
    color: PALETTE.text[400],
  },
  // 宝宝管理弹窗
  babyEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  babyEmptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  babyEmptyText: {
    fontSize: 14,
    color: PALETTE.text[400],
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
  },
  babyCardActive: {
    borderColor: PALETTE.brand[500],
    backgroundColor: PALETTE.brand[50],
  },
  babyCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.text[800],
  },
  activeBadge: {
    fontSize: 11,
    color: '#FFFFFF',
    backgroundColor: PALETTE.brand[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: '600',
  },
  babyInfo: {
    fontSize: 12,
    color: PALETTE.text[400],
    marginTop: 3,
  },
  babyBirthday: {
    fontSize: 11,
    color: PALETTE.text[400],
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.bg[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBabyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PALETTE.brand[500],
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBabyText: {
    fontSize: 14,
    color: PALETTE.brand[500],
    fontWeight: '600',
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
    color: PALETTE.text[800],
  },
  aboutSlogan: {
    fontSize: 13,
    color: PALETTE.text[400],
    marginTop: 6,
  },
  aboutList: {
    backgroundColor: PALETTE.bg[200],
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
    color: PALETTE.text[400],
  },
  aboutValue: {
    fontSize: 14,
    color: PALETTE.text[700],
    fontWeight: '500',
  },
});
