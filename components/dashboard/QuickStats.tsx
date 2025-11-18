import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';

interface Stat {
  icon: string;
  value: string | number;
  label: string;
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
}

interface QuickStatsProps {
  stats: Stat[];
  currentColors?: any;
  // ✅ NEW: Section accessibility
  sectionAccessibilityLabel?: string;
}

export default function QuickStats({ 
  stats, 
  currentColors: propsColors,
  sectionAccessibilityLabel,
}: QuickStatsProps) {
  const { currentColors: contextColors } = useTheme();
  const currentColors = propsColors || contextColors;

  return (
    <Animated.View 
      entering={FadeInUp.delay(800).springify()}
      style={styles.container}
      // ✅ ADD: Section accessibility
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={sectionAccessibilityLabel || "Quick statistics summary"}
    >
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            variant="glass" 
            padding="medium" 
            style={styles.card}
            // ✅ ADD: Each stat card accessibility
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={
              stat.accessibilityLabel || 
              `${stat.label}: ${stat.value}`
            }
          >
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