// File: app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/error-boundary';

export default function TabLayout() {
  const { currentColors } = useTheme();

  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: currentColors.primary, // ✅ Active tab icon color (orange)
          tabBarInactiveTintColor: currentColors.textSecondary, // ✅ Inactive tab icon color (gray)
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: currentColors.cardBackground,
            borderTopColor: currentColors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'Teams',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Games',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="sportscourt.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Videos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="video.fill" color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}