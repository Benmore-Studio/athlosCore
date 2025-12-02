import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export interface TopPerformer {
  playerId: string;
  name: string;
  jerseyNumber: number;
  avatarUrl?: string;
  statLabel: string;
  statValue: number;
  statUnit?: string;
  trend?: 'up' | 'down' | 'stable';
  position?: string;
}

interface TopPerformersCardProps {
  performers: TopPerformer[];
  onPlayerPress?: (playerId: string) => void;
  onViewAll?: () => void;
  animationDelay?: number;
}

export default function TopPerformersCard({
  performers,
  onPlayerPress,
  onViewAll,
  animationDelay = 350,
}: TopPerformersCardProps) {
  const { currentColors } = useTheme();

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'arrow.up';
      case 'down': return 'arrow.down';
      default: return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return Colors.success;
      case 'down': return Colors.error;
      default: return currentColors.textSecondary;
    }
  };

  if (performers.length === 0) {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol name="trophy.fill" size={18} color={Colors.warning} />
            <Text style={[styles.title, { color: currentColors.text }]}>
              Top Performers
            </Text>
          </View>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: currentColors.cardBackground }]}>
          <IconSymbol name="person.3" size={28} color={currentColors.textLight} />
          <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
            Player stats will appear after game analysis
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(400)}
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Top performing players"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="trophy.fill" size={18} color={Colors.warning} />
          <Text style={[styles.title, { color: currentColors.text }]}>
            Top Performers
          </Text>
        </View>
        {onViewAll && (
          <TouchableOpacity
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel="View all players"
          >
            <Text style={[styles.viewAll, { color: Colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll of Players */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {performers.map((performer, index) => (
          <Animated.View
            key={performer.playerId}
            entering={FadeInRight.delay(animationDelay + 100 + index * 80).duration(400)}
          >
            <TouchableOpacity
              style={[styles.playerCard, { backgroundColor: currentColors.cardBackground }]}
              onPress={() => onPlayerPress?.(performer.playerId)}
              activeOpacity={onPlayerPress ? 0.7 : 1}
              accessibilityRole="button"
              accessibilityLabel={`${performer.name}, ${performer.statValue} ${performer.statLabel}`}
            >
              {/* Rank Badge */}
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>

              {/* Player Avatar */}
              <PlayerAvatar
                name={performer.name}
                imageUri={performer.avatarUrl}
                jerseyNumber={performer.jerseyNumber.toString()}
                size="medium"
                variant="default"
              />

              {/* Player Name */}
              <Text
                style={[styles.playerName, { color: currentColors.text }]}
                numberOfLines={1}
              >
                {performer.name.split(' ')[0]}
              </Text>

              {/* Stat Value */}
              <View style={styles.statContainer}>
                <Text style={[styles.statValue, { color: currentColors.primary }]}>
                  {performer.statValue}
                  {performer.statUnit && (
                    <Text style={styles.statUnit}>{performer.statUnit}</Text>
                  )}
                </Text>
                {performer.trend && getTrendIcon(performer.trend) && (
                  <IconSymbol
                    name={getTrendIcon(performer.trend)!}
                    size={10}
                    color={getTrendColor(performer.trend)}
                  />
                )}
              </View>

              {/* Stat Label */}
              <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                {performer.statLabel}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function getRankColor(index: number): string {
  switch (index) {
    case 0: return '#FFD700'; // Gold
    case 1: return '#C0C0C0'; // Silver
    case 2: return '#CD7F32'; // Bronze
    default: return Colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  playerCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  rankBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: '#000',
  },
  playerName: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: Typography.caption,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  emptyText: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },
});
