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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { toast, showDialog } from '@/stores/uiStore';
import { COLORS, GENDER_CONFIG } from '@/utils/constants';
import { validateBabyName, validateBirthday } from '@/utils/validators';
import { pickImage, takePhoto, uploadImage } from '@/services/storage';
import type { Baby } from '@/types';

export default function OnboardingScreen() {
  const { createBaby, updateBaby, babies } = useAuthStore();
  const params = useLocalSearchParams<{ editId?: string }>();
  const isEditMode = !!params.editId;
  const editingBaby = isEditMode ? babies.find((b) => b.id === params.editId) : null;

  const [name, setName] = useState(editingBaby?.name || '');
  const [gender, setGender] = useState<Baby['gender']>(editingBaby?.gender || 'unknown');
  const [birthday, setBirthday] = useState<number>(editingBaby?.birthday || Date.now() - 365 * 24 * 3600 * 1000);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(editingBaby?.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 选择并上传头像：上传到后端 COS，失败则保留本地 URI
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
        await updateBaby(editingBaby.id, {
          name: name.trim(),
          gender,
          birthday,
          avatarUrl,
        });
        toast.success('宝宝档案已更新');
        setTimeout(() => router.back(), 600);
      } else {
        await createBaby({
          name: name.trim(),
          gender,
          birthday,
          avatarUrl,
        });
        // 直接跳转主页，避免 index.tsx 分发时序问题
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <Text style={styles.logo}>{isEditMode ? '✏️' : '🌟'}</Text>
            <Text style={styles.title}>{isEditMode ? '编辑宝宝档案' : '创建宝宝档案'}</Text>
            <Text style={styles.subtitle}>
              {isEditMode ? '更新宝宝的成长信息' : '让我们一起记录宝宝成长的每一刻'}
            </Text>
          </View>
        </View>

        <View style={styles.formWrap}>
          <Card style={styles.card}>
            {/* 头像选择 */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={showAvatarPicker} disabled={uploading} activeOpacity={0.8}>
                <View style={styles.avatarWrap}>
                  {avatarUrl ? (
                    <RNImage source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderIcon}>
                        {GENDER_CONFIG[gender].icon}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Text style={styles.cameraIcon}>{uploading ? '⏳' : '📷'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>
                {uploading ? '上传中...' : '点击设置头像'}
              </Text>
            </View>

            <Input
              label="宝宝昵称"
              placeholder="给宝宝起个可爱的小名吧"
              value={name}
              onChangeText={setName}
              leftIcon="💫"
              maxLength={20}
            />

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
                      { borderColor: active ? cfg.color : COLORS.rule },
                      active && { backgroundColor: cfg.color + '25' },
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

            <Text style={styles.label}>生日</Text>
            <View style={styles.dateWrap}>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateIcon}>🎂</Text>
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
                      <Text style={styles.dateStepperIcon}>▲</Text>
                    </TouchableOpacity>
                    <View style={styles.dateValueBox}>
                      <Text style={styles.dateValue}>{col.value}</Text>
                      <Text style={styles.dateUnit}>{col.unit}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateStepper}
                      onPress={() => adjustDate(col.field, -1)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.dateStepperIcon}>▼</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {formError && (
              <View style={styles.errorWrap}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.error}>{formError}</Text>
              </View>
            )}

            <Button
              title={isEditMode ? '保存修改' : '创建档案，开始记录 ✨'}
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
              <Text style={styles.tipsIcon}>💝</Text>
              <Text style={styles.tipsText}>
                创建档案后，你可以记录宝宝的成长里程碑、培养好习惯、记录心情变化
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  heroSection: {
    position: 'relative',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 300,
    backgroundColor: COLORS.accent + '15',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  formWrap: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 24,
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
    backgroundColor: COLORS.accent + '15',
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
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.cardBg,
  },
  cameraIcon: {
    fontSize: 15,
  },
  avatarHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderItem: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  genderIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  genderLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  dateWrap: {
    gap: 12,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent3 + '40',
    borderRadius: 16,
    paddingVertical: 14,
  },
  dateIcon: {
    fontSize: 22,
  },
  dateStr: {
    fontSize: 17,
    color: COLORS.ink,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.rule,
  },
  dateStepper: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStepperIcon: {
    color: COLORS.accent,
    fontSize: 14,
  },
  dateValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  dateValue: {
    fontSize: 22,
    color: COLORS.ink,
    fontWeight: '700',
  },
  dateUnit: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  errorIcon: {
    fontSize: 14,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    marginTop: 24,
    borderRadius: 16,
  },
  cancelBtn: {
    marginTop: 12,
  },
  tipsWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent2 + '15',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  tipsIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
});
