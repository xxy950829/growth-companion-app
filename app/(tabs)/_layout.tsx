import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS, PALETTE } from '@/utils/constants';
import { Icon, IconName } from '@/components/ui/Icon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: PALETTE.text[400],
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopColor: COLORS.rule,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="archive"
        options={{
          title: '档案',
          tabBarIcon: ({ color }) => <TabIcon name="baby" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planet"
        options={{
          title: '星球',
          tabBarIcon: ({ color }) => <TabIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: '天气',
          tabBarIcon: ({ color }) => <TabIcon name="sun" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <Icon name={name} size={23} color={color} strokeWidth={2} />;
}
