// File: app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Gradients, Spacing, Typography } from '@/constants/theme';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import QuickStats from '@/components/dashboard/QuickStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentGames from '@/components/dashboard/RecentGames';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import PlayerSpotlight from '@/components/dashboard/PlayerSpotlight';
import userService from '@/services/api/userService';
import teamService from '@/services/api/teamService';
import playerService from '@/services/api/playerService';
import gameService from '@/services/api/gameService';
import videoService from '@/services/api/videoService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

function DashboardScreenContent() {
  const { currentColors, isDark } = useTheme();
  const { isDemoMode } = useAuth();

  // Local state
  const [coach, setCoach] = useState<Coach | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
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

      // Use mock data in demo mode
      if (isDemoMode) {
        console.log('📦 Using mock data (Demo Mode)');
        setCoach(mockCoach);
        setSelectedTeam(mockTeams[0]);
        setPlayers(mockTeams[0].players);
        setRecentGames(mockGames);
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

      // Load coach profile
      await loadCoachProfile();

      // Load selected team
      const teamId = await AsyncStorage.getItem('selected_team_id');
      if (teamId) {
        await loadTeamData(teamId);
      } else {
        // Fall back to mock data if no team selected
        console.log('⚠️ No team selected, using mock data');
        setSelectedTeam(mockTeams[0]);
        setPlayers(mockTeams[0].players.slice(0, 3));
        setUsingMockData(true);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('❌ Dashboard load error:', err);

      // Fall back to mock data on error
      setCoach(mockCoach);
      setSelectedTeam(mockTeams[0]);
      setPlayers(mockTeams[0].players);
      setRecentGames(mockGames);
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
        extra: { errorMessage: errorMsg }
      });

    } finally {
      setLoading(false);
    }
  };

  const loadCoachProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setCoach({
        id: profile.user_id,
        name: profile.name || profile.email,
        email: profile.email,
        imageUri: profile.avatar_url,
      });
      console.log('✅ Coach profile loaded:', profile.name || profile.email);
    } catch (err) {
      console.error('Failed to load coach profile:', err);
      setCoach(mockCoach);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      // Load team details
      const team = await teamService.getTeamById(teamId);
      setSelectedTeam(team);
      console.log('✅ Team loaded:', team.name);

      // Load team players
      const teamPlayers = await playerService.getPlayers({ team_id: teamId });
      setPlayers(teamPlayers);
      console.log('✅ Players loaded:', teamPlayers.length);

      // Load recent games
      const games = await gameService.getRecentGames(teamId, 5);
      setRecentGames(games);
      console.log('✅ Recent games loaded:', games.length);

      // Load team stats
      await loadTeamStats(teamId);

      // Load video count
      const orgId = await AsyncStorage.getItem('current_org_id');
      const videos = await videoService.getVideos({
        org_id: orgId || undefined,
        status: 'completed'
      });

      setTeamStats(prev => ({
        ...prev,
        totalFilms: videos.length,
      }));

      setUsingMockData(false);

    } catch (err) {
      console.error('Failed to load team data:', err);
      // Don't set mock data here, let the parent error handler do it
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
        totalFilms: 0, // Will be updated separately
        fieldGoalPercentage: stats.field_goal_percentage || 0,
        rebounds: stats.average_rebounds || 0,
        turnovers: stats.average_turnovers || 0,
      });

      console.log('✅ Team stats loaded');
    } catch (err) {
      console.error('Failed to load team stats:', err);
      // Use default stats on error
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

  const handleAction = (actionId: string) => {
    const routes: Record<string, string> = {
      'team-selection': '/teams',
      'analytics': '/explore',
      'upload': '/videos',
      'ai-analysis': '/explore',
      'watch-full': '/videos',
    };

    if (routes[actionId]) {
      router.push(routes[actionId]);
    }
  };

  // Quick stats data from API
  const quickStatsData = [
    {
      icon: 'chart.line.uptrend.xyaxis',
      value: teamStats.avgPoints.toFixed(1),
      label: 'Avg Points',
      accessibilityLabel: `Average points: ${teamStats.avgPoints.toFixed(1)} per game`
    },
    {
      icon: 'person.3.fill',
      value: players.length,
      label: 'Players',
      accessibilityLabel: `${players.length} players on roster`
    },
    {
      icon: 'video.fill',
      value: teamStats.totalFilms,
      label: 'Game Films',
      accessibilityLabel: `${teamStats.totalFilms} game films uploaded`
    },
  ];

  const quickActionsData = [
    {
      id: 'team-selection',
      icon: 'person.fill',
      label: 'Team\nManagement',
      gradient: Gradients.primary,
      accessibilityLabel: 'Team Management',
      accessibilityHint: 'View and manage your team roster'
    },
    {
      id: 'analytics',
      icon: 'chart.bar.fill',
      label: 'Statistics &\nAnalytics',
      gradient: { colors: [Colors.info, Colors.primary] },
      accessibilityLabel: 'Statistics and Analytics',
      accessibilityHint: 'View team and player statistics'
    },
    {
      id: 'upload',
      icon: 'video.fill',
      label: 'Upload Game\nFilm',
      gradient: { colors: [Colors.success, '#10B981'] },
      accessibilityLabel: 'Upload Game Film',
      accessibilityHint: 'Upload and analyze new game footage'
    },
    {
      id: 'ai-analysis',
      icon: 'star.fill',
      label: 'AI Game\nAnalysis',
      gradient: { colors: [Colors.warning, '#F59E0B'] },
      accessibilityLabel: 'AI Game Analysis',
      accessibilityHint: 'Get AI-powered insights on game performance'
    },
  ];

  // Transform recent games for dashboard display
  const recentGamesData = recentGames.slice(0, 2).map((game: any) => {
    const isHomeTeam = game.home_team_id === selectedTeam?.team_id;
    const opponent = isHomeTeam ? game.away_team_name : game.home_team_name;
    const teamScore = isHomeTeam ? game.home_score : game.away_score;
    const opponentScore = isHomeTeam ? game.away_score : game.home_score;
    const win = teamScore > opponentScore;
    const score = `${teamScore}-${opponentScore}`;
    const date = formatGameDate(game.game_date);

    return {
      home: selectedTeam?.name || 'Team',
      away: opponent,
      score,
      date,
      win,
      accessibilityLabel: `${win ? 'Win' : 'Loss'} against ${opponent}, ${date}, final score ${score}`,
      accessibilityHint: 'Tap to view game details and statistics'
    };
  });

  // Helper function to format game dates
  const formatGameDate = (dateString?: string): string => {
    if (!dateString) return 'TBD';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  const performanceStatsData = [
    {
      label: 'FG%',
      value: `${Math.round(teamStats.fieldGoalPercentage)}%`,
      icon: 'chart.bar.fill',
      accessibilityLabel: `Field goal percentage: ${Math.round(teamStats.fieldGoalPercentage)} percent`
    },
    {
      label: 'Rebounds',
      value: `${Math.round(teamStats.rebounds)}`,
      icon: 'arrow.up.circle.fill',
      accessibilityLabel: `Average rebounds: ${Math.round(teamStats.rebounds)} per game`
    },
    {
      label: 'Turnovers',
      value: `${Math.round(teamStats.turnovers)}`,
      icon: 'arrow.down.circle.fill',
      accessibilityLabel: `Average turnovers: ${Math.round(teamStats.turnovers)} per game`
    },
  ];

  // Calculate team record
  const wins = Math.round((teamStats.winRate / 100) * teamStats.totalGames);
  const losses = teamStats.totalGames - wins;
  const teamRecord = `${wins}-${losses}`;
  const nextGame = 'TBD'; // TODO: Get next upcoming game from API

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

  // No team selected state
  if (!selectedTeam && !usingMockData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <DashboardHeader
          coachName={coach?.name || 'Coach'}
          coachImageUri={coach?.imageUri}
          currentColors={currentColors}
        />

        <View style={styles.emptyContainer}>
          <IconSymbol
            name="sportscourt.fill"
            size={64}
            color={currentColors.textLight}
          />
          <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
            No Team Selected
          </Text>
          <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
            Select a team to view your dashboard
          </Text>
          <TouchableOpacity
            style={[styles.selectTeamButton, { backgroundColor: currentColors.primary }]}
            onPress={() => router.push('/teams')}
          >
            <IconSymbol name="person.3.fill" size={20} color="#FFFFFF" />
            <Text style={styles.selectTeamButtonText}>Select Team</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      accessibilityLabel="Dashboard screen"
    >
      <DashboardHeader
        coachName={coach?.name || 'Coach'}
        coachImageUri={coach?.imageUri}
        currentColors={currentColors}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Dashboard content"
      >
        <WelcomeHero
          coachName={coach?.name || 'Coach'}
          coachImageUri={coach?.imageUri}
          record={teamRecord}
          nextGame={nextGame}
          onViewFilm={() => router.push('/videos')}
          accessibilityLabel={`Welcome back, ${coach?.name}. ${selectedTeam?.name || 'Team'} record: ${teamRecord}`}
          viewFilmAccessibilityLabel="View recent game film"
        />

        <QuickStats
          stats={quickStatsData}
          currentColors={currentColors}
          sectionAccessibilityLabel="Quick statistics section"
        />

        <QuickActions
          actions={quickActionsData}
          onActionPress={handleAction}
          currentColors={currentColors}
          sectionAccessibilityLabel="Quick actions section"
        />

        {/* Mock Data Banner */}
        {usingMockData && (
          <View style={[styles.mockDataBanner, { backgroundColor: currentColors.warning + '15' }]}>
            <IconSymbol
              name="info.circle.fill"
              size={20}
              color={currentColors.warning}
            />
            <Text style={[styles.mockDataText, { color: currentColors.warning }]}>
              {isDemoMode ? 'Demo Mode - Sample Data' : 'Using sample data - API unavailable'}
            </Text>
          </View>
        )}

        <RecentGames
          games={recentGamesData}
          onSeeAll={() => router.push('/games')}
          onGamePress={() => router.push('/games')}
          onCategoryPress={() => router.push('/videos')}
          onWatchFilm={() => handleAction('watch-full')}
          currentColors={currentColors}
          sectionAccessibilityLabel="Recent games section"
          seeAllAccessibilityLabel="See all games"
          seeAllAccessibilityHint="View complete game history"
        />

        <View style={styles.bottomGrid}>
          <TeamPerformance
            winRate={teamStats.winRate}
            stats={performanceStatsData}
            onPress={() => router.push('/explore')}
            accessibilityLabel={`Team performance: ${teamStats.winRate} percent win rate`}
            accessibilityHint="Tap to view detailed team analytics"
          />

          <PlayerSpotlight
            players={players.slice(0, 3)}
            onSeeAll={() => router.push('/teams')}
            onPlayerPress={() => router.push('/teams')}
            currentColors={currentColors}
            sectionAccessibilityLabel="Player spotlight section"
            seeAllAccessibilityLabel="See all players"
            seeAllAccessibilityHint="View complete team roster"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  content: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
    maxWidth: 300,
  },
  selectTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  selectTeamButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
  },
  mockDataText: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  bottomGrid: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
});
