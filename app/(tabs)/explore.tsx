import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import { BorderRadius, Colors, Layout, Spacing, Typography } from '@/constants/theme';
import { Player, mockCoach, mockPlayers } from '@/data/mockData';
import { useResponsive } from '@/hooks/useResponsive';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlayerAnalytics() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(mockPlayers[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'season' | 'last5' | 'last10'>('season');
  const { isTablet, isLandscape } = useResponsive();

  const timeframes = [
    { id: 'season', label: 'Full Season' },
    { id: 'last10', label: 'Last 10 Games' },
    { id: 'last5', label: 'Last 5 Games' },
  ];

  const getPerformanceRating = (stat: number, type: 'points' | 'rebounds' | 'assists' | 'fg%' | 'ft%'): 'excellent' | 'good' | 'average' | 'needs-work' => {
    const thresholds = {
      points: { excellent: 20, good: 15, average: 10 },
      rebounds: { excellent: 8, good: 6, average: 4 },
      assists: { excellent: 6, good: 4, average: 2 },
      'fg%': { excellent: 50, good: 45, average: 40 },
      'ft%': { excellent: 80, good: 75, average: 70 },
    };

    const t = thresholds[type];
    if (stat >= t.excellent) return 'excellent';
    if (stat >= t.good) return 'good';
    if (stat >= t.average) return 'average';
    return 'needs-work';
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'excellent': return Colors.success;
      case 'good': return Colors.info;
      case 'average': return Colors.warning;
      case 'needs-work': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getPositionName = (pos: string): string => {
    const positions = {
      'PG': 'Point Guard',
      'SG': 'Shooting Guard',
      'SF': 'Small Forward',
      'PF': 'Power Forward',
      'C': 'Center'
    };
    return positions[pos as keyof typeof positions] || pos;
  };

  const getDevelopmentAreas = (player: Player): Array<{area: string; priority: 'high' | 'medium' | 'low'; recommendation: string}> => {
    const areas = [];

    if (player.stats.fieldGoalPercentage < 45) {
      areas.push({
        area: 'Shooting Accuracy',
        priority: 'high' as const,
        recommendation: 'Focus on form shooting and catch-and-shoot drills'
      });
    }

    if (player.stats.freeThrowPercentage < 75) {
      areas.push({
        area: 'Free Throw Shooting',
        priority: 'medium' as const,
        recommendation: 'Daily free throw routine with proper follow-through'
      });
    }

    if (player.stats.turnovers > 3) {
      areas.push({
        area: 'Ball Security',
        priority: 'high' as const,
        recommendation: 'Ball handling drills and decision-making training'
      });
    }

    if (player.position === 'PG' && player.stats.assists < 6) {
      areas.push({
        area: 'Playmaking',
        priority: 'medium' as const,
        recommendation: 'Court vision drills and assist-focused scrimmages'
      });
    }

    return areas.slice(0, 3); // Top 3 areas
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
            <Text style={styles.logoSubtext}>AthlosCore™</Text>
          </View>
          <View style={styles.coachInfo}>
            <PlayerAvatar
              name={mockCoach.name}
              imageUri={mockCoach.imageUri}
              size="medium"
              showJerseyNumber={false}
            />
            <Text style={styles.coachName}>{mockCoach.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Player Analytics</Text>
          <Text style={styles.screenSubtitle}>
            Individual performance metrics and development insights
          </Text>
        </View>

        {/* Player Selection */}
        <Card variant="elevated" style={styles.playerSelectionCard}>
          <Text style={styles.sectionTitle}>Select Player</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playerScrollView}
          >
            {mockPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => setSelectedPlayer(player)}
                style={[
                  styles.playerOption,
                  selectedPlayer.id === player.id && styles.selectedPlayerOption
                ]}
              >
                <PlayerAvatar
                  name={player.name}
                  imageUri={player.imageUri}
                  jerseyNumber={player.jerseyNumber}
                  size="medium"
                />
                <Text style={[
                  styles.playerOptionName,
                  selectedPlayer.id === player.id && styles.selectedPlayerOptionName
                ]}>
                  {player.name}
                </Text>
                <Text style={styles.playerPosition}>
                  #{player.jerseyNumber} • {player.position}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Timeframe Selection */}
        <View style={styles.timeframeContainer}>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.id}
              onPress={() => setSelectedTimeframe(timeframe.id as any)}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.id && styles.selectedTimeframeButton
              ]}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe.id && styles.selectedTimeframeText
              ]}>
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player Overview Card */}
        <Card variant="elevated" style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <PlayerAvatar
              name={selectedPlayer.name}
              imageUri={selectedPlayer.imageUri}
              jerseyNumber={selectedPlayer.jerseyNumber}
              size="large"
            />
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewName}>{selectedPlayer.name}</Text>
              <Text style={styles.overviewPosition}>
                #{selectedPlayer.jerseyNumber} • {getPositionName(selectedPlayer.position)}
              </Text>
              <Text style={styles.overviewMinutes}>
                {selectedPlayer.stats.minutesPlayed} min/game
              </Text>
            </View>
          </View>
        </Card>

        {/* Performance Metrics Grid */}
        <View style={[
          styles.metricsGrid,
          isTablet && isLandscape && styles.tabletMetricsGrid
        ]}>
          {/* Points */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol name="basketball.fill" size={24} color={Colors.primary} />
              <Text style={styles.metricTitle}>Points</Text>
            </View>
            <Text style={styles.metricValue}>{selectedPlayer.stats.points}</Text>
            <View style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(getPerformanceRating(selectedPlayer.stats.points, 'points')) }
            ]}>
              <Text style={styles.ratingText}>
                {getPerformanceRating(selectedPlayer.stats.points, 'points').toUpperCase()}
              </Text>
            </View>
          </Card>

          {/* Rebounds */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color={Colors.success} />
              <Text style={styles.metricTitle}>Rebounds</Text>
            </View>
            <Text style={styles.metricValue}>{selectedPlayer.stats.rebounds}</Text>
            <View style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(getPerformanceRating(selectedPlayer.stats.rebounds, 'rebounds')) }
            ]}>
              <Text style={styles.ratingText}>
                {getPerformanceRating(selectedPlayer.stats.rebounds, 'rebounds').toUpperCase()}
              </Text>
            </View>
          </Card>

          {/* Assists */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol name="hand.point.up.fill" size={24} color={Colors.info} />
              <Text style={styles.metricTitle}>Assists</Text>
            </View>
            <Text style={styles.metricValue}>{selectedPlayer.stats.assists}</Text>
            <View style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(getPerformanceRating(selectedPlayer.stats.assists, 'assists')) }
            ]}>
              <Text style={styles.ratingText}>
                {getPerformanceRating(selectedPlayer.stats.assists, 'assists').toUpperCase()}
              </Text>
            </View>
          </Card>

          {/* Field Goal % */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol name="target" size={24} color={Colors.warning} />
              <Text style={styles.metricTitle}>FG%</Text>
            </View>
            <Text style={styles.metricValue}>{selectedPlayer.stats.fieldGoalPercentage}%</Text>
            <View style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(getPerformanceRating(selectedPlayer.stats.fieldGoalPercentage, 'fg%')) }
            ]}>
              <Text style={styles.ratingText}>
                {getPerformanceRating(selectedPlayer.stats.fieldGoalPercentage, 'fg%').toUpperCase()}
              </Text>
            </View>
          </Card>
        </View>

        {/* Additional Stats */}
        <Card variant="elevated" style={styles.additionalStatsCard}>
          <Text style={styles.sectionTitle}>Additional Statistics</Text>
          <View style={styles.additionalStats}>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>Free Throw %</Text>
              <Text style={styles.additionalStatValue}>{selectedPlayer.stats.freeThrowPercentage}%</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>Turnovers</Text>
              <Text style={styles.additionalStatValue}>{selectedPlayer.stats.turnovers}</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>Minutes</Text>
              <Text style={styles.additionalStatValue}>{selectedPlayer.stats.minutesPlayed}</Text>
            </View>
          </View>
        </Card>

        {/* Development Recommendations */}
        <Card variant="elevated" style={styles.developmentCard}>
          <Text style={styles.sectionTitle}>Development Areas</Text>
          <Text style={styles.developmentSubtitle}>
            AI-powered recommendations for {selectedPlayer.name}
          </Text>

          {getDevelopmentAreas(selectedPlayer).map((area, index) => (
            <View key={index} style={styles.developmentArea}>
              <View style={styles.developmentHeader}>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: area.priority === 'high' ? Colors.error : area.priority === 'medium' ? Colors.warning : Colors.info }
                ]}>
                  <Text style={styles.priorityText}>{area.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.developmentAreaTitle}>{area.area}</Text>
              </View>
              <Text style={styles.developmentRecommendation}>
                {area.recommendation}
              </Text>
            </View>
          ))}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Export Report"
            onPress={() => console.log('Export report for:', selectedPlayer.name)}
            variant="primary"
            size="medium"
            style={styles.exportButton}
          />
          <Button
            title="Share Analysis"
            onPress={() => console.log('Share analysis for:', selectedPlayer.name)}
            variant="outline"
            size="medium"
            style={styles.shareButton}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.headerBackground,
    paddingVertical: Spacing.lg,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    fontSize: Typography.title1,
    fontWeight: '800',
    color: Colors.headerText,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },

  logoSubtext: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.headerText,
    letterSpacing: 1,
  },

  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  coachName: {
    fontSize: Typography.callout,
    fontWeight: '500',
    color: Colors.headerText,
    marginLeft: Spacing.sm,
  },

  content: {
    flex: 1,
  },

  titleSection: {
    padding: Spacing.screenPadding,
    alignItems: 'center',
  },

  screenTitle: {
    fontSize: Typography.title1,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  screenSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  playerSelectionCard: {
    margin: Spacing.screenPadding,
    marginTop: 0,
    padding: Spacing.lg,
  },

  playerScrollView: {
    flexDirection: 'row',
  },

  playerOption: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },

  selectedPlayerOption: {
    backgroundColor: Colors.primary,
  },

  playerOptionName: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  selectedPlayerOptionName: {
    color: Colors.textOnPrimary,
  },

  playerPosition: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  timeframeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  selectedTimeframeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  timeframeText: {
    fontSize: Typography.callout,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },

  selectedTimeframeText: {
    color: Colors.textOnPrimary,
  },

  overviewCard: {
    margin: Spacing.screenPadding,
    marginTop: 0,
    padding: Spacing.lg,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },

  overviewName: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  overviewPosition: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  overviewMinutes: {
    fontSize: Typography.callout,
    color: Colors.primary,
    fontWeight: '500',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },

  tabletMetricsGrid: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  metricCard: {
    width: (Dimensions.get('window').width - (Spacing.screenPadding * 2) - Spacing.md) / 2,
    padding: Spacing.lg,
    alignItems: 'center',
  },

  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  metricTitle: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },

  metricValue: {
    fontSize: Typography.title1,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  ratingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  ratingText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  additionalStatsCard: {
    margin: Spacing.screenPadding,
    padding: Spacing.lg,
  },

  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  additionalStat: {
    alignItems: 'center',
  },

  additionalStatLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  additionalStatValue: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
  },

  developmentCard: {
    margin: Spacing.screenPadding,
    padding: Spacing.lg,
  },

  developmentSubtitle: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  developmentArea: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },

  developmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },

  priorityText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  developmentAreaTitle: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
  },

  developmentRecommendation: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.callout,
  },

  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },

  exportButton: {
    flex: 1,
  },

  shareButton: {
    flex: 1,
  },

  bottomSpacing: {
    height: Spacing.sectionSpacing,
  },
});