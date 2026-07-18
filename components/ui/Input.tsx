import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { COLORS } from '@/utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: string;
}

// 输入框：白色背景、16px 圆角、52 高度、细边框（与设计稿 .input-field 一致）
export function Input({ label, error, containerStyle, leftIcon, style, ...rest }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
        {leftIcon ? <Text style={styles.leftIcon}>{leftIcon}</Text> : null}
        <TextInput
          placeholderTextColor={PALETTE_text300}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const PALETTE_text300 = '#C4B8A5';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: PALETTE_text300,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.rule,
    height: 52,
  },
  inputWrapError: {
    borderColor: COLORS.danger,
  },
  leftIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.ink,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
