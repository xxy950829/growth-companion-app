import React, { useId, useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import { Svg, Circle, Path, Ellipse, Rect, Line, Defs, RadialGradient, LinearGradient, Stop, Text as SvgText, G } from 'react-native-svg';
import { PALETTE } from '@/utils/constants';

// 渐变背景：RN 无 CSS 渐变，用 SVG 线性渐变填充绝对定位矩形
// 默认 135deg（左上 → 右下），与设计稿 .card 渐变方向一致
interface GradientBgProps {
  colors: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
}
export function GradientBg({ colors, style, children }: GradientBgProps) {
  const rawId = useId();
  const id = `grad-${rawId.replace(/[:]/g, '')}`;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };
  return (
    <View style={[{ position: 'relative', overflow: 'hidden' }, style]} onLayout={onLayout}>
      {size.width > 0 && size.height > 0 && (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
              {colors.map((c, i) => (
                <Stop key={i} offset={colors.length === 1 ? 0 : i / (colors.length - 1)} stopColor={c} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill={`url(#${id})`} />
        </Svg>
      )}
      {children}
    </View>
  );
}

// 模糊光斑：用 SVG 径向渐变模拟 CSS filter:blur 的柔和边缘
interface BlobProps {
  color: string;
  size: number;
  opacity?: number;
  style?: ViewStyle;
}

export function Blob({ color, size, opacity = 0.5, style }: BlobProps) {
  return (
    <View style={[{ width: size, height: size, position: 'absolute' }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id={`blob-${color}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="60%" stopColor={color} stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#blob-${color})`} />
      </Svg>
    </View>
  );
}

// 星球 Logo：带笑脸与星环的星球（启动页/登录页主视觉）
export function PlanetLogo({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <Circle cx="80" cy="80" r="72" fill="rgba(255,255,255,0.08)" />
      <Circle cx="80" cy="80" r="64" fill="rgba(255,255,255,0.10)" />
      <Circle cx="80" cy="80" r="48" fill="#FDF2EE" />
      <Circle cx="68" cy="70" r="40" fill="rgba(255,255,255,0.3)" />
      {/* 眼睛 */}
      <Circle cx="68" cy="76" r="3.5" fill="#5C2820" />
      <Circle cx="92" cy="76" r="3.5" fill="#5C2820" />
      <Circle cx="69" cy="75" r="1" fill="#fff" />
      <Circle cx="93" cy="75" r="1" fill="#fff" />
      {/* 笑容 */}
      <Path d="M68 88 Q80 98 92 88" stroke="#5C2820" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* 腮红 */}
      <Circle cx="60" cy="86" r="4" fill="#F4C3B2" opacity="0.8" />
      <Circle cx="100" cy="86" r="4" fill="#F4C3B2" opacity="0.8" />
      {/* 星环 */}
      <G transform="rotate(-20 80 80)">
        <Ellipse cx="80" cy="80" rx="70" ry="16" stroke="#F4C3B2" strokeWidth="2.5" fill="none" opacity="0.6" />
      </G>
      {/* 轨道小星 */}
      <Circle cx="140" cy="50" r="4" fill="#E8B84B" />
      <Circle cx="140" cy="50" r="7" fill="#E8B84B" opacity="0.3" />
    </Svg>
  );
}

// 登录页插画：父母与宝宝剪影 + 爱心
export function LoginIllustration({ size = 180 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <Circle cx="90" cy="90" r="70" fill={PALETTE.brand[50]} />
      <Circle cx="90" cy="90" r="55" fill={PALETTE.brand[100]} opacity="0.5" />
      {/* 父母剪影 */}
      <Path
        d="M60 130 Q60 90 75 80 Q80 72 78 62 Q77 50 86 46 Q96 43 100 52 Q103 60 100 70 Q98 78 103 85 Q118 95 118 130 Z"
        fill={PALETTE.brand[300]}
        opacity="0.7"
      />
      {/* 宝宝剪影 */}
      <Ellipse cx="115" cy="115" rx="22" ry="26" fill={PALETTE.brand[500]} opacity="0.8" />
      <Circle cx="110" cy="108" r="2.5" fill="#fff" opacity="0.8" />
      <Circle cx="120" cy="108" r="2.5" fill="#fff" opacity="0.8" />
      <Path d="M110 118 Q115 122 120 118" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* 爱心 */}
      <Path
        d="M55 70 C55 64, 62 60, 66 66 C70 60, 77 64, 77 70 C77 78, 66 84, 66 84 C66 84, 55 78, 55 70Z"
        fill={PALETTE.brand[500]}
        opacity="0.6"
      />
      {/* 浮点 */}
      <Circle cx="40" cy="80" r="4" fill={PALETTE.honey[400]} opacity="0.5" />
      <Circle cx="145" cy="70" r="3" fill={PALETTE.sage[300]} opacity="0.5" />
      <Circle cx="150" cy="110" r="5" fill={PALETTE.brand[200]} opacity="0.5" />
    </Svg>
  );
}

// 引导页插画：生长植物 + 里程碑节点
export function OnboardingIllustration({ size = 260 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 260 260" fill="none">
      {/* 地面 */}
      <Ellipse cx="130" cy="220" rx="100" ry="15" fill={PALETTE.sage[100]} opacity="0.5" />
      {/* 茎 */}
      <Path d="M130 210 Q130 170 125 140 Q120 110 130 80" stroke={PALETTE.sage[400]} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* 叶 */}
      <Path d="M128 160 Q100 150 90 125 Q115 125 128 145" fill={PALETTE.sage[300]} />
      <Path d="M128 120 Q160 110 165 85 Q145 90 130 110" fill={PALETTE.sage[400]} />
      {/* 花 */}
      <Circle cx="130" cy="70" r="18" fill={PALETTE.brand[300]} />
      <Circle cx="130" cy="70" r="10" fill={PALETTE.honey[400]} />
      {/* 里程碑标记 */}
      <Circle cx="125" cy="140" r="10" fill="#fff" stroke={PALETTE.brand[300]} strokeWidth="2" />
      <SvgText x="125" y="144" textAnchor="middle" fontSize="10" fill={PALETTE.brand[500]} fontWeight="600">
        6m
      </SvgText>
      <Circle cx="128" cy="180" r="10" fill="#fff" stroke={PALETTE.sage[300]} strokeWidth="2" />
      <SvgText x="128" y="184" textAnchor="middle" fontSize="10" fill={PALETTE.sage[500]} fontWeight="600">
        3m
      </SvgText>
      <Circle cx="130" cy="205" r="10" fill={PALETTE.brand[500]} stroke={PALETTE.brand[500]} strokeWidth="2" />
      <SvgText x="130" y="209" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">
        出生
      </SvgText>
      {/* 浮动图标：星 */}
      <G transform="translate(60,60)">
        <Circle cx="15" cy="15" r="15" fill={PALETTE.honey[400]} opacity="0.15" />
        <Path d="M15 6l2.5 6.5H24l-5.5 4 2 6.5L15 19l-5.5 4 2-6.5-5.5-4h6.5z" fill={PALETTE.honey[500]} />
      </G>
      {/* 浮动图标：爱心 */}
      <G transform="translate(195,90)">
        <Circle cx="15" cy="15" r="15" fill={PALETTE.brand[200]} opacity="0.2" />
        <Path
          d="M15 22C15 22 6 16 6 11C6 7 9 5 11.5 5C13.5 5 15 7 15 7C15 7 16.5 5 18.5 5C21 5 24 7 24 11C24 16 15 22 15 22Z"
          fill={PALETTE.brand[500]}
        />
      </G>
      {/* 浮动图标：相机 */}
      <G transform="translate(50,150)">
        <Circle cx="15" cy="15" r="15" fill={PALETTE.sage[100]} opacity="0.5" />
        <Rect x="7" y="11" width="16" height="11" rx="2" fill={PALETTE.sage[500]} />
        <Circle cx="15" cy="16.5" r="3.5" fill="#fff" />
        <Rect x="11" y="9" width="4" height="2" rx="0.5" fill={PALETTE.sage[500]} />
      </G>
      {/* 小亮点 */}
      <Circle cx="200" cy="180" r="3" fill={PALETTE.honey[400]} opacity="0.6" />
      <Circle cx="40" cy="100" r="2.5" fill={PALETTE.brand[300]} opacity="0.5" />
      <Circle cx="220" cy="50" r="2" fill={PALETTE.sage[300]} opacity="0.6" />
    </Svg>
  );
}

// 心情天气：太阳 + 云朵插画
export function SunCloudArt({ size = 90 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90" fill="none">
      <Circle cx="40" cy="45" r="22" fill="#FDF2EE" />
      <G stroke="#FDF2EE" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <Line x1="40" y1="10" x2="40" y2="18" />
        <Line x1="40" y1="72" x2="40" y2="80" />
        <Line x1="10" y1="45" x2="18" y2="45" />
        <Line x1="62" y1="45" x2="70" y2="45" />
        <Line x1="18" y1="23" x2="24" y2="29" />
        <Line x1="56" y1="61" x2="62" y2="67" />
        <Line x1="18" y1="67" x2="24" y2="61" />
        <Line x1="56" y1="29" x2="62" y2="23" />
      </G>
      <Ellipse cx="55" cy="55" rx="22" ry="14" fill="#fff" opacity="0.9" />
      <Ellipse cx="45" cy="52" rx="14" ry="11" fill="#fff" opacity="0.9" />
      <Ellipse cx="65" cy="52" rx="12" ry="10" fill="#fff" opacity="0.9" />
    </Svg>
  );
}

const styles = StyleSheet.create({});
