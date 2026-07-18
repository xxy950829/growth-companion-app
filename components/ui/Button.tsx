import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, PALETTE } from '@/utils/constants';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'wechat';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const bg =
    variant === 'primary'
      ? COLORS.accent
      : variant === 'secondary'
      ? COLORS.cardBg
      : variant === 'danger'
      ? COLORS.danger
      : variant === 'wechat'
      ? PALETTE.sage[500]
      : 'transparent';
  const color =
    variant === 'ghost'
      ? COLORS.accent
      : variant === 'secondary'
      ? PALETTE.text[700]
      : '#FFFFFF';
  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, iconSize: 15 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15, iconSize: 18 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16, iconSize: 19 },
  }[size];

  // 主色按钮带品牌色投影
  const shadow =
    variant === 'primary'
      ? {
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 4,
        }
      : variant === 'wechat'
      ? {
          shadowColor: PALETTE.sage[600],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 3,
        }
      : {};

  const iconEl = icon ? (
    <Icon name={icon} size={sizes.iconSize} color={color} strokeWidth={2.2} />
  ) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.btn,
        { backgroundColor: bg, height: size === 'lg' ? 52 : undefined },
        variant === 'secondary' && { borderWidth: 1, borderColor: COLORS.rule },
        variant === 'ghost' && { borderWidth: 1, borderColor: COLORS.accent },
        shadow,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon && iconPosition === 'left' && iconEl}
          <Text style={[styles.text, { color, fontSize: sizes.fontSize }, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && iconEl}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
