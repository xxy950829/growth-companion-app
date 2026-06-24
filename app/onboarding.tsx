import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { COLORS, GENDER_CONFIG } from '@/utils/constants';
import { validateBabyName, validateBirthday } from '@/utils/validators';
import type { Baby } from '@/types';

export default function OnboardingScreen() {
  const { createBaby } = useAuthStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Baby['gender']>('unknown');
  const [birthday, setBirthday] = useState<number>(Date.now() - 365 * 24 * 3600 * 1000); // 默认1岁
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
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
      await createBaby({
        name: name.trim(),
        gender,
        birthday,
      });
      router.replace('/');
    } catch (e) {
      Alert.alert('创建失败', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // 简单的日期选择：用按钮加减年/月/日
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
        <View style={styles.hero}>
          <Text style={styles.logo}>👶</Text>
          <Text style={styles.title}>创建宝宝档案</Text>
          <Text style={styles.subtitle}>让我们一起记录宝宝成长的每一刻</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="宝宝昵称"
            placeholder="给宝宝起个可爱的小名吧"
            value={name}
            onChangeText={setName}
            leftIcon="🌟"
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
                    active && { backgroundColor: cfg.color + '20' },
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text style={styles.genderIcon}>{cfg.icon}</Text>
                  <Text style={styles.genderLabel}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>生日</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('year', -1)}>
              <Text style={styles.dateBtnText}>-年</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('month', -1)}>
              <Text style={styles.dateBtnText}>-月</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('day', -1)}>
              <Text style={styles.dateBtnText}>-日</Text>
            </TouchableOpacity>
            <Text style={styles.dateStr}>{dateStr}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('day', 1)}>
              <Text style={styles.dateBtnText}>+日</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('month', 1)}>
              <Text style={styles.dateBtnText}>+月</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('year', 1)}>
              <Text style={styles.dateBtnText}>+年</Text>
            </TouchableOpacity>
          </View>

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button title="创建档案" onPress={handleCreate} loading={submitting} style={styles.btn} />
        </Card>
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
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.ink,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderItem: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  genderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 13,
    color: COLORS.ink,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    padding: 10,
  },
  dateBtn: {
    padding: 6,
  },
  dateBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  dateStr: {
    fontSize: 14,
    color: COLORS.ink,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  btn: {
    marginTop: 20,
  },
});
