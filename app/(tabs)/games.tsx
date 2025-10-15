import VideoPlayer from '@/components/ui/videoPlayer';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import { BorderRadius, Colors, Layout, Spacing, Typography } from '@/constants/theme';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useResponsive } from '@/hooks/useResponsive';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecentGamesScreen() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoGame, setSelectedVideoGame] = useState<any>(null);
  const { isTablet, isLandscape } = useResponsive();

  // Mock video data - in real app this would come from the game data
  const getMockVideoData = (gameId: string) => {
    return {
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Working test video from Google's public bucket (will be replaced with basketball footage)
      timelineMarkers: [
        {
          id: '1',
          timeMillis: 15000, // 15 seconds
          type: 'score' as const,
          title: 'Three Pointer by Marcus Johnson',
          description: 'Fast break three-pointer'
        },
        {
          id: '2',
          timeMillis: 45000, // 45 seconds
          type: 'turnover' as const,
          title: 'Turnover',
          description: 'Loose ball turnover'
        },
        {
          id: '3',
          timeMillis: 75000, // 1:15
          type: 'foul' as const,
          title: 'Personal Foul',
          description: 'Shooting foul on Davis'
        },
        {
          id: '4',
          timeMillis: 120000, // 2:00
          type: 'quarter' as const,
          title: 'End of 1st Quarter',
        }
      ],
      tags: [
        {
          id: '1',
          timeMillis: 15000,
          x: 35, // percentage from left
          y: 25, // percentage from top
          playerName: 'Marcus Johnson #23',
          playType: '3-Point Shot',
          duration: 4000
        },
        {
          id: '2',
          timeMillis: 45000,
          x: 60,
          y: 40,
          playType: 'Turnover',
          duration: 3000
        },
        {
          id: '3',
          timeMillis: 75000,
          x: 25,
          y: 60,
          playerName: 'Tyler Davis #12',
          playType: 'Shooting Foul',
          duration: 3000
        }
      ]
    };
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(selectedGameId === gameId ? null : gameId);
  };

  const handleAnalyzeGame = (gameId: string) => {
    console.log('Analyze game:', gameId);
  };

  const handleViewHighlights = (gameId: string) => {
    const game = mockGames.find(g => g.id === gameId);
    if (game) {
      setSelectedVideoGame(game);
      setVideoModalVisible(true);
    }
  };

  const getGameResult = (game: any) => {
    if (game.score.home > game.score.away) {
      return { result: 'W', winningScore: game.score.home, losingScore: game.score.away };
    } else {
      return { result: 'L', winningScore: game.score.away, losingScore: game.score.home };
    }
  };

  const formatDate = (dateString: string) => {
    // Convert mockup date format to a more readable format
    return dateString;
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
          <Text style={styles.screenTitle}>Recent Games</Text>
          <Text style={styles.screenSubtitle}>
            Review and analyze your team&apos;s recent performances
          </Text>
        </View>

        {/* Games List */}
        <View style={[
          styles.gamesContainer,
          isTablet && isLandscape && styles.tabletGamesGrid
        ]}>
          {mockGames.map((game) => {
            const gameResult = getGameResult(game);
            const isSelected = selectedGameId === game.id;

            return (
              <TouchableOpacity
                key={game.id}
                onPress={() => handleGameSelect(game.id)}
                style={[
                  styles.gameCardContainer,
                  isTablet && isLandscape && styles.tabletGameCard
                ]}
              >
                <Card
                  variant="elevated"
                  style={[
                    styles.gameCard,
                    isSelected && styles.selectedGameCard
                  ]}
                >
                  {/* Game Thumbnail */}
                  <View style={styles.gameThumbnail}>
                    {game.thumbnail ? (
                      <Image
                        source={{ uri: game.thumbnail }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderThumbnail}>
                        <IconSymbol size={48} name="video.fill" color={Colors.textSecondary} />
                        <Text style={styles.placeholderLabel}>Game Film</Text>
                      </View>
                    )}

                    {/* Game Status Badge */}
                    <View style={[
                      styles.statusBadge,
                      gameResult.result === 'W' ? styles.winBadge : styles.lossBadge
                    ]}>
                      <Text style={styles.statusText}>{gameResult.result}</Text>
                    </View>
                  </View>

                  {/* Game Info */}
                  <View style={styles.gameInfo}>
                    {/* Teams and Score */}
                    <View style={styles.teamsContainer}>
                      <Text style={styles.teamName}>{game.homeTeam.name}</Text>
                      <View style={styles.scoreContainer}>
                        <Text style={[
                          styles.scoreText,
                          gameResult.result === 'W' ? styles.winScore : styles.lossScore
                        ]}>
                          {game.score.home} - {game.score.away}
                        </Text>
                      </View>
                      <Text style={styles.teamName}>{game.awayTeam.name}</Text>
                    </View>

                    {/* Game Date */}
                    <Text style={styles.gameDate}>{formatDate(game.date)}</Text>

                    {/* Quick Stats */}
                    {game.boxScore && (
                      <View style={styles.quickStats}>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>FG%</Text>
                          <Text style={styles.statValue}>{game.boxScore.teamStats.fieldGoalPercentage}%</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>3P%</Text>
                          <Text style={styles.statValue}>{game.boxScore.teamStats.threePointPercentage}%</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>REB</Text>
                          <Text style={styles.statValue}>{game.boxScore.teamStats.rebounds}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>TO</Text>
                          <Text style={styles.statValue}>{game.boxScore.teamStats.turnovers}</Text>
                        </View>
                      </View>
                    )}

                    {/* Highlights Count */}
                    {game.highlights && (
                      <View style={styles.highlightsInfo}>
                        <Text style={styles.highlightsCount}>
                          {game.highlights.length} highlight{game.highlights.length !== 1 ? 's' : ''} available
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Expanded Content */}
                  {isSelected && game.boxScore && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.expandedTitle}>Top Performers</Text>

                      <View style={styles.topPerformers}>
                        {/* Top Scorer */}
                        <View style={styles.performerItem}>
                          <PlayerAvatar
                            name={game.boxScore.topPerformers.scorer.name}
                            imageUri={game.boxScore.topPerformers.scorer.imageUri}
                            jerseyNumber={game.boxScore.topPerformers.scorer.jerseyNumber}
                            size="small"
                          />
                          <View style={styles.performerInfo}>
                            <Text style={styles.performerName}>
                              {game.boxScore.topPerformers.scorer.name}
                            </Text>
                            <Text style={styles.performerStat}>
                              {game.boxScore.topPerformers.scorer.stats.points} points
                            </Text>
                          </View>
                        </View>

                        {/* Top Rebounder */}
                        <View style={styles.performerItem}>
                          <PlayerAvatar
                            name={game.boxScore.topPerformers.rebounder.name}
                            imageUri={game.boxScore.topPerformers.rebounder.imageUri}
                            jerseyNumber={game.boxScore.topPerformers.rebounder.jerseyNumber}
                            size="small"
                          />
                          <View style={styles.performerInfo}>
                            <Text style={styles.performerName}>
                              {game.boxScore.topPerformers.rebounder.name}
                            </Text>
                            <Text style={styles.performerStat}>
                              {game.boxScore.topPerformers.rebounder.stats.rebounds} rebounds
                            </Text>
                          </View>
                        </View>

                        {/* Top Assists */}
                        <View style={styles.performerItem}>
                          <PlayerAvatar
                            name={game.boxScore.topPerformers.assists.name}
                            imageUri={game.boxScore.topPerformers.assists.imageUri}
                            jerseyNumber={game.boxScore.topPerformers.assists.jerseyNumber}
                            size="small"
                          />
                          <View style={styles.performerInfo}>
                            <Text style={styles.performerName}>
                              {game.boxScore.topPerformers.assists.name}
                            </Text>
                            <Text style={styles.performerStat}>
                              {game.boxScore.topPerformers.assists.stats.assists} assists
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.gameActions}>
                        <Button
                          title="Analyze Game"
                          onPress={() => handleAnalyzeGame(game.id)}
                          variant="primary"
                          size="medium"
                          style={styles.analyzeButton}
                        />
                        {game.highlights && (
                          <Button
                            title="View Highlights"
                            onPress={() => handleViewHighlights(game.id)}
                            variant="outline"
                            size="medium"
                            style={styles.highlightsButton}
                          />
                        )}
                      </View>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Season Summary Card */}
        <Card variant="elevated" style={[
          styles.seasonSummary,
          isTablet && isLandscape && styles.tabletSeasonSummary
        ]}>
          <Text style={styles.seasonTitle}>Season Summary</Text>

          <View style={styles.seasonStats}>
            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>
                {mockTeams[0].record.wins}-{mockTeams[0].record.losses}
              </Text>
              <Text style={styles.seasonStatLabel}>Record</Text>
            </View>

            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>{mockTeams[0].stats.averagePoints}</Text>
              <Text style={styles.seasonStatLabel}>Avg Points</Text>
            </View>

            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>{mockTeams[0].stats.fieldGoalPercentage}%</Text>
              <Text style={styles.seasonStatLabel}>FG%</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Video Highlights Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setVideoModalVisible(false)}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedVideoGame ? `${selectedVideoGame.homeTeam.name} vs ${selectedVideoGame.awayTeam.name}` : 'Game Highlights'}
            </Text>
            <View style={styles.closeButtonPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedVideoGame && (
              <View style={styles.videoPlayerContainer}>
                <VideoPlayer
                  videoUrl={getMockVideoData(selectedVideoGame.id).videoUrl}
                  title="Game Highlights with AI Analysis"
                  timelineMarkers={getMockVideoData(selectedVideoGame.id).timelineMarkers}
                  tags={getMockVideoData(selectedVideoGame.id).tags}
                  onPlaybackUpdate={(status) => {
                    console.log('Video playback update:', status);
                  }}
                />
              </View>
            )}

            {/* Game Summary */}
            {selectedVideoGame && (
              <Card variant="elevated" style={styles.videoGameSummary}>
                <Text style={styles.videoGameTitle}>Game Summary</Text>
                <View style={styles.videoGameStats}>
                  <Text style={styles.videoGameDate}>{selectedVideoGame.date}</Text>
                  <Text style={styles.videoGameScore}>
                    Final Score: {selectedVideoGame.score.home} - {selectedVideoGame.score.away}
                  </Text>
                  {selectedVideoGame.highlights && (
                    <Text style={styles.videoHighlightsCount}>
                      {selectedVideoGame.highlights.length} Key Moments Identified
                    </Text>
                  )}
                </View>
              </Card>
            )}

            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

  gamesContainer: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
  },

  gameCardContainer: {
    marginBottom: Spacing.md,
  },

  gameCard: {
    padding: 0,
    overflow: 'hidden',
  },

  selectedGameCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  gameThumbnail: {
    width: '100%',
    height: 200,
    position: 'relative',
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },


  placeholderLabel: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
  },

  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },

  winBadge: {
    backgroundColor: Colors.win,
  },

  lossBadge: {
    backgroundColor: Colors.loss,
  },

  statusText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  gameInfo: {
    padding: Spacing.lg,
  },

  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  teamName: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },

  scoreContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },

  scoreText: {
    fontSize: Typography.title2,
    fontWeight: '700',
  },

  winScore: {
    color: Colors.win,
  },

  lossScore: {
    color: Colors.loss,
  },

  gameDate: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },

  highlightsInfo: {
    alignItems: 'center',
  },

  highlightsCount: {
    fontSize: Typography.callout,
    color: Colors.primary,
    fontWeight: '500',
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },

  expandedTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  topPerformers: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
  },

  performerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },

  performerName: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
  },

  performerStat: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  gameActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  analyzeButton: {
    flex: 1,
  },

  highlightsButton: {
    flex: 1,
  },

  seasonSummary: {
    margin: Spacing.screenPadding,
    padding: Spacing.lg,
  },

  seasonTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  seasonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  seasonStat: {
    alignItems: 'center',
  },

  seasonStatValue: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },

  seasonStatLabel: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },

  // Responsive styles for iPad landscape
  tabletGamesGrid: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  tabletGameCard: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  tabletSeasonSummary: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '90%',
  },

  // Video Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.borderLight,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonPlaceholder: {
    width: 40,
    height: 40,
  },

  modalTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },

  modalContent: {
    flex: 1,
  },

  videoPlayerContainer: {
    margin: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },

  videoGameSummary: {
    margin: Spacing.screenPadding,
    marginTop: 0,
    padding: Spacing.lg,
  },

  videoGameTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  videoGameStats: {
    alignItems: 'center',
    gap: Spacing.sm,
  },

  videoGameDate: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
  },

  videoGameScore: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.text,
  },

  videoHighlightsCount: {
    fontSize: Typography.callout,
    color: Colors.primary,
    fontWeight: '500',
  },

  modalBottomSpacing: {
    height: Spacing.sectionSpacing,
  },
});