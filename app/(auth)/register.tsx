import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Blob, OnboardingIllustration } from '@/components/ui/Decor';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { COLORS, PALETTE } from '@/utils/constants';
import { validateEmail, validatePassword, validatePhone } from '@/utils/validators';
import { EVENTS, logEvent, setUserProperty } from '@/services/analytics';

export default function RegisterScreen() {
  const { register, loading, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    setFormError(null);
    if (!displayName.trim()) {
      setFormError('请输入昵称');
      return;
    }
    if (!validateEmail(email)) {
      setFormError('请输入正确的邮箱');
      return;
    }
    if (phone && !validatePhone(phone)) {
      setFormError('请输入正确的手机号');
      return;
    }
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      setFormError(pwdCheck.message || '密码格式不正确');
      return;
    }
    try {
      await register(email, password, displayName.trim(), phone || undefined);
      logEvent(EVENTS.SIGN_UP);
      setUserProperty('displayName', displayName.trim());
      router.replace('/');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: 60 + insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 装饰光斑 */}
        <Blob color={PALETTE.sage[300]} size={220} opacity={0.18} style={{ top: -80, left: -80 }} />
        <Blob color={PALETTE.brand[300]} size={180} opacity={0.18} style={{ top: 80, right: -60 }} />

        {/* 插画 */}
        <View style={styles.illustrationWrap}>
          <OnboardingIllustration size={200} />
        </View>

        {/* 标题 */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>开启陪伴成长之旅</Text>
        </View>

        {/* 表单 */}
        <View style={styles.form}>
          {/* 昵称 */}
          <View style={styles.field}>
            <Icon name="smile" size={18} color={PALETTE.text[400]} strokeWidth={2} />
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.fieldInput}
              placeholder="如何称呼您？"
              placeholderTextColor={PALETTE.text[300]}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={20}
            />
          </View>

          {/* 邮箱 */}
          <View style={styles.field}>
            <Icon name="user" size={18} color={PALETTE.text[400]} strokeWidth={2} />
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.fieldInput}
              placeholder="请输入邮箱"
              placeholderTextColor={PALETTE.text[300]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 手机号 */}
          <View style={styles.field}>
            <Text style={styles.prefix}>+86</Text>
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.fieldInput}
              placeholder="手机号（选填）"
              placeholderTextColor={PALETTE.text[300]}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
              keyboardType="phone-pad"
            />
          </View>

          {/* 密码 */}
          <View style={styles.field}>
            <Icon name="settings" size={18} color={PALETTE.text[400]} strokeWidth={2} />
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.fieldInput}
              placeholder="设置密码（至少6位）"
              placeholderTextColor={PALETTE.text[300]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button
            title="注册"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.btn}
          />

          {/* 协议 */}
          <Text style={styles.terms}>
            注册即表示同意
            <Text style={styles.termsLink}> 《用户协议》 </Text>
            和
            <Text style={styles.termsLink}> 《隐私政策》 </Text>
          </Text>

          {/* 登录入口 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账号？</Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>立即登录</Text>
            </Link>
          </View>
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
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: PALETTE.text[800],
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: PALETTE.text[400],
  },
  form: {
    width: '100%',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(235, 226, 214, 0.6)',
    height: 52,
    marginBottom: 12,
  },
  prefix: {
    fontSize: 15,
    color: PALETTE.text[600],
    fontWeight: '500',
  },
  fieldDivider: {
    width: 1,
    height: 20,
    backgroundColor: PALETTE.bg[300],
    marginHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.text[800],
    padding: 0,
  },
  btn: {
    marginTop: 8,
    width: '100%',
  },
  error: {
    color: PALETTE.state.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  terms: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 12,
    color: PALETTE.text[400],
    lineHeight: 20,
  },
  termsLink: {
    color: PALETTE.brand[600],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    color: PALETTE.text[400],
    fontSize: 14,
  },
  link: {
    color: PALETTE.brand[600],
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
