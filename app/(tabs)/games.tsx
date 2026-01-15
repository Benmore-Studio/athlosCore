import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator, Alert, useWindowDimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import GameCard from '@/components/games/GameCard';
import GameVideoModal from '@/components/games/GameVideoModal';
import { Game } from '@/types/game';
import gameService from '@/services/api/gameService';
import teamService from '@/services/api/teamService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

function GamesScreenContent() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoGame, setSelectedVideoGame] = useState<Game | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Filter state
  const [selectedSeason, setSelectedSeason] = useState<string>('2024-25');
  const [quickFilter, setQuickFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const { currentColors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // Responsive breakpoints
  const isTablet = width >= 768;

  // Available seasons (could come from API in future)
  const availableSeasons = ['2024-25', '2023-24', '2022-23', 'All Time'];

  useEffect(() => {
    loadGames();
    loadSelectedTeam();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [games, quickFilter]);

  const loadSelectedTeam = async () => {
    try {
      const teamId = await AsyncStorage.getItem('selected_team_id');
      if (teamId) {
        const team = await teamService.getTeamById(teamId);
        setSelectedTeam(team);
      } else {
        // No team selected - set null and let UI show "Select a team" message
        setSelectedTeam(null);
      }
    } catch (err) {
      console.error('❌ Failed to load team:', err);
      Sentry.captureException(err);
      Alert.alert('Unable to Load Team', 'Could not connect to the server. Please try again.');
      setSelectedTeam(null);
    }
  };

  const loadGames = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const orgId = await AsyncStorage.getItem('current_org_id');
      const teamId = await AsyncStorage.getItem('selected_team_id');

      console.log('🏀 Fetching games from API...');

      const data = await gameService.getGames({
        org_id: orgId || undefined,
        team_id: teamId || undefined,
        status: 'completed',
        limit: 30, // Load recent 30 games (covers most seasons)
        sort: 'game_date_desc' // Newest first
      });

      console.log('✅ Games fetched:', data.length);

      if (data.length === 0) {
        console.log('📭 No games found - showing empty state');
      }

      const transformedGames = data.map((game: any) => ({
        id: game.game_id,
        homeTeam: {
          id: game.home_team_id,
          name: game.home_team_name,
        },
        awayTeam: {
          id: game.away_team_id,
          name: game.away_team_name,
        },
        date: formatGameDate(game.game_date),
        score: {
          home: game.home_score || 0,
          away: game.away_score || 0,
        },
        status: game.status,
        thumbnail: game.thumbnail_url,
      }));

      setGames(transformedGames);

    } catch (err) {
      console.error('❌ Failed to load games:', err);
      Sentry.captureException(err, {
        tags: { screen: 'games', action: 'load_games' },
        extra: { isRefresh }
      });

      // Show error to user - DO NOT use mock data
      Alert.alert(
        'Unable to Load Games',
        'Could not connect to the server. Please check your connection and try again.',
        [{ text: 'OK' }]
      );

      // Set empty state
      setGames([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatGameDate = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  const onRefresh = async () => {
    await loadGames(true);
  };

  const applyFilters = () => {
    let filtered = [...games];

    // Apply quick filter (wins/losses)
    if (quickFilter === 'wins') {
      filtered = filtered.filter(game => {
        const isHomeTeam = game.homeTeam.id === selectedTeam?.team_id;
        const teamScore = isHomeTeam ? game.score.home : game.score.away;
        const opponentScore = isHomeTeam ? game.score.away : game.score.home;
        return teamScore > opponentScore;
      });
    } else if (quickFilter === 'losses') {
      filtered = filtered.filter(game => {
        const isHomeTeam = game.homeTeam.id === selectedTeam?.team_id;
        const teamScore = isHomeTeam ? game.score.home : game.score.away;
        const opponentScore = isHomeTeam ? game.score.away : game.score.home;
        return teamScore < opponentScore;
      });
    }

    setFilteredGames(filtered);
  };

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setShowSeasonPicker(false);
    // In a real implementation, this would trigger a new API call with season filter
    // For MVP, we'll just show all games since we're loading recent games
  };

  const getMockVideoData = (gameId: string) => ({
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    timelineMarkers: [
      { id: '1', timeMillis: 15000, type: 'score' as const, title: 'Three Pointer by Marcus Johnson' },
      { id: '2', timeMillis: 45000, type: 'turnover' as const, title: 'Turnover' },
      { id: '3', timeMillis: 75000, type: 'foul' as const, title: 'Personal Foul' },
      { id: '4', timeMillis: 120000, type: 'quarter' as const, title: 'End of 1st Quarter' }
    ],
    tags: [
      { id: '1', timeMillis: 15000, x: 35, y: 25, playerName: 'Marcus Johnson #23', playType: '3-Point Shot', duration: 4000 },
      { id: '2', timeMillis: 45000, x: 60, y: 40, playType: 'Turnover', duration: 3000 },
    ]
  });

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(selectedGameId === gameId ? null : gameId);
  };

  const handleViewHighlights = (game: Game) => {
    setSelectedVideoGame(game);
    setVideoModalVisible(true);
  };

  // Calculate season stats from games
  const calculateSeasonStats = () => {
    if (!selectedTeam || games.length === 0) {
      return {
        wins: 0,
        losses: 0,
        totalGames: 0,
        winPercentage: 0,
        averagePoints: 0,
        fieldGoalPercentage: 0,
      };
    }

    // Use mock team data for now since backend doesn't have this
    const wins = selectedTeam.record?.wins || 0;
    const losses = selectedTeam.record?.losses || 0;
    const totalGames = wins + losses;
    const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      wins,
      losses,
      totalGames,
      winPercentage,
      averagePoints: selectedTeam.stats?.averagePoints || 0,
      fieldGoalPercentage: selectedTeam.stats?.fieldGoalPercentage || 0,
    };
  };

  const seasonStats = calculateSeasonStats();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading games...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header - Matching Dashboard Style */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[Colors.primary, '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoText}>A</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Games</Text>
            <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
              {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentColors.primary}
            colors={[currentColors.primary]}
          />
        }
      >
        <View style={styles.mainContent}>
          {/* Season Summary - Navy Gradient Hero Card */}
          {selectedTeam && (
            <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              <LinearGradient
                colors={['#1E2A3A', '#2D3E52']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.seasonCard}
              >
                <View style={[styles.seasonContent, isTablet && styles.seasonContentTablet]}>
                  <View style={styles.seasonLeft}>
                    <Text style={styles.seasonLabel}>Season Record</Text>
                    <Text style={styles.seasonRecord}>
                      {seasonStats.wins}-{seasonStats.losses}
                    </Text>
                    <Text style={styles.seasonTeam}>{selectedTeam.name || 'Team'}</Text>
                  </View>

                  <View style={styles.seasonStats}>
                    <View style={styles.seasonStat}>
                      <Text style={[styles.seasonStatValue, { color: Colors.primary }]}>
                        {Math.round(seasonStats.winPercentage)}%
                      </Text>
                      <Text style={styles.seasonStatLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.seasonStatDivider} />
                    <View style={styles.seasonStat}>
                      <Text style={styles.seasonStatValue}>{seasonStats.averagePoints}</Text>
                      <Text style={styles.seasonStatLabel}>PPG</Text>
                    </View>
                    <View style={styles.seasonStatDivider} />
                    <View style={styles.seasonStat}>
                      <Text style={styles.seasonStatValue}>{seasonStats.fieldGoalPercentage}%</Text>
                      <Text style={styles.seasonStatLabel}>FG%</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Game History Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sectionContainer}>
            <View style={[styles.sectionCard, { backgroundColor: currentColors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '15' }]}>
                    <IconSymbol name="sportscourt.fill" size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Game History</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowSeasonPicker(true)}
                  style={styles.seasonSelector}
                >
                  <Text style={[styles.seasonText, { color: Colors.primary }]}>{selectedSeason}</Text>
                  <IconSymbol name="chevron.down" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Quick Filter Chips */}
              <View style={styles.quickFiltersRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: quickFilter === 'all' ? Colors.primary : currentColors.surface,
                      borderColor: quickFilter === 'all' ? Colors.primary : currentColors.border,
                    }
                  ]}
                  onPress={() => setQuickFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: quickFilter === 'all' ? '#FFFFFF' : currentColors.text }
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: quickFilter === 'wins' ? Colors.success : currentColors.surface,
                      borderColor: quickFilter === 'wins' ? Colors.success : currentColors.border,
                    }
                  ]}
                  onPress={() => setQuickFilter('wins')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: quickFilter === 'wins' ? '#FFFFFF' : currentColors.text }
                  ]}>
                    Wins
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: quickFilter === 'losses' ? Colors.error : currentColors.surface,
                      borderColor: quickFilter === 'losses' ? Colors.error : currentColors.border,
                    }
                  ]}
                  onPress={() => setQuickFilter('losses')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: quickFilter === 'losses' ? '#FFFFFF' : currentColors.text }
                  ]}>
                    Losses
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Games Grid */}
              {filteredGames.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="sportscourt" size={48} color={currentColors.textLight} />
                  <Text style={[styles.emptyStateText, { color: currentColors.textSecondary }]}>
                    No games found
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: currentColors.textLight }]}>
                    Try changing your filters
                  </Text>
                </View>
              ) : (
                <View style={[styles.gamesGrid, isTablet && styles.gamesGridTablet]}>
                  {filteredGames.map((game, index) => (
                    <Animated.View
                      key={game.id}
                      entering={FadeInUp.delay(250 + index * 50).duration(400)}
                      style={isTablet && styles.gameCardWrapper}
                    >
                      <GameCard
                        game={game}
                        isSelected={selectedGameId === game.id}
                        onPress={() => handleGameSelect(game.id)}
                        onViewHighlights={() => handleViewHighlights(game)}
                        currentColors={currentColors}
                        isDark={isDark}
                      />
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Season Picker Modal */}
      <Modal
        visible={showSeasonPicker}
        animationType="slide"
        presentationStyle="formSheet"
        transparent={false}
        onRequestClose={() => setShowSeasonPicker(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: currentColors.border }]}>
            <TouchableOpacity onPress={() => setShowSeasonPicker(false)}>
              <Text style={[styles.modalCancel, { color: currentColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Select Season</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.seasonPickerContent}>
            {availableSeasons.map((season) => (
              <TouchableOpacity
                key={season}
                style={[
                  styles.seasonOption,
                  {
                    backgroundColor: selectedSeason === season ? Colors.primary + '15' : currentColors.surface,
                    borderColor: selectedSeason === season ? Colors.primary : currentColors.border,
                  }
                ]}
                onPress={() => handleSeasonChange(season)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.seasonOptionText,
                  { color: selectedSeason === season ? Colors.primary : currentColors.text }
                ]}>
                  {season}
                </Text>
                {selectedSeason === season && (
                  <IconSymbol name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Video Modal */}
      {videoModalVisible && selectedVideoGame && (
        <GameVideoModal
          visible={videoModalVisible}
          onClose={() => setVideoModalVisible(false)}
          game={selectedVideoGame}
          videoData={getMockVideoData(selectedVideoGame.id)}
          currentColors={currentColors}
        />
      )}
    </SafeAreaView>
  );
}

export default function GamesScreen() {
  return (
    <ComponentErrorBoundary componentName="GamesScreen">
      <GamesScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  // Header - Matching Dashboard
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Season Summary - Navy Gradient Hero
  seasonCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  seasonContent: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  seasonContentTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonLeft: {
    alignItems: 'center',
  },
  seasonLabel: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  seasonRecord: {
    fontSize: Typography.title1,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  seasonTeam: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  seasonStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  seasonStat: {
    alignItems: 'center',
  },
  seasonStatValue: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seasonStatLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  seasonStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Mock Data Banner
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  mockDataText: {
    flex: 1,
    fontSize: Typography.footnote,
    fontWeight: '600',
  },

  // Section
  sectionContainer: {
    marginTop: Spacing.sm,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  filterText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },

  // Games Grid
  gamesGrid: {
    gap: Spacing.md,
  },
  gamesGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gameCardWrapper: {
    width: '48%',
  },

  // Season Selector
  seasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '08',
  },
  seasonText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },

  // Quick Filter Chips
  quickFiltersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: Typography.subhead,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },

  // Season Picker
  seasonPickerContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  seasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  seasonOptionText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: Typography.footnote,
  },
});
