import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { COLORS } from '@/utils/constants';
import { validateEmail, validatePassword, validatePhone } from '@/utils/validators';
import { EVENTS, logEvent, setUserProperty } from '@/services/analytics';

export default function RegisterScreen() {
  const { register, loading, clearError } = useAuthStore();
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>开启陪伴成长之旅</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="昵称"
            placeholder="如何称呼您？"
            value={displayName}
            onChangeText={setDisplayName}
            leftIcon="👤"
          />
          <Input
            label="邮箱"
            placeholder="请输入邮箱"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="📧"
          />
          <Input
            label="手机号（选填）"
            placeholder="便于找回密码"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="📱"
          />
          <Input
            label="密码"
            placeholder="至少6位"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="🔒"
          />

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button title="注册" onPress={handleRegister} loading={loading} size="lg" style={styles.btn} />

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
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.ink,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  btn: {
    marginTop: 16,
    width: '100%',
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  link: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
