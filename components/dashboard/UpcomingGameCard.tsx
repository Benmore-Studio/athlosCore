import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export interface UpcomingGame {
  gameId: string;
  opponent: string;
  opponentTeamId?: string;
  dateTime: Date;
  venue: string;
  isHome: boolean;
}

interface UpcomingGameCardProps {
  game: UpcomingGame | null;
  onPress?: () => void;
  onScoutReport?: () => void;
  animationDelay?: number;
}

export default function UpcomingGameCard({
  game,
  onPress,
  onScoutReport,
  animationDelay = 400,
}: UpcomingGameCardProps) {
  const { currentColors, isDarkMode } = useTheme();

  const formatDate = (date: Date) => {
    const now = new Date();
    const gameDate = new Date(date);
    const diffTime = gameDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return gameDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return gameDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCountdown = (date: Date) => {
    const now = new Date();
    const gameDate = new Date(date);
    const diffTime = gameDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return 'Soon';
    }
  };

  if (!game) {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol name="calendar" size={18} color={currentColors.primary} />
            <Text style={[styles.title, { color: currentColors.text }]}>
              Next Game
            </Text>
          </View>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: currentColors.cardBackground }]}>
          <IconSymbol name="calendar.badge.plus" size={28} color={currentColors.textLight} />
          <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
            No upcoming games scheduled
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
      accessibilityLabel={`Next game: ${game.isHome ? 'Home' : 'Away'} vs ${game.opponent}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="calendar" size={18} color={currentColors.primary} />
          <Text style={[styles.title, { color: currentColors.text }]}>
            Next Game
          </Text>
        </View>
        <View style={[styles.countdownBadge, { backgroundColor: Colors.primary + '20' }]}>
          <IconSymbol name="clock.fill" size={12} color={Colors.primary} />
          <Text style={[styles.countdownText, { color: Colors.primary }]}>
            {getCountdown(game.dateTime)}
          </Text>
        </View>
      </View>

      {/* Game Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: currentColors.cardBackground }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={`${game.isHome ? 'Home' : 'Away'} game vs ${game.opponent}, ${formatDate(game.dateTime)} at ${formatTime(game.dateTime)}, ${game.venue}`}
      >
        {/* Home/Away Badge */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.homeAwayBadge,
              { backgroundColor: game.isHome ? Colors.success + '20' : Colors.info + '20' },
            ]}
          >
            <Text
              style={[
                styles.homeAwayText,
                { color: game.isHome ? Colors.success : Colors.info },
              ]}
            >
              {game.isHome ? 'HOME' : 'AWAY'}
            </Text>
          </View>
        </View>

        {/* Opponent */}
        <View style={styles.opponentRow}>
          <Text style={[styles.vsText, { color: currentColors.textSecondary }]}>vs</Text>
          <Text style={[styles.opponentName, { color: currentColors.text }]}>
            {game.opponent}
          </Text>
        </View>

        {/* Date & Time */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <IconSymbol name="calendar" size={14} color={currentColors.textSecondary} />
            <Text style={[styles.detailText, { color: currentColors.textSecondary }]}>
              {formatDate(game.dateTime)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <IconSymbol name="clock" size={14} color={currentColors.textSecondary} />
            <Text style={[styles.detailText, { color: currentColors.textSecondary }]}>
              {formatTime(game.dateTime)}
            </Text>
          </View>
        </View>

        {/* Venue */}
        <View style={styles.venueRow}>
          <IconSymbol name="mappin.circle.fill" size={14} color={currentColors.textLight} />
          <Text
            style={[styles.venueText, { color: currentColors.textSecondary }]}
            numberOfLines={1}
          >
            {game.venue}
          </Text>
        </View>

        {/* Action Buttons */}
        {onScoutReport && (
          <View style={[styles.actionsRow, { borderTopColor: currentColors.border }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onScoutReport}
              accessibilityRole="button"
              accessibilityLabel="View scout report"
            >
              <IconSymbol name="doc.text.fill" size={16} color={Colors.primary} />
              <Text style={[styles.actionText, { color: Colors.primary }]}>
                Scout Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countdownText: {
    fontSize: Typography.caption,
    fontWeight: '700',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  homeAwayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  homeAwayText: {
    fontSize: Typography.caption,
    fontWeight: '700',
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vsText: {
    fontSize: Typography.subhead,
    fontWeight: '500',
  },
  opponentName: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.subhead,
    fontWeight: '500',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  venueText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  emptyCard: {
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
