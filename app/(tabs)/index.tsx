import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { BorderRadius, Colors, Layout, Spacing, Typography } from '@/constants/theme';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useResponsive } from '@/hooks/useResponsive';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const currentTeam = mockTeams[0];
  const recentGame = mockGames[0];
  const { isTablet, isLandscape, gridColumns } = useResponsive();

  const handleAction = (actionId: string) => {
    console.log('Action pressed:', actionId);
    switch (actionId) {
      case 'team-selection':
        router.push('/(tabs)/teams');
        break;
      case 'review-pending':
        // Navigate to pending analysis when that screen is built
        console.log('Navigate to pending analysis');
        break;
      default:
        console.log('Action not implemented:', actionId);
    }
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
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <IconSymbol size={20} name="bell.fill" color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <IconSymbol size={20} name="gear" color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {mockCoach.name}</Text>
          <Text style={styles.welcomeSubtitle}>
            Season Record: 18-6 • Next Game: Friday vs Riverside
          </Text>

          <Button
            title="View Latest Game Film"
            onPress={() => handleAction('review-pending')}
            variant="primary"
            style={styles.pendingButton}
          />
        </View>

        {/* Main Content - Responsive Layout */}
        <View style={[
          styles.mainGrid,
          isTablet && isLandscape && styles.tabletLandscapeGrid
        ]}>
          {/* Recent Games */}
          <Card variant="elevated" style={[
            styles.recentGamesCard,
            isTablet && isLandscape && styles.tabletCardWide
          ]}>
            <Text style={styles.sectionTitle}>Recent Games</Text>

            <View style={styles.gameItem}>
              <View style={styles.gameTeams}>
                <Text style={styles.teamName}>Lincoln Eagles</Text>
                <Text style={styles.teamName}>vs Central Warriors</Text>
              </View>
              <View style={styles.gameScore}>
                <Text style={styles.scoreText}>87-74</Text>
                <Text style={styles.gameDate}>Mar 15</Text>
              </View>
            </View>

            <View style={styles.gameItem}>
              <View style={styles.gameTeams}>
                <Text style={styles.teamName}>Lincoln Eagles</Text>
                <Text style={styles.teamName}>vs Riverside Eagles</Text>
              </View>
              <View style={styles.gameScore}>
                <Text style={styles.scoreText}>69-72</Text>
                <Text style={styles.gameDate}>Mar 8</Text>
              </View>
            </View>

            <View style={styles.filmHighlights}>
              <Text style={styles.highlightsTitle}>Film Highlights</Text>
              <View style={styles.highlightCategories}>
                <TouchableOpacity style={styles.highlightCategory}>
                  <Text style={styles.categoryLabel}>Offensive Sets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.highlightCategory}>
                  <Text style={styles.categoryLabel}>Defensive Stops</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.highlightCategory}>
                  <Text style={styles.categoryLabel}>Key Plays</Text>
                </TouchableOpacity>
              </View>
              <Button
                title="Watch Game Film"
                onPress={() => handleAction('watch-full')}
                variant="primary"
                style={styles.watchButton}
              />
            </View>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" style={[
            styles.quickActionsCard,
            isTablet && isLandscape && styles.tabletCard
          ]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={[
              styles.actionsGrid,
              isTablet && { flexDirection: 'row' },
              isTablet && isLandscape && { flexWrap: 'wrap', justifyContent: 'space-between' }
            ]}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction('team-selection')}
              >
                <View style={styles.actionIcon}>
                  <IconSymbol size={24} name="person.3.fill" color={Colors.textOnPrimary} />
                </View>
                <Text style={styles.actionLabel}>Team Management</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <IconSymbol size={24} name="chart.bar.fill" color={Colors.textOnPrimary} />
                </View>
                <Text style={styles.actionLabel}>Statistics & Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <IconSymbol size={24} name="video.fill" color={Colors.textOnPrimary} />
                </View>
                <Text style={styles.actionLabel}>Upload Game Film</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <IconSymbol size={24} name="magnifyingglass" color={Colors.textOnPrimary} />
                </View>
                <Text style={styles.actionLabel}>AI Game Analysis</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Team Pulse & Player Spotlight - Responsive Bottom Section */}
        <View style={[
          styles.bottomSection,
          isTablet && isLandscape && styles.tabletBottomGrid
        ]}>
          {/* Team Pulse */}
          <Card variant="elevated" style={[
            styles.teamPulseCard,
            isTablet && isLandscape ? styles.tabletCard : {}
          ]}>
            <Text style={styles.sectionTitle}>Team Pulse</Text>
            <View style={styles.teamStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Players:</Text>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statChange}>8-2</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Record:</Text>
                <Text style={styles.statValue}>8-2</Text>
                <Text style={styles.statChange}>47%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>FG%:</Text>
                <Text style={styles.statValue}>18</Text>
                <Text style={styles.statChange}>(+3)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Turnovers:</Text>
                <Text style={styles.statValue}>14</Text>
                <Text style={styles.statChange}>(-2)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Rebounds:</Text>
                <Text style={styles.statValue}>33</Text>
                <Text style={styles.statChange}>(+5)</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.seeAllLink}>
              <Text style={styles.seeAllText}>See All Players ›</Text>
            </TouchableOpacity>
          </Card>

          {/* Player Spotlight */}
          <Card variant="elevated" style={[
            styles.playerSpotlightCard,
            isTablet && isLandscape ? styles.tabletCard : {}
          ]}>
            <Text style={styles.sectionTitle}>Player Spotlight</Text>
            <View style={styles.playerSpotlightList}>
              {currentTeam.players.slice(0, 3).map((player) => (
                <View key={player.id} style={styles.playerSpotlightItem}>
                  <PlayerAvatar
                    name={player.name}
                    imageUri={player.imageUri}
                    jerseyNumber={player.jerseyNumber}
                    size="medium"
                  />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.playerName}>
                      {player.name.split(' ')[1]}
                    </Text>
                    <Text style={styles.playerRole}>TOP SCORER</Text>
                    <Text style={styles.playerStats}>
                      {player.stats.points} P {player.stats.rebounds} B {player.stats.assists}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.seeAllLink}>
              <Text style={styles.seeAllText}>See All Players ›</Text>
            </TouchableOpacity>
          </Card>
        </View>
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

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
  },

  welcomeSection: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
  },

  welcomeTitle: {
    fontSize: Typography.title1,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  welcomeSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  pendingButton: {
    marginTop: Spacing.sm,
  },

  mainGrid: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  recentGamesCard: {
    padding: Spacing.lg,
  },

  quickActionsCard: {
    padding: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  gameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  gameTeams: {
    flex: 1,
  },

  teamName: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  gameScore: {
    alignItems: 'flex-end',
  },

  scoreText: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.text,
  },

  gameDate: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  filmHighlights: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  highlightsTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  highlightCategories: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  highlightCategory: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  categoryLabel: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: Colors.text,
  },

  watchButton: {
    width: '100%',
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },


  actionLabel: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },

  bottomSection: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  teamPulseCard: {
    padding: Spacing.lg,
  },

  playerSpotlightCard: {
    padding: Spacing.lg,
  },

  teamStats: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  statLabel: {
    fontSize: Typography.body,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
  },

  statValue: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: Spacing.md,
  },

  statChange: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: Colors.success,
  },

  seeAllLink: {
    alignSelf: 'flex-start',
  },

  seeAllText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.primary,
  },

  playerSpotlightList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  playerSpotlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },

  playerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },

  playerName: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
  },

  playerRole: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },

  playerStats: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },

  // Responsive styles for iPad landscape
  tabletLandscapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  tabletCard: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    minWidth: 300,
  },

  tabletCardWide: {
    flex: 2,
    marginHorizontal: Spacing.sm,
    minWidth: 400,
  },

  tabletBottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});
