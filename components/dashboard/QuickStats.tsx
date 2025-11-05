// File: components/dashboard/QuickStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ Added: Import theme context
import { Spacing, Typography } from '@/constants/theme';

interface Stat {
  icon: string;
  value: string | number;
  label: string;
}

interface QuickStatsProps {
  stats: Stat[];
  currentColors?: any; // ✅ Changed: Made optional for backward compatibility
}

export default function QuickStats({ stats, currentColors: propsColors }: QuickStatsProps) {
  const { currentColors: contextColors } = useTheme(); // ✅ Added: Get colors from theme context
  const currentColors = propsColors || contextColors; // ✅ Added: Use props if provided, otherwise use context

  return (
    <Animated.View 
      entering={FadeInUp.delay(800).springify()}
      style={styles.container}
    >
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <Card key={index} variant="glass" padding="medium" style={styles.card}>
            <IconSymbol name={stat.icon} size={24} color={currentColors.primary} />
            <Text style={[styles.value, { color: currentColors.text }]}>{stat.value}</Text>
            <Text style={[styles.label, { color: currentColors.textSecondary }]}>{stat.label}</Text>
          </Card>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: '8.5%',
  },
  value: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xs / 2,
  },
});