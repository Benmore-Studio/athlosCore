import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import gameService, { type GameWithDetails } from '@/services/api/gameService';
import * as Sentry from '@sentry/react-native';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentColors } = useTheme();
  const router = useRouter();

  const [game, setGame] = useState<GameWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGameData();
    }
  }, [id]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading game data for ID:', id);
      const gameData = await gameService.getGameById(id);
      setGame(gameData);

      console.log('✅ Game loaded:', gameData.home_team_name, 'vs', gameData.away_team_name);
    } catch (err) {
      console.error('❌ Failed to load game:', err);
      setError('Failed to load game');

      Sentry.captureException(err, {
        tags: { screen: 'game_detail', action: 'load_game' },
        extra: { gameId: id }
      });

      Alert.alert(
        'Unable to Load Game',
        'Could not connect to the server. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadGameData },
          { text: 'Go Back', onPress: () => router.back(), style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#10B981'; // Green
      case 'in_progress':
        return '#F59E0B'; // Orange
      case 'upcoming':
        return '#3B82F6'; // Blue
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return currentColors.textSecondary;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Final';
      case 'in_progress':
        return 'Live';
      case 'upcoming':
        return 'Scheduled';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Game Details',
            headerShown: true,
            headerStyle: { backgroundColor: currentColors.cardBackground },
            headerTintColor: currentColors.text,
          }}
        />
        <SafeAreaView
          style={[styles.container, { backgroundColor: currentColors.background }]}
          edges={['bottom']}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentColors.primary} />
            <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
              Loading game...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Game Details',
            headerShown: true,
            headerStyle: { backgroundColor: currentColors.cardBackground },
            headerTintColor: currentColors.text,
          }}
        />
        <SafeAreaView
          style={[styles.container, { backgroundColor: currentColors.background }]}
          edges={['bottom']}
        >
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={currentColors.error} />
            <Text style={[styles.errorTitle, { color: currentColors.text }]}>
              Failed to Load Game
            </Text>
            <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
              {error || 'Game not found'}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${game.home_team_name} vs ${game.away_team_name}`,
          headerShown: true,
          headerStyle: { backgroundColor: currentColors.cardBackground },
          headerTintColor: currentColors.text,
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: currentColors.background }]}
        edges={['bottom']}
      >
        <ScrollView style={styles.content}>
          {/* Game Header */}
          <Card variant="elevated" padding="large" style={styles.card}>
            <View style={styles.header}>
              <IconSymbol name="sportscourt.fill" size={60} color={currentColors.primary} />
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(game.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(game.status) }]}>
                  {getStatusText(game.status)}
                </Text>
              </View>
            </View>

            {/* Teams and Score */}
            <View style={styles.teamsContainer}>
              <View style={styles.teamSection}>
                <Text style={[styles.teamName, { color: currentColors.text }]}>
                  {game.home_team_name}
                </Text>
                <Text style={[styles.teamLabel, { color: currentColors.textSecondary }]}>
                  Home
                </Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={[styles.score, { color: currentColors.text }]}>
                  {game.home_score}
                </Text>
                <Text style={[styles.scoreSeparator, { color: currentColors.textSecondary }]}>
                  -
                </Text>
                <Text style={[styles.score, { color: currentColors.text }]}>
                  {game.away_score}
                </Text>
              </View>

              <View style={styles.teamSection}>
                <Text style={[styles.teamName, { color: currentColors.text }]}>
                  {game.away_team_name}
                </Text>
                <Text style={[styles.teamLabel, { color: currentColors.textSecondary }]}>
                  Away
                </Text>
              </View>
            </View>

            {/* Game Info */}
            <View style={styles.gameInfo}>
              <View style={styles.infoRow}>
                <IconSymbol name="calendar" size={16} color={currentColors.textSecondary} />
                <Text style={[styles.infoText, { color: currentColors.textSecondary }]}>
                  {formatDate(game.game_date)}
                </Text>
              </View>
              {game.venue && (
                <View style={styles.infoRow}>
                  <IconSymbol name="location.fill" size={16} color={currentColors.textSecondary} />
                  <Text style={[styles.infoText, { color: currentColors.textSecondary }]}>
                    {game.venue}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Notes */}
          {game.notes && (
            <Card variant="outlined" padding="large" style={styles.card}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="doc.text.fill" size={20} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Notes
                </Text>
              </View>
              <Text style={[styles.notesText, { color: currentColors.textSecondary }]}>
                {game.notes}
              </Text>
            </Card>
          )}

          {/* Video */}
          {game.video_id && (
            <Card variant="outlined" padding="large" style={styles.card}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="video.fill" size={20} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Game Video
                </Text>
              </View>
              <Text style={[styles.placeholder, { color: currentColors.textSecondary }]}>
                Video ID: {game.video_id}
              </Text>
            </Card>
          )}

          {/* Box Score Placeholder */}
          {game.box_score && (
            <Card variant="outlined" padding="large" style={styles.card}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="chart.bar.fill" size={20} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Box Score
                </Text>
              </View>
              <Text style={[styles.placeholder, { color: currentColors.textSecondary }]}>
                Detailed box score statistics will be displayed here
              </Text>
            </Card>
          )}

          {/* Highlights Placeholder */}
          {game.highlights && game.highlights.length > 0 && (
            <Card variant="outlined" padding="large" style={styles.card}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="star.fill" size={20} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Highlights
                </Text>
              </View>
              <Text style={[styles.placeholder, { color: currentColors.textSecondary }]}>
                {game.highlights.length} highlights available
              </Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  teamLabel: {
    fontSize: Typography.footnote,
    textTransform: 'uppercase',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreSeparator: {
    fontSize: Typography.title1,
    fontWeight: '300',
  },
  gameInfo: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: Typography.callout,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  notesText: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.5,
  },
  placeholder: {
    fontSize: Typography.body,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.body,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
  },
});
