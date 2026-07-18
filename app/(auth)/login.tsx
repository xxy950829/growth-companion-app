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
import { validateEmail, validatePassword } from '@/utils/validators';
import { EVENTS, logEvent, setUserProperty } from '@/services/analytics';

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setFormError(null);
    if (!validateEmail(email)) {
      setFormError('请输入正确的邮箱');
      return;
    }
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      setFormError(pwdCheck.message || '密码格式不正确');
      return;
    }
    try {
      await login(email, password);
      logEvent(EVENTS.LOGIN);
      setUserProperty('lastLoginAt', String(Date.now()));
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
          <Text style={styles.logo}>🪐</Text>
          <Text style={styles.title}>童伴星球</Text>
          <Text style={styles.subtitle}>陪伴孩子成长的每一刻</Text>
        </View>

        <View style={styles.form}>
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
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="🔒"
          />

          {(formError || error) && (
            <Text style={styles.error}>{formError || error}</Text>
          )}

          <Button title="登录" onPress={handleLogin} loading={loading} size="lg" style={styles.btn} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>还没有账号？</Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>立即注册</Text>
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
    marginBottom: 32,
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
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
