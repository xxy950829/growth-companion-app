// 全局反馈组件：Toast 提示 + 确认对话框
// 在根布局挂载一次即可，通过 uiStore 的 toast()/confirm() 全局调用
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Modal as RNModal,
} from 'react-native';
import { useUIStore } from '@/stores/uiStore';
import { COLORS } from '@/utils/constants';

// ===== Toast =====

const TOAST_STYLE = {
  success: { color: COLORS.success, icon: '✓' },
  error: { color: COLORS.danger, icon: '✕' },
  info: { color: COLORS.accent, icon: 'ℹ' },
} as const;

function Toast() {
  const toast = useUIStore((s) => s.toast);
  const hideToast = useUIStore((s) => s.hideToast);
  const opacity = useRef(new Animated.Value(0)).current;
  const top = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(top, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(top, {
          toValue: -60,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast.visible, opacity, top]);

  if (!toast.message) return null;

  const style = TOAST_STYLE[toast.type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toastWrap, { opacity, transform: [{ translateY: top }] }]}
    >
      <View style={styles.toastCard}>
        <View style={[styles.toastBar, { backgroundColor: style.color }]} />
        <Text style={styles.toastIcon}>{style.icon}</Text>
        <Text style={styles.toastMsg} numberOfLines={3}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

// ===== 确认对话框 =====

function ConfirmDialog() {
  const dialog = useUIStore((s) => s.dialog);
  const hideDialog = useUIStore((s) => s.hideDialog);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (dialog.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 60,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [dialog.visible, scale, opacity]);

  if (!dialog.visible) return null;

  const handleAction = (action: typeof dialog.actions[number]) => {
    hideDialog();
    action.onPress?.();
  };

  return (
    <RNModal transparent visible={dialog.visible} animationType="none" onRequestClose={hideDialog}>
      <View style={styles.dialogOverlay}>
        <Pressable style={styles.dialogBackdrop} onPress={hideDialog} />
        <Animated.View
          style={[styles.dialogCard, { opacity, transform: [{ scale }] }]}
        >
        <Text style={styles.dialogTitle}>{dialog.title}</Text>
        {dialog.message ? (
          <Text style={styles.dialogMessage}>{dialog.message}</Text>
        ) : null}
        <View style={styles.dialogActions}>
          {dialog.actions.map((action, i) => {
            const variant = action.variant || 'default';
            const isPrimary = variant === 'primary';
            const isDanger = variant === 'danger';
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleAction(action)}
                activeOpacity={0.7}
                style={[
                  styles.dialogBtn,
                  isPrimary && styles.dialogBtnPrimary,
                  isDanger && styles.dialogBtnDanger,
                  !isPrimary && !isDanger && styles.dialogBtnDefault,
                ]}
              >
                <Text
                  style={[
                    styles.dialogBtnText,
                    (isPrimary || isDanger) && styles.dialogBtnTextWhite,
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
      </View>
    </RNModal>
  );
}

// ===== 导出：根布局挂载此组件 =====

export function FeedbackHost() {
  return (
    <>
      <Toast />
      <ConfirmDialog />
    </>
  );
}

const styles = StyleSheet.create({
  // Toast
  toastWrap: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastBar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderRadius: 2,
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.ink,
    fontWeight: '700',
  },
  toastMsg: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    fontWeight: '500',
  },

  // Dialog
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dialogCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    width: '80%',
    maxWidth: 340,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogBtnPrimary: {
    backgroundColor: COLORS.accent,
  },
  dialogBtnDanger: {
    backgroundColor: COLORS.danger,
  },
  dialogBtnDefault: {
    backgroundColor: COLORS.bg2,
  },
  dialogBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ink,
  },
  dialogBtnTextWhite: {
    color: '#FFFFFF',
  },
});
