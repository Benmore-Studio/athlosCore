import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  imageUri?: string;
}

interface PlayerStats {
  player_id: string;
  points: number;
  rebounds: number;
  assists: number;
  field_goals_made: number;
  field_goals_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  turnovers: number;
  minutes_played: number;
}

interface PlayerComparisonProps {
  players: Player[];
  playerStats: Map<string, PlayerStats>;
  onClose: () => void;
}

const MAX_PLAYERS = 3;
const COMPARISON_COLORS = ['#E97A42', '#3B82F6', '#10B981'];

export default function PlayerComparison({
  players,
  playerStats,
  onClose,
}: PlayerComparisonProps) {
  const { currentColors, isDark } = useTheme();
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < MAX_PLAYERS) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const getPlayerStats = (playerId: string): PlayerStats | undefined => {
    return playerStats.get(playerId);
  };

  const getFieldGoalPercentage = (stats: PlayerStats): number => {
    if (stats.field_goals_attempted === 0) return 0;
    return Math.round((stats.field_goals_made / stats.field_goals_attempted) * 100);
  };

  const getFreeThrowPercentage = (stats: PlayerStats): number => {
    if (stats.free_throws_attempted === 0) return 0;
    return Math.round((stats.free_throws_made / stats.free_throws_attempted) * 100);
  };

  const getMaxValue = (statKey: keyof PlayerStats): number => {
    let max = 0;
    selectedPlayers.forEach(player => {
      const stats = getPlayerStats(player.id);
      if (stats) {
        const value = typeof stats[statKey] === 'number' ? stats[statKey] as number : 0;
        max = Math.max(max, value);
      }
    });
    return max || 1;
  };

  const getPercentageWidth = (value: number, maxValue: number): number => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  const comparisonMetrics = [
    { key: 'points' as const, label: 'Points', icon: 'star.fill', unit: '' },
    { key: 'rebounds' as const, label: 'Rebounds', icon: 'arrow.up.circle.fill', unit: '' },
    { key: 'assists' as const, label: 'Assists', icon: 'hand.point.up.fill', unit: '' },
    { key: 'turnovers' as const, label: 'Turnovers', icon: 'exclamationmark.triangle.fill', unit: '', isNegative: true },
    { key: 'minutes_played' as const, label: 'Minutes', icon: 'clock.fill', unit: '' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.header, { backgroundColor: currentColors.cardBackground }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.headerIcon, Shadows.primaryGlow]}
              >
                <IconSymbol name="chart.bar.xaxis" size={24} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: currentColors.text }]}>
                  Compare Players
                </Text>
                <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
                  Select up to {MAX_PLAYERS} players
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={32} color={currentColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player Selection */}
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Select Players
            </Text>
            <View style={[styles.counterBadge, { backgroundColor: currentColors.primary }]}>
              <Text style={styles.counterText}>
                {selectedPlayers.length}/{MAX_PLAYERS}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerScroll}
          >
            {players.map((player, index) => {
              const isSelected = selectedPlayers.find(p => p.id === player.id);
              const selectedIndex = selectedPlayers.findIndex(p => p.id === player.id);
              const color = selectedIndex !== -1 ? COMPARISON_COLORS[selectedIndex] : undefined;

              return (
                <Animated.View
                  key={player.id}
                  entering={ZoomIn.delay(300 + index * 50).springify()}
                >
                  <TouchableOpacity
                    onPress={() => handlePlayerSelect(player)}
                    disabled={!isSelected && selectedPlayers.length >= MAX_PLAYERS}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.playerCard,
                        { backgroundColor: currentColors.cardBackground },
                        isSelected && { borderColor: color, borderWidth: 3 },
                        !isSelected && selectedPlayers.length >= MAX_PLAYERS && styles.playerCardDisabled,
                      ]}
                    >
                      <PlayerAvatar
                        name={player.name}
                        imageUri={player.imageUri}
                        jerseyNumber={player.jersey_number}
                        size="large"
                        variant={isSelected ? "glow" : "default"}
                      />
                      <Text
                        style={[
                          styles.playerName,
                          { color: currentColors.text },
                          !isSelected && selectedPlayers.length >= MAX_PLAYERS && { opacity: 0.4 }
                        ]}
                        numberOfLines={1}
                      >
                        {player.name.split(' ')[0]}
                      </Text>
                      <Text style={[styles.playerPosition, { color: currentColors.textSecondary }]}>
                        #{player.jersey_number}
                      </Text>
                      {isSelected && (
                        <View style={[styles.selectedBadge, { backgroundColor: color }]}>
                          <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Comparison Table */}
        {selectedPlayers.length >= 2 && (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Performance Comparison
              </Text>
            </View>

            {/* Player Headers */}
            <View style={styles.comparisonHeader}>
              <View style={styles.metricLabelColumn} />
              {selectedPlayers.map((player, index) => (
                <View key={player.id} style={styles.playerColumn}>
                  <View
                    style={[
                      styles.playerHeaderCard,
                      { backgroundColor: COMPARISON_COLORS[index] + '20' }
                    ]}
                  >
                    <PlayerAvatar
                      name={player.name}
                      imageUri={player.imageUri}
                      jerseyNumber={player.jersey_number}
                      size="small"
                      variant="default"
                    />
                    <Text
                      style={[styles.playerHeaderName, { color: currentColors.text }]}
                      numberOfLines={1}
                    >
                      {player.name.split(' ')[0]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Stats Rows */}
            <Card variant="elevated" padding="none" style={styles.comparisonTable}>
              {comparisonMetrics.map((metric, metricIndex) => {
                const maxValue = getMaxValue(metric.key);
                
                return (
                  <Animated.View
                    key={metric.key}
                    entering={SlideInRight.delay(500 + metricIndex * 100).springify()}
                  >
                    <View
                      style={[
                        styles.statRow,
                        metricIndex !== comparisonMetrics.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: currentColors.border
                        }
                      ]}
                    >
                      {/* Metric Label */}
                      <View style={styles.metricLabelColumn}>
                        <IconSymbol
                          name={metric.icon}
                          size={20}
                          color={metric.isNegative ? Colors.error : currentColors.primary}
                        />
                        <Text style={[styles.metricLabel, { color: currentColors.text }]}>
                          {metric.label}
                        </Text>
                      </View>

                      {/* Player Stats */}
                      {selectedPlayers.map((player, playerIndex) => {
                        const stats = getPlayerStats(player.id);
                        let value = stats ? (stats[metric.key] as number) : 0;
                        
                        // Handle percentages
                        if (metric.key === 'field_goals_made' && stats) {
                          value = getFieldGoalPercentage(stats);
                        } else if (metric.key === 'free_throws_made' && stats) {
                          value = getFreeThrowPercentage(stats);
                        }

                        const percentage = getPercentageWidth(value, maxValue);
                        const color = COMPARISON_COLORS[playerIndex];
                        const isHighest = value === maxValue && value > 0;

                        return (
                          <View key={player.id} style={styles.playerColumn}>
                            <View style={styles.statValueContainer}>
                              <Text
                                style={[
                                  styles.statValue,
                                  { color: currentColors.text },
                                  isHighest && styles.statValueHighest
                                ]}
                              >
                                {value}
                                {metric.unit}
                              </Text>
                              {isHighest && (
                                <IconSymbol
                                  name="crown.fill"
                                  size={14}
                                  color={Colors.warning}
                                />
                              )}
                            </View>
                            <View style={[styles.barBackground, { backgroundColor: currentColors.surface }]}>
                              <Animated.View
                                entering={FadeIn.delay(600 + metricIndex * 100).duration(400)}
                                style={[
                                  styles.bar,
                                  {
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                  }
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </Animated.View>
                );
              })}
            </Card>

            {/* Percentage Stats */}
            <Animated.View entering={FadeInDown.delay(800).springify()}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Shooting Percentages
                </Text>
              </View>

              <Card variant="elevated" padding="large" style={styles.percentageCard}>
                <View style={styles.percentageGrid}>
                  {/* FG% */}
                  <View style={styles.percentageSection}>
                    <Text style={[styles.percentageLabel, { color: currentColors.textSecondary }]}>
                      Field Goal %
                    </Text>
                    <View style={styles.percentageValues}>
                      {selectedPlayers.map((player, index) => {
                        const stats = getPlayerStats(player.id);
                        const fgPercent = stats ? getFieldGoalPercentage(stats) : 0;
                        const color = COMPARISON_COLORS[index];

                        return (
                          <View key={player.id} style={styles.percentageItem}>
                            <View
                              style={[
                                styles.percentageColorDot,
                                { backgroundColor: color }
                              ]}
                            />
                            <Text style={[styles.percentageValue, { color: currentColors.text }]}>
                              {fgPercent}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* FT% */}
                  <View style={styles.percentageSection}>
                    <Text style={[styles.percentageLabel, { color: currentColors.textSecondary }]}>
                      Free Throw %
                    </Text>
                    <View style={styles.percentageValues}>
                      {selectedPlayers.map((player, index) => {
                        const stats = getPlayerStats(player.id);
                        const ftPercent = stats ? getFreeThrowPercentage(stats) : 0;
                        const color = COMPARISON_COLORS[index];

                        return (
                          <View key={player.id} style={styles.percentageItem}>
                            <View
                              style={[
                                styles.percentageColorDot,
                                { backgroundColor: color }
                              ]}
                            />
                            <Text style={[styles.percentageValue, { color: currentColors.text }]}>
                              {ftPercent}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </Animated.View>
        )}

        {/* Empty State */}
        {selectedPlayers.length < 2 && (
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Card variant="elevated" padding="large" style={styles.emptyCard}>
              <IconSymbol name="person.2.fill" size={48} color={currentColors.textLight} />
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                Select at least 2 players
              </Text>
              <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
                Choose players from the list above to compare their performance side-by-side
              </Text>
            </Card>
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Shadows.small,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },

  headerSubtitle: {
    fontSize: Typography.callout,
    marginTop: 2,
  },

  closeButton: {
    padding: Spacing.xs,
  },

  content: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },

  counterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },

  counterText: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Player Selection
  playerScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },

  playerCard: {
    width: 120,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.medium,
  },

  playerCardDisabled: {
    opacity: 0.4,
  },

  playerName: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  playerPosition: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginTop: Spacing.xs / 2,
  },

  selectedBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    borderRadius: 12,
    ...Shadows.small,
  },

  // Comparison Table
  comparisonHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  metricLabelColumn: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  playerColumn: {
    flex: 1,
    alignItems: 'center',
  },

  playerHeaderCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
  },

  playerHeaderName: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    textAlign: 'center',
  },

  comparisonTable: {
    marginHorizontal: Spacing.xl,
    overflow: 'hidden',
  },

  statRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
    flex: 1,
  },

  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },

  statValueHighest: {
    fontSize: Typography.title3,
  },

  barBackground: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },

  // Percentage Stats
  percentageCard: {
    marginHorizontal: Spacing.xl,
  },

  percentageGrid: {
    gap: Spacing.lg,
  },

  percentageSection: {
    gap: Spacing.sm,
  },

  percentageLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  percentageValues: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },

  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  percentageColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  percentageValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },

  // Empty State
  emptyCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },

  emptyTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomSpacing: {
    height: Spacing.xxxl,
  },
});