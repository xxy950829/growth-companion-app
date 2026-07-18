import React from 'react';
import { Svg, G, Circle, Path, Line, Polyline, Polygon } from 'react-native-svg';

// Lucide 风格线性图标集（24x24 viewBox，stroke 2，圆角端点）
// 仅收录本应用需要的图标，避免引入额外依赖

export type IconName =
  | 'star'
  | 'baby'
  | 'sun'
  | 'user'
  | 'users'
  | 'plus'
  | 'check'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-left'
  | 'filter'
  | 'ruler'
  | 'scale'
  | 'smile'
  | 'laugh'
  | 'camera'
  | 'clock'
  | 'heart'
  | 'settings'
  | 'bell'
  | 'download'
  | 'help-circle'
  | 'message-circle'
  | 'x'
  | 'sparkles'
  | 'edit'
  | 'trash'
  | 'info'
  | 'log-out'
  | 'moon'
  | 'cloud'
  | 'cloud-rain'
  | 'zap'
  | 'palette';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

// 渲染单个图标的内部路径（均不设 stroke，由外层 G 统一控制）
function IconPaths({ name }: { name: IconName }) {
  switch (name) {
    case 'star':
      return <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />;
    case 'baby':
      return (
        <>
          <Path d="M9 12h.01" />
          <Path d="M15 12h.01" />
          <Path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
          <Path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3 1 4 3" />
          <Path d="M12 3a2 2 0 0 0-2 2c0 1 1 2 2 2" />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx="12" cy="12" r="4" />
          <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </>
      );
    case 'moon':
      return <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
    case 'user':
      return (
        <>
          <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </>
      );
    case 'users':
      return (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </>
      );
    case 'check':
      return <Polyline points="20 6 9 17 4 12" />;
    case 'chevron-right':
      return <Polyline points="9 18 15 12 9 6" />;
    case 'chevron-left':
      return <Polyline points="15 18 9 12 15 6" />;
    case 'chevron-down':
      return <Polyline points="6 9 12 15 18 9" />;
    case 'arrow-right':
      return (
        <>
          <Line x1="5" y1="12" x2="19" y2="12" />
          <Polyline points="12 5 19 12 12 19" />
        </>
      );
    case 'arrow-left':
      return (
        <>
          <Line x1="19" y1="12" x2="5" y2="12" />
          <Polyline points="12 19 5 12 12 5" />
        </>
      );
    case 'filter':
      return <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46" />;
    case 'ruler':
      return (
        <>
          <Path d="M21.3 8.7L8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z" />
          <Path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />
        </>
      );
    case 'scale':
      return (
        <>
          <Path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <Path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <Path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </>
      );
    case 'smile':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <Line x1="9" y1="9" x2="9.01" y2="9" />
          <Line x1="15" y1="9" x2="15.01" y2="9" />
        </>
      );
    case 'laugh':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M8 14a4 4 0 0 0 8 0" />
          <Line x1="9" y1="9" x2="9.01" y2="9" />
          <Line x1="15" y1="9" x2="15.01" y2="9" />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Polyline points="12 6 12 12 16 14" />
        </>
      );
    case 'heart':
      return <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />;
    case 'settings':
      return (
        <>
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <Circle cx="12" cy="12" r="3" />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </>
      );
    case 'download':
      return (
        <>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Polyline points="7 10 12 15 17 10" />
          <Line x1="12" y1="15" x2="12" y2="3" />
        </>
      );
    case 'help-circle':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="16" x2="12" y2="12" />
          <Line x1="12" y1="8" x2="12.01" y2="8" />
        </>
      );
    case 'message-circle':
      return <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />;
    case 'x':
      return (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </>
      );
    case 'sparkles':
      return <Path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM5 3v4M3 5h4M19 17v4M17 19h4" />;
    case 'edit':
      return (
        <>
          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <Path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </>
      );
    case 'trash':
      return (
        <>
          <Polyline points="3 6 5 6 21 6" />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
      );
    case 'log-out':
      return (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </>
      );
    case 'cloud':
      return <Path d="M17.5 19a4.5 4.5 0 1 0 0-9 6 6 0 0 0-11.7 1.5A4 4 0 0 0 6 19h11.5z" />;
    case 'cloud-rain':
      return (
        <>
          <Path d="M16 13a4 4 0 1 0 0-8 5.5 5.5 0 0 0-10.6 1.4A3.5 3.5 0 0 0 5.5 13H16z" />
          <Path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
        </>
      );
    case 'zap':
      return <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />;
    case 'palette':
      return (
        <>
          <Circle cx="13.5" cy="6.5" r=".7" />
          <Circle cx="17.5" cy="10.5" r=".7" />
          <Circle cx="8.5" cy="7.5" r=".7" />
          <Circle cx="6.5" cy="12.5" r=".7" />
          <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </>
      );
    default:
      return null;
  }
}

export function Icon({ name, size = 24, color = '#2D2420', fill, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'}>
      <G
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill || 'none'}
      >
        <IconPaths name={name} />
      </G>
    </Svg>
  );
}
