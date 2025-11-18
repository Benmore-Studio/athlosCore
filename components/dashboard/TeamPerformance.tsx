import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ProgressIndicator from '@/components/ui/progressIndicator';
import { Spacing, Typography } from '@/constants/theme';

interface Stat {
  label: string;
  value: string;
  icon: string;
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
}

interface TeamPerformanceProps {
  winRate: number;
  stats: Stat[];
  onPress: () => void;
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function TeamPerformance({ 
  winRate, 
  stats, 
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: TeamPerformanceProps) {
  return (
    <Animated.View entering={SlideInLeft.delay(1800).springify()} style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress}
        // ✅ ADD: Card accessibility
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || 
          `Team performance: ${winRate} percent win rate`
        }
        accessibilityHint={accessibilityHint || "Tap to view detailed team analytics"}
      >
        <Card variant="gradient" padding="large">
          <View style={styles.header}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={'dark'} />
            <Text style={styles.title}>Team Performance</Text>
          </View>

          <View 
            style={styles.circle}
            accessible={true}
            accessibilityLabel={`Win rate: ${winRate} percent`}
          >
            <ProgressIndicator 
              progress={winRate}
              size={120}
              variant="default"
              color={'dark'}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              label="WIN RATE"
              animated
            />
          </View>

          <View 
            style={styles.stats}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Team statistics breakdown"
          >
            {stats.map((stat, index) => (
              <View 
                key={index} 
                style={styles.statItem}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={
                  stat.accessibilityLabel || 
                  `${stat.label}: ${stat.value}`
                }
              >
                <IconSymbol name={stat.icon} size={16} color={'dark'} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: 'dark',
  },
  circle: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  statValue: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: 'dark',
  },
  statLabel: {
    fontSize: Typography.caption,
    color: 'dark',
    fontWeight: '600',
  },
});