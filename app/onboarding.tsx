import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Blob, OnboardingIllustration, PlanetLogo, SunCloudArt } from '@/components/ui/Decor';
import { useAuthStore } from '@/stores/authStore';
import { toast, showDialog } from '@/stores/uiStore';
import { COLORS, PALETTE, GENDER_CONFIG } from '@/utils/constants';
import { validateBabyName, validateBirthday } from '@/utils/validators';
import { pickImage, takePhoto, uploadImage } from '@/services/storage';
import type { Baby } from '@/types';

// 欢迎引导步骤配置：3 步分别对应 3 个核心模块
interface TourStep {
  illustration: 'plant' | 'planet' | 'weather';
  title: string;
  desc: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    illustration: 'plant',
    title: '记录成长点滴',
    desc: '第一次微笑、第一颗牙齿、第一步走路\n每一个珍贵瞬间都值得被温柔记录',
  },
  {
    illustration: 'planet',
    title: '培养好习惯星球',
    desc: '把每日任务变成点点星光\n陪宝宝一起点亮专属的成长星球',
  },
  {
    illustration: 'weather',
    title: '心情天气瓶',
    desc: '用阳光、云朵、雨水记录情绪\n帮宝宝认识并表达自己的小心情',
  },
];

export default function OnboardingScreen() {
  const { createBaby, updateBaby, babies } = useAuthStore();
  const params = useLocalSearchParams<{ editId?: string }>();
  const insets = useSafeAreaInsets();
  const isEditMode = !!params.editId;
  const editingBaby = isEditMode ? babies.find((b) => b.id === params.editId) : null;

  // 引导阶段控制（编辑模式跳过引导）
  const [tourStep, setTourStep] = useState(0);
  const [tourDone, setTourDone] = useState(isEditMode);

  // 表单状态
  const [name, setName] = useState(editingBaby?.name || '');
  const [gender, setGender] = useState<Baby['gender']>(editingBaby?.gender || 'unknown');
  const [birthday, setBirthday] = useState<number>(editingBaby?.birthday || Date.now() - 365 * 24 * 3600 * 1000);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(editingBaby?.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 跳过引导：直接进入表单
  const skipTour = () => setTourDone(true);

  // 下一步：最后一步切换到表单
  const nextStep = () => {
    if (tourStep >= TOUR_STEPS.length - 1) {
      setTourDone(true);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  // 选择并上传头像
  const pickAndUploadAvatar = async (source: 'camera' | 'library') => {
    try {
      const localUri = source === 'camera' ? await takePhoto() : await pickImage();
      if (!localUri) return;
      setUploading(true);
      const cloudUrl = await uploadImage(localUri, `avatars/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
      setAvatarUrl(cloudUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const showAvatarPicker = () => {
    showDialog('选择头像', '请选择来源', [
      { text: '拍照', onPress: () => pickAndUploadAvatar('camera'), variant: 'primary' },
      { text: '相册', onPress: () => pickAndUploadAvatar('library'), variant: 'primary' },
      { text: '取消' },
    ]);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const nameCheck = validateBabyName(name);
    if (!nameCheck.valid) {
      setFormError(nameCheck.message || '昵称不正确');
      return;
    }
    const birthCheck = validateBirthday(birthday);
    if (!birthCheck.valid) {
      setFormError(birthCheck.message || '生日不正确');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode && editingBaby) {
        await updateBaby(editingBaby.id, { name: name.trim(), gender, birthday, avatarUrl });
        toast.success('宝宝档案已更新');
        setTimeout(() => router.back(), 600);
      } else {
        await createBaby({ name: name.trim(), gender, birthday, avatarUrl });
        router.replace('/(tabs)/archive');
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const adjustDate = (field: 'year' | 'month' | 'day', delta: number) => {
    const d = new Date(birthday);
    if (field === 'year') d.setFullYear(d.getFullYear() + delta);
    if (field === 'month') d.setMonth(d.getMonth() + delta);
    if (field === 'day') d.setDate(d.getDate() + delta);
    setBirthday(d.getTime());
  };

  const d = new Date(birthday);
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

  // ========== 阶段一：欢迎引导 ==========
  if (!tourDone) {
    const step = TOUR_STEPS[tourStep];
    return (
      <View style={styles.tourContainer}>
        {/* 装饰光斑 */}
        <Blob color={PALETTE.sand[300]} size={250} opacity={0.35} style={{ top: -80, left: -80 }} />
        <Blob color={PALETTE.brand[300]} size={200} opacity={0.15} style={{ bottom: 200, right: -70 }} />

        {/* 跳过按钮 */}
        <TouchableOpacity
          style={[styles.skipBtn, { top: 50 + insets.top }]}
          onPress={skipTour}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>跳过</Text>
        </TouchableOpacity>

        <View style={[styles.tourContent, { paddingTop: 120 + insets.top }]}>
          {/* 插画 */}
          <View style={styles.tourIllustration}>
            {step.illustration === 'plant' && <OnboardingIllustration size={260} />}
            {step.illustration === 'planet' && <PlanetLogo size={200} />}
            {step.illustration === 'weather' && (
              <View style={styles.weatherArtWrap}>
                <SunCloudArt size={180} />
              </View>
            )}
          </View>

          {/* 标题与描述 */}
          <Text style={styles.tourTitle}>{step.title}</Text>
          <Text style={styles.tourDesc}>{step.desc}</Text>

          {/* 页码点 */}
          <View style={styles.dotsRow}>
            {TOUR_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === tourStep && styles.dotActive]} />
            ))}
          </View>

          {/* 下一步按钮 */}
          <Button
            title={tourStep === TOUR_STEPS.length - 1 ? '开始记录' : '下一步'}
            icon="arrow-right"
            iconPosition="right"
            size="lg"
            onPress={nextStep}
            style={styles.tourBtn}
          />
        </View>
      </View>
    );
  }

  // ========== 阶段二：宝宝档案表单 ==========
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 60 + insets.top }]} keyboardShouldPersistTaps="handled">
        {/* 装饰光斑 */}
        <Blob color={PALETTE.brand[300]} size={200} opacity={0.18} style={{ top: -60, right: -60 }} />
        <Blob color={PALETTE.honey[400]} size={140} opacity={0.18} style={{ top: 100, left: -40 }} />

        {/* 标题 */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{isEditMode ? '编辑宝宝档案' : '创建宝宝档案'}</Text>
          <Text style={styles.formSubtitle}>
            {isEditMode ? '更新宝宝的成长信息' : '让我们一起记录宝宝成长的每一刻'}
          </Text>
        </View>

        <Card style={styles.card}>
          {/* 头像选择 */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showAvatarPicker} disabled={uploading} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <RNImage source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderIcon}>{GENDER_CONFIG[gender].icon}</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Icon name="camera" size={14} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>{uploading ? '上传中...' : '点击设置头像'}</Text>
          </View>

          {/* 昵称 */}
          <Text style={styles.label}>宝宝昵称</Text>
          <View style={styles.field}>
            <Icon name="smile" size={18} color={PALETTE.text[400]} strokeWidth={2} />
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.fieldInput}
              placeholder="给宝宝起个可爱的小名吧"
              placeholderTextColor={PALETTE.text[300]}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
          </View>

          {/* 性别 */}
          <Text style={styles.label}>性别</Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'unknown'] as const).map((g) => {
              const cfg = GENDER_CONFIG[g];
              const active = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderItem,
                    { borderColor: active ? cfg.color : 'rgba(235, 226, 214, 0.6)' },
                    active && { backgroundColor: cfg.color + '20' },
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.genderIcon}>{cfg.icon}</Text>
                  <Text style={[styles.genderLabel, active && { color: cfg.color, fontWeight: '600' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 生日 */}
          <Text style={styles.label}>生日</Text>
          <View style={styles.dateWrap}>
            <View style={styles.dateDisplay}>
              <Icon name="clock" size={18} color={PALETTE.honey[500]} strokeWidth={2} />
              <Text style={styles.dateStr}>{dateStr}</Text>
            </View>
            <View style={styles.dateColumns}>
              {([
                { field: 'year' as const, value: d.getFullYear(), unit: '年' },
                { field: 'month' as const, value: d.getMonth() + 1, unit: '月' },
                { field: 'day' as const, value: d.getDate(), unit: '日' },
              ]).map((col) => (
                <View key={col.field} style={styles.dateColumn}>
                  <TouchableOpacity
                    style={styles.dateStepper}
                    onPress={() => adjustDate(col.field, 1)}
                    activeOpacity={0.6}
                  >
                    <Icon name="chevron-down" size={16} color={PALETTE.brand[500]} strokeWidth={2.4} />
                  </TouchableOpacity>
                  <View style={styles.dateValueBox}>
                    <Text style={styles.dateValue}>{col.value}</Text>
                    <Text style={styles.dateUnit}>{col.unit}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.dateStepper, { transform: [{ rotate: '180deg' }] }]}
                    onPress={() => adjustDate(col.field, -1)}
                    activeOpacity={0.6}
                  >
                    <Icon name="chevron-down" size={16} color={PALETTE.brand[500]} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {formError && (
            <View style={styles.errorWrap}>
              <Icon name="info" size={14} color={PALETTE.state.error} strokeWidth={2.4} />
              <Text style={styles.error}>{formError}</Text>
            </View>
          )}

          <Button
            title={isEditMode ? '保存修改' : '创建档案，开始记录'}
            icon="arrow-right"
            iconPosition="right"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.btn}
            size="lg"
          />

          {isEditMode && (
            <Button
              title="取消"
              variant="ghost"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
          )}
        </Card>

        {!isEditMode && (
          <View style={styles.tipsWrap}>
            <Icon name="heart" size={18} color={PALETTE.brand[500]} strokeWidth={2} fill={PALETTE.brand[500]} />
            <Text style={styles.tipsText}>
              创建档案后，你可以记录宝宝的成长里程碑、培养好习惯、记录心情变化
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ========== 引导阶段 ==========
  tourContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  skipBtn: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  skipText: {
    fontSize: 13,
    color: PALETTE.text[500],
    fontWeight: '500',
  },
  tourContent: {
    flex: 1,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  tourIllustration: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherArtWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: PALETTE.text[800],
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  tourDesc: {
    fontSize: 14,
    color: PALETTE.text[400],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.bg[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: PALETTE.brand[500],
  },
  tourBtn: {
    width: '100%',
  },

  // ========== 表单阶段 ==========
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: PALETTE.text[800],
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: PALETTE.text[400],
    textAlign: 'center',
  },
  card: {
    padding: 22,
    borderRadius: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PALETTE.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 48,
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontSize: 12,
    color: PALETTE.text[400],
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    color: PALETTE.text[500],
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    height: 48,
  },
  fieldDivider: {
    width: 1,
    height: 18,
    backgroundColor: PALETTE.bg[300],
    marginHorizontal: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text[800],
    padding: 0,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderItem: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 13,
    color: PALETTE.text[400],
  },
  dateWrap: {
    gap: 12,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PALETTE.honey[400] + '20',
    borderRadius: 14,
    paddingVertical: 14,
  },
  dateStr: {
    fontSize: 17,
    color: PALETTE.text[800],
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
  },
  dateStepper: {
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  dateValue: {
    fontSize: 22,
    color: PALETTE.text[800],
    fontWeight: '700',
  },
  dateUnit: {
    fontSize: 13,
    color: PALETTE.text[400],
    fontWeight: '500',
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
  },
  error: {
    color: PALETTE.state.error,
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    marginTop: 20,
    borderRadius: 16,
    width: '100%',
  },
  cancelBtn: {
    marginTop: 10,
    width: '100%',
  },
  tipsWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PALETTE.brand[50],
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: PALETTE.text[500],
    lineHeight: 20,
  },
});
