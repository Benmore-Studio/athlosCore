// File: app/(tabs)/index.tsx
// Dashboard Redesign - Professional Coach Dashboard
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import {
  mockCoach,
  mockGames,
  mockTeams,
  mockAIInsights,
  mockTopPerformers,
  mockUpcomingGame,
} from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import type { AIInsight, TopPerformer, UpcomingGame } from '@/components/dashboard';
import userService from '@/services/api/userService';
import teamService from '@/services/api/teamService';
import playerService from '@/services/api/playerService';
import gameService from '@/services/api/gameService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

function DashboardScreenContent() {
  const { currentColors } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDemoMode = !isAuthenticated;
  const { width, height } = useWindowDimensions();

  // Responsive breakpoints
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isLargeScreen = isTablet && isLandscape;
  const isMediumScreen = isTablet && !isLandscape;

  // Local state
  const [coach, setCoach] = useState<Coach | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // New state for redesigned components
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [upcomingGame, setUpcomingGame] = useState<UpcomingGame | null>(null);

  const [teamStats, setTeamStats] = useState({
    avgPoints: 0,
    totalGames: 0,
    totalFilms: 0,
    winRate: 0,
    fieldGoalPercentage: 0,
    rebounds: 0,
    turnovers: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
        // Load all mock data for demo mode
        setCoach({ ...mockCoach, email: 'demo@athloscore.com' });
        setSelectedTeam(mockTeams[0]);
        setPlayers(mockTeams[0].players);
        setRecentGames(mockGames);
        setAIInsights(mockAIInsights);
        setTopPerformers(mockTopPerformers);
        setUpcomingGame(mockUpcomingGame);
        setTeamStats({
          avgPoints: 87.3,
          totalGames: 24,
          totalFilms: 24,
          winRate: 75,
          fieldGoalPercentage: 47,
          rebounds: 33,
          turnovers: 14,
        });
        setUsingMockData(true);
        setLoading(false);
        return;
      }

      await loadCoachProfile();
      const teamId = await AsyncStorage.getItem('selected_team_id');
      if (teamId) {
        await loadTeamData(teamId);
      } else {
        // Fall back to mock data if no team selected
        setSelectedTeam(mockTeams[0]);
        setPlayers(mockTeams[0].players.slice(0, 3));
        setAIInsights(mockAIInsights);
        setTopPerformers(mockTopPerformers);
        setUpcomingGame(mockUpcomingGame);
        setUsingMockData(true);
      }
    } catch (err) {
      // Fall back to mock data on error
      setCoach({ ...mockCoach, email: 'demo@athloscore.com' });
      setSelectedTeam(mockTeams[0]);
      setPlayers(mockTeams[0].players);
      setRecentGames(mockGames);
      setAIInsights(mockAIInsights);
      setTopPerformers(mockTopPerformers);
      setUpcomingGame(mockUpcomingGame);
      setTeamStats({
        avgPoints: 87.3,
        totalGames: 24,
        totalFilms: 24,
        winRate: 75,
        fieldGoalPercentage: 47,
        rebounds: 33,
        turnovers: 14,
      });
      setUsingMockData(true);

      Sentry.captureException(err, {
        tags: { screen: 'dashboard', action: 'load_data' },
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loadCoachProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setCoach({
        id: profile.id,
        name: profile.name || profile.email,
        email: profile.email,
        imageUri: profile.avatar_url,
      });
    } catch (err) {
      setCoach({ ...mockCoach, email: 'demo@athloscore.com' });
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      const team = await teamService.getTeamById(teamId);
      setSelectedTeam(team);

      const teamPlayersResponse = await playerService.getPlayers({ team_id: teamId });
      setPlayers(teamPlayersResponse.players || []);

      const games = await gameService.getRecentGames(teamId, 5);
      setRecentGames(games);

      await loadTeamStats(teamId);

      // For now, use mock data for AI insights and top performers
      // These would come from dedicated endpoints in production
      setAIInsights(mockAIInsights);
      setTopPerformers(mockTopPerformers);
      setUpcomingGame(mockUpcomingGame);

      setUsingMockData(false);
    } catch (err) {
      throw err;
    }
  };

  const loadTeamStats = async (teamId: string) => {
    try {
      const stats = await gameService.getTeamSeasonStats(teamId);
      setTeamStats({
        avgPoints: stats.average_points || 0,
        totalGames: stats.total_games || 0,
        winRate: stats.win_percentage || 0,
        totalFilms: 0,
        fieldGoalPercentage: stats.field_goal_percentage || 0,
        rebounds: stats.average_rebounds || 0,
        turnovers: stats.average_turnovers || 0,
      });
    } catch (err) {
      setTeamStats(prev => ({
        ...prev,
        avgPoints: 87.3,
        totalGames: 24,
        winRate: 75,
        fieldGoalPercentage: 47,
        rebounds: 33,
        turnovers: 14,
      }));
    }
  };

  // Calculate team record
  const wins = Math.round((teamStats.winRate / 100) * teamStats.totalGames);
  const losses = teamStats.totalGames - wins;
  const teamRecord = `${wins}-${losses}`;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      accessibilityLabel="Dashboard screen"
    >
      {/* Header */}
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
            <Text style={[styles.greeting, { color: currentColors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.coachName, { color: currentColors.text }]}>
              {coach?.name?.split(' ')[0] || 'Coach'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: currentColors.surface }]}
            onPress={() => router.push('/videos')}
            accessibilityLabel="Upload video"
          >
            <IconSymbol name="plus" size={20} color={currentColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: currentColors.surface }]}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
          >
            <IconSymbol name="gear" size={20} color={currentColors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Demo Mode Banner */}
        {usingMockData && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.demoBanner, { backgroundColor: Colors.warning + '15' }]}
          >
            <IconSymbol name="info.circle.fill" size={16} color={Colors.warning} />
            <Text style={[styles.demoBannerText, { color: Colors.warning }]}>
              {isDemoMode ? 'Demo Mode' : 'Sample Data'}
            </Text>
          </Animated.View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* HERO: Team Card with Navy Gradient */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <LinearGradient
              colors={['#1E2A3A', '#2D3E52']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.teamCard}
            >
              <View style={styles.teamTitleRow}>
                <View>
                  <Text style={styles.teamLabel}>Current Team</Text>
                  <Text style={styles.teamName}>{selectedTeam?.name || 'Select Team'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/teams')}
                  style={styles.switchButton}
                  accessibilityLabel="Switch team"
                >
                  <IconSymbol name="arrow.left.arrow.right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Stats Row */}
              <View style={styles.teamStats}>
                <View style={styles.teamStat}>
                  <Text style={styles.teamStatValue}>{teamRecord}</Text>
                  <Text style={styles.teamStatLabel}>Record</Text>
                </View>
                <View style={styles.teamStatDivider} />
                <View style={styles.teamStat}>
                  <Text style={styles.teamStatValue}>{teamStats.avgPoints.toFixed(1)}</Text>
                  <Text style={styles.teamStatLabel}>PPG</Text>
                </View>
                <View style={styles.teamStatDivider} />
                <View style={styles.teamStat}>
                  <Text style={styles.teamStatValue}>{Math.round(teamStats.fieldGoalPercentage)}%</Text>
                  <Text style={styles.teamStatLabel}>FG%</Text>
                </View>
                <View style={styles.teamStatDivider} />
                <View style={styles.teamStat}>
                  <Text style={styles.teamStatValue}>{players.length}</Text>
                  <Text style={styles.teamStatLabel}>Players</Text>
                </View>
                <View style={styles.teamStatDivider} />
                <View style={styles.teamStat}>
                  <Text style={[styles.teamStatValue, { color: Colors.primary }]}>{teamStats.winRate}%</Text>
                  <Text style={styles.teamStatLabel}>Win Rate</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* AI Insights - Prominent Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sectionContainer}>
            <View style={[styles.aiInsightsCard, { backgroundColor: currentColors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiIcon}
                  >
                    <IconSymbol name="brain" size={18} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.aiTitle, { color: currentColors.text }]}>Coach Vision AI</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/explore')}>
                  <Text style={[styles.cardLink, { color: Colors.primary }]}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.insightsGrid, isTablet && styles.insightsGridTablet]}>
                {aiInsights.slice(0, isTablet ? 3 : 2).map((insight) => (
                  <TouchableOpacity
                    key={insight.id}
                    style={[styles.insightCard, { backgroundColor: currentColors.surface }]}
                    onPress={() => router.push('/explore')}
                  >
                    <View style={[styles.insightIconContainer, { backgroundColor: getInsightColor(insight.type) + '15' }]}>
                      <IconSymbol name={getInsightIcon(insight.type)} size={20} color={getInsightColor(insight.type)} />
                    </View>
                    <Text style={[styles.insightTitle, { color: currentColors.text }]} numberOfLines={1}>
                      {insight.title}
                    </Text>
                    <Text style={[styles.insightDescription, { color: currentColors.textSecondary }]} numberOfLines={2}>
                      {insight.description}
                    </Text>
                    {insight.metric && (
                      <Text style={[styles.insightMetric, { color: insight.metric.change >= 0 ? Colors.success : Colors.error }]}>
                        {insight.metric.change >= 0 ? '+' : ''}{insight.metric.change}{insight.metric.unit}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* TOP PERFORMERS - Full Width */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.sectionContainer}>
            <View style={[styles.performersCard, { backgroundColor: currentColors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.primary + '15' }]}>
                    <IconSymbol name="trophy.fill" size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.cardTitle, { color: currentColors.text }]}>Top Performers</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/teams')}>
                  <Text style={[styles.cardLink, { color: Colors.primary }]}>View All</Text>
                </TouchableOpacity>
              </View>

              {/* Header Row for Tablet */}
              {isTablet && (
                <View style={styles.performerHeaderRow}>
                  <Text style={[styles.performerHeaderText, { color: currentColors.textSecondary, width: 32 }]}>#</Text>
                  <Text style={[styles.performerHeaderText, { color: currentColors.textSecondary, flex: 1, marginLeft: 48 }]}>Player</Text>
                  <Text style={[styles.performerHeaderText, { color: currentColors.textSecondary, width: 60, textAlign: 'center' }]}>POS</Text>
                  <Text style={[styles.performerHeaderText, { color: currentColors.textSecondary, width: 70, textAlign: 'right' }]}>Stat</Text>
                  <Text style={[styles.performerHeaderText, { color: currentColors.textSecondary, width: 50, textAlign: 'center' }]}>Trend</Text>
                </View>
              )}

              {topPerformers.slice(0, isTablet ? 5 : 4).map((performer, index) => (
                <TouchableOpacity
                  key={performer.playerId}
                  style={[
                    styles.performerRow,
                    index < (isTablet ? 4 : 3) && { borderBottomWidth: 1, borderBottomColor: currentColors.border }
                  ]}
                  onPress={() => router.push('/teams')}
                >
                  <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <PlayerAvatar
                    name={performer.name}
                    imageUri={performer.avatarUrl}
                    jerseyNumber={performer.jerseyNumber}
                    size="small"
                    variant="default"
                  />
                  <View style={styles.performerInfo}>
                    <Text style={[styles.performerName, { color: currentColors.text }]} numberOfLines={1}>
                      {performer.name}
                    </Text>
                    {!isTablet && (
                      <Text style={[styles.performerPosition, { color: currentColors.textSecondary }]}>
                        {performer.position || 'Player'}
                      </Text>
                    )}
                  </View>
                  {isTablet && (
                    <Text style={[styles.performerPosText, { color: currentColors.textSecondary }]}>
                      {performer.position || '-'}
                    </Text>
                  )}
                  <View style={styles.performerStatContainer}>
                    <Text style={[styles.performerStatValue, { color: Colors.primary }]}>
                      {performer.statValue}
                    </Text>
                    <Text style={[styles.performerStatLabel, { color: currentColors.textSecondary }]}>
                      {performer.statLabel}
                    </Text>
                  </View>
                  {isTablet && (
                    <View style={styles.performerTrendContainer}>
                      {performer.trend === 'up' && (
                        <IconSymbol name="arrow.up" size={14} color={Colors.success} />
                      )}
                      {performer.trend === 'down' && (
                        <IconSymbol name="arrow.down" size={14} color={Colors.error} />
                      )}
                      {performer.trend === 'stable' && (
                        <IconSymbol name="minus" size={14} color={currentColors.textSecondary} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* GAMES - Full Width */}
          <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.sectionContainer}>
            <View style={[styles.gamesCard, { backgroundColor: currentColors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.headerBackground + '15' }]}>
                    <IconSymbol name="sportscourt.fill" size={18} color={Colors.headerBackground} />
                  </View>
                  <Text style={[styles.cardTitle, { color: currentColors.text }]}>Games</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/games')}>
                  <Text style={[styles.cardLink, { color: Colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>

              {/* Upcoming Game - Prominent on its own row */}
              {upcomingGame && (
                <TouchableOpacity
                  style={[styles.upcomingGameCard, { backgroundColor: Colors.primary + '08' }]}
                  onPress={() => router.push('/games')}
                >
                  <View style={[styles.upcomingGameContent, isTablet && styles.upcomingGameContentTablet]}>
                    <View style={styles.upcomingGameLeft}>
                      <View style={styles.upcomingGameHeader}>
                        <View style={[styles.upcomingBadge, { backgroundColor: Colors.primary }]}>
                          <Text style={styles.upcomingBadgeText}>NEXT GAME</Text>
                        </View>
                        <Text style={[styles.upcomingCountdown, { color: Colors.primary }]}>
                          {(() => {
                            const diff = new Date(upcomingGame.dateTime).getTime() - new Date().getTime();
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`;
                          })()}
                        </Text>
                      </View>
                      <Text style={[styles.upcomingOpponent, { color: currentColors.text }]}>
                        vs {upcomingGame.opponent}
                      </Text>
                    </View>
                    <View style={[styles.upcomingGameRight, isTablet && styles.upcomingGameRightTablet]}>
                      <View style={styles.upcomingDetail}>
                        <IconSymbol name="calendar" size={16} color={currentColors.textSecondary} />
                        <Text style={[styles.upcomingDetailText, { color: currentColors.textSecondary }]}>
                          {new Date(upcomingGame.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <View style={styles.upcomingDetail}>
                        <IconSymbol name="clock" size={16} color={currentColors.textSecondary} />
                        <Text style={[styles.upcomingDetailText, { color: currentColors.textSecondary }]}>
                          {new Date(upcomingGame.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.upcomingDetail}>
                        <IconSymbol name="mappin" size={16} color={currentColors.textSecondary} />
                        <Text style={[styles.upcomingDetailText, { color: currentColors.textSecondary }]} numberOfLines={1}>
                          {upcomingGame.venue}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Recent Games */}
              <Text style={[styles.recentGamesLabel, { color: currentColors.textSecondary }]}>Recent Results</Text>

              {/* Games Grid for Tablet, List for Phone */}
              <View style={[styles.gamesGrid, isTablet && styles.gamesGridTablet]}>
                {recentGames.slice(0, isTablet ? 6 : 4).map((game, index) => {
                  const isHomeTeam = game.home_team_id === selectedTeam?.team_id;
                  const opponent = isHomeTeam ? game.away_team_name : game.home_team_name;
                  const teamScore = isHomeTeam ? game.home_score : game.away_score;
                  const opponentScore = isHomeTeam ? game.away_score : game.home_score;
                  const win = teamScore > opponentScore;

                  return (
                    <TouchableOpacity
                      key={game.game_id || index}
                      style={[
                        styles.gameCard,
                        { backgroundColor: currentColors.surface },
                        isTablet && styles.gameCardTablet
                      ]}
                      onPress={() => router.push('/games')}
                    >
                      <View style={styles.gameCardHeader}>
                        <View style={[styles.gameResultBadge, { backgroundColor: win ? Colors.success + '15' : Colors.error + '15' }]}>
                          <Text style={[styles.gameResultText, { color: win ? Colors.success : Colors.error }]}>
                            {win ? 'W' : 'L'}
                          </Text>
                        </View>
                        <Text style={[styles.gameCardScore, { color: win ? Colors.success : Colors.error }]}>
                          {teamScore}-{opponentScore}
                        </Text>
                      </View>
                      <Text style={[styles.gameCardOpponent, { color: currentColors.text }]} numberOfLines={1}>
                        vs {opponent || 'Opponent'}
                      </Text>
                      <Text style={[styles.gameCardDate, { color: currentColors.textSecondary }]}>
                        {game.game_date ? new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {recentGames.length === 0 && !upcomingGame && (
                <View style={styles.emptyGames}>
                  <IconSymbol name="sportscourt" size={32} color={currentColors.textLight} />
                  <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                    No games scheduled
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for insight/video icons and colors
function getInsightIcon(type: string) {
  switch (type) {
    case 'improvement': return 'arrow.up.circle.fill';
    case 'trend': return 'chart.line.uptrend.xyaxis';
    case 'alert': return 'exclamationmark.triangle.fill';
    case 'recommendation': return 'lightbulb.fill';
    default: return 'sparkles';
  }
}

function getInsightColor(type: string) {
  switch (type) {
    case 'improvement': return Colors.success;
    case 'trend': return Colors.info;
    case 'alert': return Colors.warning;
    case 'recommendation': return Colors.primary;
    default: return Colors.primary;
  }
}

function getRankColor(index: number): string {
  switch (index) {
    case 0: return '#FFD700'; // Gold
    case 1: return '#C0C0C0'; // Silver
    case 2: return '#CD7F32'; // Bronze
    default: return Colors.primary;
  }
}

export default function DashboardScreen() {
  return (
    <ComponentErrorBoundary componentName="DashboardScreen">
      <DashboardScreenContent />
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

  // Header
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
  greeting: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
  coachName: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },

  // Content
  content: {
    flex: 1,
  },

  // Demo Banner
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  demoBannerText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },

  // Main Content Layout
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Team Card (Navy Gradient Hero)
  teamCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  teamTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  teamLabel: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  teamName: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  teamStat: {
    alignItems: 'center',
    flex: 1,
  },
  teamStatValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamStatLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  teamStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Section Container
  sectionContainer: {
    // marginTop handled by gap
  },

  // AI Insights Card
  aiInsightsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  insightsGrid: {
    gap: Spacing.sm,
  },
  insightsGridTablet: {
    flexDirection: 'row',
  },
  insightCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  insightTitle: {
    fontSize: Typography.subhead,
    fontWeight: '700',
  },
  insightDescription: {
    fontSize: Typography.footnote,
    lineHeight: Typography.footnote * 1.4,
  },
  insightMetric: {
    fontSize: Typography.subhead,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },

  // Card Header (shared)
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  cardLink: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },

  // Performers Card - Full Width
  performersCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  performerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  performerHeaderText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: '#000',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  performerPosition: {
    fontSize: Typography.footnote,
    marginTop: 2,
  },
  performerPosText: {
    width: 60,
    fontSize: Typography.subhead,
    fontWeight: '500',
    textAlign: 'center',
  },
  performerStatContainer: {
    width: 70,
    alignItems: 'flex-end',
  },
  performerStatValue: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  performerStatLabel: {
    fontSize: Typography.caption,
    marginTop: 2,
  },
  performerTrendContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Games Card - Full Width
  gamesCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  upcomingGameCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  upcomingGameContent: {
    gap: Spacing.md,
  },
  upcomingGameContentTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingGameLeft: {
    flex: 1,
  },
  upcomingGameRight: {
    gap: Spacing.sm,
  },
  upcomingGameRightTablet: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  upcomingGameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  upcomingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  upcomingCountdown: {
    fontSize: Typography.subhead,
    fontWeight: '700',
  },
  upcomingOpponent: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  upcomingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  upcomingDetailText: {
    fontSize: Typography.subhead,
  },
  recentGamesLabel: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  gamesGrid: {
    gap: Spacing.sm,
  },
  gamesGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gameCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  gameCardTablet: {
    width: '31%',
    marginRight: '2%',
    marginBottom: Spacing.sm,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  gameResultBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameResultText: {
    fontSize: Typography.subhead,
    fontWeight: '700',
  },
  gameCardScore: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  gameCardOpponent: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    marginBottom: 2,
  },
  gameCardDate: {
    fontSize: Typography.footnote,
  },

  // Empty States
  emptyGames: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.subhead,
  },
});
