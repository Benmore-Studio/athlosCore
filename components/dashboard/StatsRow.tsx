import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface StatItem {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

interface StatsRowProps {
  stats: StatItem[];
  layout?: 'horizontal' | 'compact';
  animationDelay?: number;
}

export default function StatsRow({
  stats,
  layout = 'horizontal',
  animationDelay = 200,
}: StatsRowProps) {
  const { currentColors } = useTheme();

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return Colors.success;
      case 'down': return Colors.error;
      default: return currentColors.textSecondary;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '';
    }
  };

  if (layout === 'compact') {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={[styles.compactContainer, { backgroundColor: currentColors.cardBackground }]}
        accessibilityRole="summary"
        accessibilityLabel={`Team statistics: ${stats.map(s => `${s.label} ${s.value}`).join(', ')}`}
      >
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <View style={styles.compactStat}>
              <Text style={[styles.compactValue, { color: currentColors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.compactLabel, { color: currentColors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
            {index < stats.length - 1 && (
              <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            )}
          </React.Fragment>
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(400)}
      accessibilityRole="summary"
      accessibilityLabel={`Team statistics: ${stats.map(s => `${s.label} ${s.value}`).join(', ')}`}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {stats.map((stat, index) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              { backgroundColor: currentColors.cardBackground },
              index === 0 && styles.firstCard,
            ]}
          >
            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: currentColors.text }]}>
                {stat.value}
              </Text>
              {stat.trend && stat.trendValue && (
                <Text style={[styles.trend, { color: getTrendColor(stat.trend) }]}>
                  {getTrendIcon(stat.trend)} {stat.trendValue}
                </Text>
              )}
            </View>
            <Text style={[styles.label, { color: currentColors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  firstCard: {
    marginLeft: 0,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  value: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  trend: {
    fontSize: Typography.caption,
    fontWeight: '600',
  },
  label: {
    fontSize: Typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  // Compact layout styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  compactStat: {
    alignItems: 'center',
    flex: 1,
  },
  compactValue: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
