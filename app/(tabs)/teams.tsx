import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { mockTeams, mockCoach } from '@/data/mockData';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { useResponsive } from '@/hooks/useResponsive';

export default function TeamSelectionScreen() {
  const [selectedTeamId, setSelectedTeamId] = useState(mockTeams[0].id);
  const { isTablet, isLandscape } = useResponsive();

  const selectedTeam = mockTeams.find(team => team.id === selectedTeamId);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleContinue = () => {
    console.log('Continue with team:', selectedTeamId);
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
          <Text style={styles.screenTitle}>Select Your Team</Text>
          <Text style={styles.screenSubtitle}>
            Choose which team you want to analyze and manage
          </Text>
        </View>

        {/* Team Selection Grid */}
        <View style={[
          styles.teamsGrid,
          isTablet && isLandscape && styles.tabletTeamsGrid
        ]}>
          {mockTeams.map((team) => (
            <TouchableOpacity
              key={team.id}
              onPress={() => handleTeamSelect(team.id)}
              style={[
                styles.teamCardContainer,
                isTablet && isLandscape && styles.tabletTeamCard
              ]}
            >
              <Card
                variant="outlined"
                style={[
                  styles.teamCard,
                  selectedTeamId === team.id && styles.selectedTeamCard
                ]}
              >
                {/* Team Header */}
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamLevel}>{team.level}</Text>
                </View>

                {/* Team Stats */}
                <View style={styles.teamStatsRow}>
                  <View style={styles.statGroup}>
                    <Text style={styles.statLabel}>Record</Text>
                    <Text style={styles.statValue}>
                      {team.record.wins}-{team.record.losses}
                    </Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Text style={styles.statLabel}>Players</Text>
                    <Text style={styles.statValue}>{team.players.length}</Text>
                  </View>
                </View>

                {/* Player Previews */}
                <View style={styles.playersPreview}>
                  <Text style={styles.playersTitle}>Top Players</Text>
                  <View style={styles.playersRow}>
                    {team.players.slice(0, 4).map((player, index) => (
                      <View key={player.id} style={[
                        styles.playerPreview,
                        { marginLeft: index > 0 ? -Spacing.xs : 0 }
                      ]}>
                        <PlayerAvatar
                          name={player.name}
                          imageUri={player.imageUri}
                          jerseyNumber={player.jerseyNumber}
                          size="small"
                        />
                      </View>
                    ))}
                    {team.players.length > 4 && (
                      <View style={[styles.playerPreview, styles.morePlayersIndicator]}>
                        <Text style={styles.morePlayersText}>
                          +{team.players.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Selection Indicator */}
                {selectedTeamId === team.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓ Selected</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Team Details */}
        {selectedTeam && (
          <Card variant="elevated" style={[
            styles.selectedTeamDetails,
            isTablet && isLandscape && styles.tabletSelectedDetails
          ]}>
            <Text style={styles.detailsTitle}>Team Overview</Text>

            <View style={styles.teamOverviewGrid}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Average Points</Text>
                <Text style={styles.overviewValue}>{selectedTeam.stats.averagePoints}</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Points Allowed</Text>
                <Text style={styles.overviewValue}>{selectedTeam.stats.pointsAllowed}</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>FG%</Text>
                <Text style={styles.overviewValue}>{selectedTeam.stats.fieldGoalPercentage}%</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Turnovers</Text>
                <Text style={styles.overviewValue}>{selectedTeam.stats.turnovers}</Text>
              </View>
            </View>

            <View style={styles.recentGameInfo}>
              <Text style={styles.recentGameLabel}>Recent Game</Text>
              <Text style={styles.recentGameResult}>
                {selectedTeam.recentGame?.result === 'W' ? 'Won' : 'Lost'} vs {selectedTeam.recentGame?.opponent}
                {' '}{selectedTeam.recentGame?.score.team}-{selectedTeam.recentGame?.score.opponent}
              </Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue with Selected Team"
            onPress={handleContinue}
            variant="primary"
            size="large"
            style={styles.continueButton}
          />
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

  teamsGrid: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  teamCardContainer: {
    marginBottom: Spacing.md,
  },

  teamCard: {
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },

  selectedTeamCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },

  teamHeader: {
    marginBottom: Spacing.md,
  },

  teamName: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  teamLevel: {
    fontSize: Typography.callout,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  teamStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },

  statGroup: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.text,
  },

  playersPreview: {
    marginBottom: Spacing.md,
  },

  playersTitle: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerPreview: {
    marginRight: Spacing.xs,
  },

  morePlayersIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.xs,
  },

  morePlayersText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  selectedIndicator: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },

  selectedText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },

  selectedTeamDetails: {
    margin: Spacing.screenPadding,
    padding: Spacing.lg,
  },

  detailsTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  teamOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },

  overviewStat: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },

  overviewLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  overviewValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.text,
  },

  recentGameInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },

  recentGameLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  recentGameResult: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },

  buttonContainer: {
    padding: Spacing.screenPadding,
    alignItems: 'center',
  },

  continueButton: {
    width: '100%',
    maxWidth: 400,
  },

  // Responsive styles for iPad landscape
  tabletTeamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  tabletTeamCard: {
    flex: 1,
    minWidth: 300,
    maxWidth: 350,
    marginHorizontal: Spacing.sm,
  },

  tabletSelectedDetails: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '90%',
  },
});