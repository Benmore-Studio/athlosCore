import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import playerService, { type Player } from '@/services/api/playerService';
import * as Sentry from '@sentry/react-native';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentColors } = useTheme();
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlayerData();
    }
  }, [id]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading player data for ID:', id);
      const playerData = await playerService.getPlayerById(id, true); // Include stats
      setPlayer(playerData);

      console.log('✅ Player loaded:', playerData.name || 'Unnamed');
    } catch (err) {
      console.error('❌ Failed to load player:', err);
      setError('Failed to load player');

      Sentry.captureException(err, {
        tags: { screen: 'player_detail', action: 'load_player' },
        extra: { playerId: id }
      });

      Alert.alert(
        'Unable to Load Player',
        'Could not connect to the server. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadPlayerData },
          { text: 'Go Back', onPress: () => router.back(), style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatStat = (made: number, attempted: number): string => {
    if (attempted === 0) return '0/0 (0%)';
    const percentage = ((made / attempted) * 100).toFixed(1);
    return `${made}/${attempted} (${percentage}%)`;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Player Profile',
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
              Loading player...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Player Profile',
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
              Failed to Load Player
            </Text>
            <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
              {error || 'Player not found'}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const stats = player.stats;

  return (
    <>
      <Stack.Screen
        options={{
          title: player.name || 'Player Profile',
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
          {/* Player Header */}
          <Card variant="elevated" padding="large" style={styles.card}>
            <View style={styles.header}>
              <IconSymbol name="person.circle.fill" size={80} color={currentColors.primary} />
              <Text style={[styles.title, { color: currentColors.text }]}>
                {player.name || 'Unnamed Player'}
              </Text>
              {player.player_number !== undefined && (
                <Text style={[styles.playerNumber, { color: currentColors.textSecondary }]}>
                  #{player.player_number}
                </Text>
              )}
            </View>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card variant="elevated" padding="large" style={styles.card}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="chart.bar.fill" size={24} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Statistics
                </Text>
              </View>

              {/* Shooting Stats */}
              <View style={styles.statsSection}>
                <Text style={[styles.statsSubtitle, { color: currentColors.text }]}>
                  Shooting
                </Text>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    2-Point:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {formatStat(stats.two_point_made, stats.two_point_att)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    3-Point:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {formatStat(stats.three_point_made, stats.three_point_att)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Free Throw:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {formatStat(stats.free_throw_made, stats.free_throw_att)}
                  </Text>
                </View>
              </View>

              {/* Rebounds */}
              <View style={styles.statsSection}>
                <Text style={[styles.statsSubtitle, { color: currentColors.text }]}>
                  Rebounds
                </Text>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Offensive:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.offensive_rebounds}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Defensive:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.defensive_rebounds}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Total:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.offensive_rebounds + stats.defensive_rebounds}
                  </Text>
                </View>
              </View>

              {/* Other Stats */}
              <View style={styles.statsSection}>
                <Text style={[styles.statsSubtitle, { color: currentColors.text }]}>
                  Other Stats
                </Text>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Assists:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.assists}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Steals:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.steals}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Blocks:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.blocks}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Turnovers:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.turnovers}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>
                    Fouls:
                  </Text>
                  <Text style={[styles.statValue, { color: currentColors.text }]}>
                    {stats.fouls}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* No Stats Available */}
          {!stats && (
            <Card variant="outlined" padding="large" style={styles.card}>
              <View style={styles.emptyState}>
                <IconSymbol name="chart.bar.xaxis" size={48} color={currentColors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: currentColors.textSecondary }]}>
                  No statistics available for this player
                </Text>
              </View>
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
  title: {
    fontSize: Typography.title1,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  playerNumber: {
    fontSize: Typography.title3,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
  statsSubtitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.callout,
  },
  statValue: {
    fontSize: Typography.callout,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyStateText: {
    fontSize: Typography.body,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
