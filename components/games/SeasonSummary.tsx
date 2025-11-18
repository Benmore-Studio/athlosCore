import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ProgressIndicator from '@/components/ui/progressIndicator';
import { Spacing, Typography } from '@/constants/theme';

interface SeasonSummaryProps {
  team: {
    record: {
      wins: number;
      losses: number;
    };
    stats: {
      averagePoints: number;
      fieldGoalPercentage: number;
    };
  };
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
}

export default function SeasonSummary({ 
  team,
  accessibilityLabel,
}: SeasonSummaryProps) {
  const winPercentage = (team.record.wins / (team.record.wins + team.record.losses)) * 100;

  return (
    <Animated.View 
      entering={ZoomIn.delay(600).duration(800).springify()}
      // ✅ ADD: Card accessibility
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={
        accessibilityLabel || 
        `Season summary: Record ${team.record.wins} wins, ${team.record.losses} losses, ${winPercentage.toFixed(1)} percent win rate. Average ${team.stats.averagePoints} points per game. Field goal percentage: ${team.stats.fieldGoalPercentage} percent.`
      }
    >
      <Card variant="gradient" padding="large" style={styles.card}>
        <View style={styles.content}>
          <View 
            style={styles.left}
            accessible={false} // Parent handles accessibility
          >
            <ProgressIndicator
              progress={winPercentage}
              size={100}
              variant="default"
              color={'dark'}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              label="WIN %"
              animated
            />
          </View>
          
          <View 
            style={styles.right}
            accessible={false} // Parent handles accessibility
          >
            <Text style={styles.title}>Season Record</Text>
            <Text style={styles.record}>
              {team.record.wins}-{team.record.losses}
            </Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <IconSymbol name="star.fill" size={16} color={'dark'} />
                <Text style={styles.statText}>{team.stats.averagePoints} PPG</Text>
              </View>
              <View style={styles.stat}>
                <IconSymbol name="chart.bar.fill" size={16} color={'dark'} />
                <Text style={styles.statText}>{team.stats.fieldGoalPercentage}% FG</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  left: {
    alignItems: 'center',
  },
  right: {
    flex: 1,
  },
  title: {
    fontSize: Typography.callout,
    color: 'dark',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  record: {
    fontSize: Typography.title1,
    fontWeight: '900',
    color: 'dark',
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: 'dark',
  },
});