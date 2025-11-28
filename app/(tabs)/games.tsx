import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Easing, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from '@/components/games/GameCard';
import SeasonSummary from '@/components/games/SeasonSummary';
import GameVideoModal from '@/components/games/GameVideoModal';
import { Game } from '@/types/game';
import gameService from '@/services/api/gameService';
import teamService from '@/services/api/teamService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

// Animation configurations
const ANIMATION_CONFIG = {
  expand: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  fade: {
    duration: 200,
    easing: Easing.ease,
  },
  stagger: 50,
};

// Mock games for demo/fallback
const MOCK_GAMES = mockGames;

function RecentGamesScreenContent() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoGame, setSelectedVideoGame] = useState<Game | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const { currentColors, isDark } = useTheme();
  const { isDemoMode } = useAuth();

  useEffect(() => {
    loadGames();
    loadSelectedTeam();
  }, []);

  const loadSelectedTeam = async () => {
    try {
      // Try to get the selected team from storage or API
      const teamId = await AsyncStorage.getItem('selected_team_id');
      if (teamId) {
        const team = await teamService.getTeamById(teamId);
        setSelectedTeam(team);
      } else {
        // Fallback to mock team
        setSelectedTeam(mockTeams[0]);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
      setSelectedTeam(mockTeams[0]);
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

      // ✅ Use mock data in demo mode
      if (isDemoMode) {
        console.log('📦 Using mock games (Demo Mode)');
        setGames(MOCK_GAMES);
        setUsingMockData(true);
        return;
      }

      // ✅ Get org_id from AsyncStorage
      const orgId = await AsyncStorage.getItem('current_org_id');
      const teamId = await AsyncStorage.getItem('selected_team_id');

      console.log('🏀 Fetching games from API...');
      console.log('   Org ID:', orgId || 'all');
      console.log('   Team ID:', teamId || 'all');

      // ✅ Use real API service
      const data = await gameService.getGames({
        org_id: orgId || undefined,
        team_id: teamId || undefined,
        status: 'completed' // Only show completed games
      });

      console.log('✅ Games fetched:', data.length);

      // ✅ Transform API data to match component format
      const transformedGames = data.map((game: any) => ({
        id: game.game_id,
        homeTeam: {
          id: game.home_team_id,
          name: game.home_team_name,
          // Add more team details if available
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
      setUsingMockData(false);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load games';

      // ✅ Fallback to mock data on error
      console.error('❌ API fetch failed, using mock data:', err);
      console.log('📦 Using mock games (API Fallback)');
      setGames(MOCK_GAMES);
      setUsingMockData(true);
      setError('Unable to connect to server. Using sample data.');

      Sentry.captureException(err, {
        tags: { screen: 'games', action: 'load_games' },
        extra: {
          isRefresh,
          errorMessage: errorMsg
        }
      });

      console.error('Error loading games:', err);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format game dates
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

  // ✅ Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={Gradients.primary.colors}
            start={Gradients.primary.start}
            end={Gradients.primary.end}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Loading games...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={isDark 
            ? [currentColors.headerBackground, currentColors.background]
            : [currentColors.headerBackground, currentColors.background]
          }
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.logoContainer}>
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.logoBox, Shadows.primaryGlow]}
              >
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.logoSubtext, { color: currentColors.text }]}>AthlosCore™</Text>
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>Recent Games</Text>
              </View>
            </Animated.View>

            <Animated.View 
              entering={FadeIn.delay(400).duration(600)}
              key={mockCoach.id}
            >
              <PlayerAvatar
                name={mockCoach.name}
                imageUri={mockCoach.imageUri}
                size="medium"
                variant="gradient"
                showJerseyNumber={false}
                online
              />
            </Animated.View>
          </View>
        </LinearGradient>
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
            progressBackgroundColor={currentColors.cardBackground}
          />
        }
      >
        {/* Season Summary */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
        >
          <SeasonSummary team={selectedTeam || mockTeams[0]} />
        </Animated.View>

        {/* ✅ Mock Data Banner */}
        {usingMockData && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.mockDataBanner, { backgroundColor: currentColors.warning + '15' }]}
          >
            <IconSymbol
              name="info.circle.fill"
              size={20}
              color={currentColors.warning}
            />
            <Text style={[styles.mockDataText, { color: currentColors.warning }]}>
              {isDemoMode ? 'Demo Mode - Sample Games' : 'Using sample data - API unavailable'}
            </Text>
          </Animated.View>
        )}

        {/* Section Header */}
        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Game History
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.filterText, { color: currentColors.primary }]}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Games List */}
        <View style={styles.gamesContainer}>
          {games.map((game, index) => (
            <Animated.View
              key={game.id}
              entering={SlideInRight.delay(1000 + index * ANIMATION_CONFIG.stagger).springify()}
              exiting={FadeOutUp.duration(ANIMATION_CONFIG.fade.duration)}
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

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Video Modal */}
      {videoModalVisible && (
        <Animated.View
          entering={FadeIn.duration(ANIMATION_CONFIG.fade.duration)}
          exiting={FadeOut.duration(ANIMATION_CONFIG.fade.duration)}
          style={StyleSheet.absoluteFill}
        >
          <GameVideoModal
            visible={videoModalVisible}
            onClose={() => setVideoModalVisible(false)}
            game={selectedVideoGame}
            videoData={selectedVideoGame ? getMockVideoData(selectedVideoGame.id) : { videoUrl: '', timelineMarkers: [], tags: [] }}
            currentColors={currentColors}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

export default function RecentGamesScreen() {
  return (
    <ComponentErrorBoundary componentName="RecentGamesScreen">
      <RecentGamesScreenContent />
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
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  mockDataText: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  headerGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: Typography.title2,
    fontWeight: '900',
    color: Colors.textOnPrimary,
  },
  logoSubtext: {
    fontSize: Typography.callout,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoTagline: {
    fontSize: Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
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
  filterText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  gamesContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  bottomSpacing: {
    height: Spacing.xxxl,
  },
});