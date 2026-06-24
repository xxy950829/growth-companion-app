import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '@/utils/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.rule,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="archive"
        options={{
          title: '成长档案',
          tabBarIcon: ({ size }) => <TabIcon icon="📚" size={size} />,
        }}
      />
      <Tabs.Screen
        name="planet"
        options={{
          title: '成长星球',
          tabBarIcon: ({ size }) => <TabIcon icon="🪐" size={size} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: '心情天气',
          tabBarIcon: ({ size }) => <TabIcon icon="🌤️" size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人中心',
          tabBarIcon: ({ size }) => <TabIcon icon="👤" size={size} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, size }: { icon: string; size: number }) {
  return <Text style={{ fontSize: Math.max(size - 4, 16) }}>{icon}</Text>;
}
