import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Blob, LoginIllustration } from '@/components/ui/Decor';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { COLORS, PALETTE } from '@/utils/constants';
import { validateEmail, validatePhone, validatePassword } from '@/utils/validators';
import { EVENTS, logEvent, setUserProperty } from '@/services/analytics';

type AuthMode = 'phone' | 'email';

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('phone');

  // 手机号模式（演示环境，仅 UI）
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 邮箱模式（实际可用）
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const switchMode = (m: AuthMode) => {
    if (m === mode) return;
    setMode(m);
    setFormError(null);
    clearError();
  };

  // 发送验证码：演示环境仅做倒计时
  const handleSendCode = () => {
    if (!validatePhone(phone)) {
      setFormError('请输入正确的手机号');
      return;
    }
    setFormError(null);
    setCountdown(60);
    toast.info('演示环境：验证码已模拟发送');
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handlePhoneLogin = () => {
    setFormError(null);
    if (!validatePhone(phone)) {
      setFormError('请输入正确的手机号');
      return;
    }
    if (code.length < 4) {
      setFormError('请输入验证码');
      return;
    }
    toast.info('演示环境暂未接入短信登录，请切换至邮箱登录');
  };

  const handleEmailLogin = async () => {
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

  const handleWeChat = () => {
    toast.info('微信登录功能开发中');
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
        <Blob color={PALETTE.brand[300]} size={200} opacity={0.2} style={{ top: -60, right: -60 }} />
        <Blob color={PALETTE.sage[300]} size={180} opacity={0.2} style={{ top: 100, left: -50 }} />

        {/* 插画 */}
        <View style={styles.illustrationWrap}>
          <LoginIllustration size={180} />
        </View>

        {/* 标题 */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>欢迎回来</Text>
          <Text style={styles.subtitle}>登录以继续记录宝宝的成长旅程</Text>
        </View>

        {/* 模式切换 */}
        <View style={styles.tabRow}>
          {(['phone', 'email'] as AuthMode[]).map((m) => {
            const active = mode === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => switchMode(m)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {m === 'phone' ? '手机号登录' : '邮箱登录'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 表单区 */}
        <View style={styles.form}>
          {mode === 'phone' ? (
            <>
              {/* 手机号输入：+86 前缀 */}
              <View style={styles.field}>
                <Text style={styles.prefix}>+86</Text>
                <View style={styles.prefixDivider} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="请输入手机号"
                  placeholderTextColor={PALETTE.text[300]}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
                  keyboardType="phone-pad"
                />
              </View>

              {/* 验证码输入 + 获取验证码按钮 */}
              <View style={styles.field}>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="请输入验证码"
                  placeholderTextColor={PALETTE.text[300]}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.codeBtn, countdown > 0 && styles.codeBtnDisabled]}
                  onPress={handleSendCode}
                  disabled={countdown > 0}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.codeBtnText, countdown > 0 && styles.codeBtnTextDisabled]}>
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="登录"
                onPress={handlePhoneLogin}
                loading={loading}
                size="lg"
                style={styles.btn}
              />
            </>
          ) : (
            <>
              {/* 邮箱输入 */}
              <View style={styles.field}>
                <Icon name="user" size={18} color={PALETTE.text[400]} strokeWidth={2} />
                <View style={styles.prefixDivider} />
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

              {/* 密码输入 */}
              <View style={styles.field}>
                <Icon name="settings" size={18} color={PALETTE.text[400]} strokeWidth={2} />
                <View style={styles.prefixDivider} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="请输入密码"
                  placeholderTextColor={PALETTE.text[300]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Button
                title="登录"
                onPress={handleEmailLogin}
                loading={loading}
                size="lg"
                style={styles.btn}
              />
            </>
          )}

          {(formError || error) && (
            <Text style={styles.error}>{formError || error}</Text>
          )}

          {/* 微信一键登录 */}
          <Button
            title="微信一键登录"
            variant="wechat"
            icon="message-circle"
            size="lg"
            onPress={handleWeChat}
            style={styles.wechatBtn}
          />

          {/* 协议 */}
          <Text style={styles.terms}>
            登录即表示同意
            <Text style={styles.termsLink}> 《用户协议》 </Text>
            和
            <Text style={styles.termsLink}> 《隐私政策》 </Text>
          </Text>

          {/* 注册入口 */}
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
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 28,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: PALETTE.bg[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: PALETTE.text[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: PALETTE.text[400],
    fontWeight: '500',
  },
  tabTextActive: {
    color: PALETTE.text[800],
    fontWeight: '600',
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
    marginBottom: 14,
  },
  prefix: {
    fontSize: 15,
    color: PALETTE.text[600],
    fontWeight: '500',
  },
  prefixDivider: {
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
  codeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: PALETTE.brand[50],
  },
  codeBtnDisabled: {
    backgroundColor: PALETTE.bg[200],
  },
  codeBtnText: {
    fontSize: 13,
    color: PALETTE.brand[600],
    fontWeight: '600',
  },
  codeBtnTextDisabled: {
    color: PALETTE.text[400],
  },
  btn: {
    marginTop: 4,
    width: '100%',
  },
  wechatBtn: {
    marginTop: 14,
    width: '100%',
  },
  error: {
    color: PALETTE.state.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  terms: {
    textAlign: 'center',
    marginTop: 24,
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
