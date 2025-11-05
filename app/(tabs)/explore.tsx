import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import ProgressIndicator from '@/components/ui/progressIndicator';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients, Animation } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import playerStatsService from '@/services/api/playerStatsService';
import playerService from '@/services/api/playerService';
import userService from '@/services/api/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';
import PlayerComparison from '@/components/analytics/PlayerComparison';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  height?: string;
  weight?: number;
  team_id: string;
  imageUri?: string;
}

interface PlayerStats {
  player_id: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  field_goals_made?: number;
  field_goals_attempted?: number;
  free_throws_made?: number;
  free_throws_attempted?: number;
  turnovers?: number;
  minutes_played?: number;
}

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

type Timeframe = 'season' | 'last5' | 'last10';

function PlayerAnalyticsContent() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [allPlayerStats, setAllPlayerStats] = useState<Map<string, PlayerStats>>(new Map());
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('season');
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const { isTablet, isLandscape } = useResponsive();
  const { currentColors, isDark } = useTheme();

  const scale = useSharedValue(1);

  const timeframes = [
    { id: 'season' as Timeframe, label: 'Full Season', icon: 'calendar' },
    { id: 'last10' as Timeframe, label: 'Last 10', icon: 'chart.bar.fill' },
    { id: 'last5' as Timeframe, label: 'Last 5', icon: 'chart.line.uptrend.xyaxis' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerStats(selectedPlayer.id);
    }
  }, [selectedPlayer, selectedTimeframe]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load coach profile
      await loadCoachProfile();

      // Load players
      await loadPlayers();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      
      Sentry.captureException(err, {
        tags: { screen: 'player_analytics', action: 'load_initial_data' },
        extra: { errorMessage: errorMsg }
      });
      
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
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
      console.error('Failed to load coach profile:', err);
      setCoach({
        id: 'default',
        name: 'Coach',
        email: 'coach@athloscore.com',
      });
    }
  };

  const loadPlayers = async () => {
    try {
      const teamId = await AsyncStorage.getItem('current_team_id');
      
      if (!teamId) {
        throw new Error('No team selected. Please select a team first.');
      }

      const { players: fetchedPlayers } = await playerService.getPlayers({ team_id: teamId });
      setPlayers(fetchedPlayers);

      // Load stats for all players for comparison
      await loadAllPlayersStats(fetchedPlayers, teamId);

      // Auto-select first player
      if (fetchedPlayers.length > 0 && !selectedPlayer) {
        setSelectedPlayer(fetchedPlayers[0]);
      }

    } catch (err) {
      throw err;
    }
  };

  const loadAllPlayersStats = async (playersList: Player[], teamId: string) => {
    try {
      const statsMap = new Map<string, PlayerStats>();
      
      // Load stats for each player
      await Promise.all(
        playersList.map(async (player) => {
          try {
            const stats = await playerStatsService.getPlayerStats(player.id, teamId);
            if (stats) {
              statsMap.set(player.id, stats);
            }
          } catch (err) {
            console.error(`Failed to load stats for player ${player.id}:`, err);
          }
        })
      );

      setAllPlayerStats(statsMap);
    } catch (err) {
      console.error('Failed to load all player stats:', err);
    }
  };

  const loadPlayerStats = async (playerId: string) => {
    try {
      const teamId = await AsyncStorage.getItem('current_team_id');
      
      if (!teamId) {
        return;
      }

      const stats = await playerStatsService.getPlayerStats(playerId, teamId);
      setPlayerStats(stats);

      // Also update in allPlayerStats
      if (stats) {
        setAllPlayerStats(prev => new Map(prev).set(playerId, stats));
      }

    } catch (err) {
      console.error('Failed to load player stats:', err);
      Sentry.captureException(err, {
        tags: { screen: 'player_analytics', action: 'load_player_stats' },
        extra: { playerId }
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPlayers();
      if (selectedPlayer) {
        await loadPlayerStats(selectedPlayer.id);
      }
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMsg);
    } finally {
      setRefreshing(false);
    }
  };

  const getFieldGoalPercentage = (): number => {
    if (!playerStats || !playerStats.field_goals_attempted || playerStats.field_goals_attempted === 0) {
      return 0;
    }
    return Math.round((playerStats.field_goals_made! / playerStats.field_goals_attempted) * 100);
  };

  const getFreeThrowPercentage = (): number => {
    if (!playerStats || !playerStats.free_throws_attempted || playerStats.free_throws_attempted === 0) {
      return 0;
    }
    return Math.round((playerStats.free_throws_made! / playerStats.free_throws_attempted) * 100);
  };

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
    const positions: Record<string, string> = {
      'PG': 'Point Guard',
      'SG': 'Shooting Guard',
      'SF': 'Small Forward',
      'PF': 'Power Forward',
      'C': 'Center'
    };
    return positions[pos] || pos;
  };

  const getDevelopmentAreas = (): Array<{area: string; priority: 'high' | 'medium' | 'low'; recommendation: string; icon: string}> => {
    if (!playerStats || !selectedPlayer) return [];
    
    const areas = [];
    const fgPercent = getFieldGoalPercentage();
    const ftPercent = getFreeThrowPercentage();

    if (fgPercent < 45) {
      areas.push({
        area: 'Shooting Accuracy',
        priority: 'high' as const,
        recommendation: 'Focus on form shooting and catch-and-shoot drills',
        icon: 'target'
      });
    }

    if (ftPercent < 75) {
      areas.push({
        area: 'Free Throw Shooting',
        priority: 'medium' as const,
        recommendation: 'Daily free throw routine with proper follow-through',
        icon: 'arrow.up.circle.fill'
      });
    }

    if (playerStats.turnovers && playerStats.turnovers > 3) {
      areas.push({
        area: 'Ball Security',
        priority: 'high' as const,
        recommendation: 'Ball handling drills and decision-making training',
        icon: 'hand.raised.fill'
      });
    }

    if (selectedPlayer.position === 'PG' && playerStats.assists && playerStats.assists < 6) {
      areas.push({
        area: 'Playmaking',
        priority: 'medium' as const,
        recommendation: 'Court vision drills and assist-focused scrimmages',
        icon: 'eye.fill'
      });
    }

    return areas.slice(0, 3);
  };

  const handleExportReport = () => {
    if (!selectedPlayer) return;
    
    Alert.alert(
      'Export Report',
      `Export analytics report for ${selectedPlayer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            console.log('Exporting report for:', selectedPlayer.name);
          }
        }
      ]
    );
  };

  const handleShareAnalysis = () => {
    if (!selectedPlayer) return;
    
    Alert.alert(
      'Share Analysis',
      `Share performance analysis for ${selectedPlayer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            console.log('Sharing analysis for:', selectedPlayer.name);
          }
        }
      ]
    );
  };

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error && players.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol 
            name="exclamationmark.triangle.fill" 
            size={48} 
            color={currentColors.error}
          />
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>
            Unable to Load Analytics
          </Text>
          <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: currentColors.primary }]}
            onPress={loadInitialData}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State
  if (players.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.emptyContainer}>
          <IconSymbol 
            name="person.3.fill" 
            size={64} 
            color={currentColors.textLight}
          />
          <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
            No Players Found
          </Text>
          <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
            Add players to your team to view analytics and performance insights.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const points = playerStats?.points || 0;
  const rebounds = playerStats?.rebounds || 0;
  const assists = playerStats?.assists || 0;
  const fgPercentage = getFieldGoalPercentage();
  const ftPercentage = getFreeThrowPercentage();
  const turnovers = playerStats?.turnovers || 0;
  const minutesPlayed = playerStats?.minutes_played || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Animated Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={[currentColors.headerBackground, currentColors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Animated.View 
              entering={FadeIn.delay(200).duration(600)}
              style={styles.logoContainer}
            >
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.logoBox, Shadows.primaryGlow]}
              >
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.logoSubtext, { color: currentColors.text }]}>
                  AthlosCore™
                </Text>
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>
                  Player Analytics
                </Text>
              </View>
            </Animated.View>

            {coach && (
              <Animated.View entering={FadeIn.delay(400).duration(600)}>
                <PlayerAvatar
                  name={coach.name}
                  imageUri={coach.imageUri}
                  size="medium"
                  variant="gradient"
                  showJerseyNumber={false}
                  online
                />
              </Animated.View>
            )}
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
          />
        }
      >
        {/* Hero Section */}
        <Animated.View entering={ZoomIn.delay(600).duration(800).springify()}>
          <Card variant="gradient" padding="large" style={styles.heroCard}>
            <View style={styles.heroContent}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={40} color="#FFFFFF" />
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Performance Insights</Text>
                <Text style={styles.heroSubtitle}>AI-powered player analytics & development</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Error Banner */}
        {error && players.length > 0 && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={[styles.errorBanner, { backgroundColor: currentColors.error + '15' }]}
          >
            <IconSymbol 
              name="exclamationmark.triangle.fill" 
              size={20} 
              color={currentColors.error}
            />
            <Text style={[styles.errorBannerText, { color: currentColors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}

        {/* Timeframe Selection */}
        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <View style={styles.timeframeContainer}>
            {timeframes.map((timeframe, index) => (
              <Animated.View 
                key={timeframe.id}
                entering={ZoomIn.delay(900 + index * 100).springify()}
                style={styles.timeframeWrapper}
              >
                <TouchableOpacity
                  onPress={() => setSelectedTimeframe(timeframe.id)}
                  style={[
                    styles.timeframeButton,
                    { backgroundColor: currentColors.surface, borderColor: currentColors.border }
                  ]}
                  activeOpacity={0.7}
                >
                  {selectedTimeframe === timeframe.id ? (
                    <LinearGradient
                      colors={Gradients.primary.colors}
                      style={styles.timeframeGradient}
                    >
                      <IconSymbol name={timeframe.icon} size={18} color="#FFFFFF" />
                      <Text style={styles.selectedTimeframeText}>{timeframe.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.timeframeInner}>
                      <IconSymbol name={timeframe.icon} size={18} color={currentColors.textSecondary} />
                      <Text style={[styles.timeframeText, { color: currentColors.text }]}>
                        {timeframe.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Player Selection */}
        <Animated.View entering={SlideInRight.delay(1000).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Select Player
            </Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerScrollContent}
          >
            {players.map((player, index) => (
              <Animated.View
                key={player.id}
                entering={ZoomIn.delay(1100 + index * 100).springify()}
              >
                <TouchableOpacity
                  onPress={() => setSelectedPlayer(player)}
                  activeOpacity={0.8}
                  style={styles.playerOptionWrapper}
                >
                  <Card
                    variant={selectedPlayer?.id === player.id ? "gradient" : "elevated"}
                    padding="medium"
                    style={styles.playerOption}
                  >
                    <PlayerAvatar
                      name={player.name}
                      imageUri={player.imageUri}
                      jerseyNumber={player.jersey_number}
                      size="medium"
                      variant={selectedPlayer?.id === player.id ? "glow" : "default"}
                    />
                    <Text style={[
                      styles.playerOptionName,
                      { color: selectedPlayer?.id === player.id ? '#FFFFFF' : currentColors.text }
                    ]}>
                      {player.name.split(' ')[0]}
                    </Text>
                    <Text style={[
                      styles.playerPosition,
                      { color: selectedPlayer?.id === player.id ? '#FFFFFF' : currentColors.textSecondary }
                    ]}>
                      #{player.jersey_number}
                    </Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Player Overview */}
        {selectedPlayer && (
          <Animated.View entering={FadeInUp.delay(1400).springify()}>
            <Card variant="elevated_high" padding="large" style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <PlayerAvatar
                  name={selectedPlayer.name}
                  imageUri={selectedPlayer.imageUri}
                  jerseyNumber={selectedPlayer.jersey_number}
                  size="xlarge"
                  variant="gradient"
                />
                <View style={styles.overviewInfo}>
                  <Text style={[styles.overviewName, { color: currentColors.text }]}>
                    {selectedPlayer.name}
                  </Text>
                  <View style={[styles.positionBadge, { backgroundColor: currentColors.primary }]}>
                    <Text style={styles.positionText}>
                      #{selectedPlayer.jersey_number} • {getPositionName(selectedPlayer.position)}
                    </Text>
                  </View>
                  <View style={styles.overviewStats}>
                    <IconSymbol name="clock.fill" size={16} color={currentColors.primary} />
                    <Text style={[styles.overviewMinutes, { color: currentColors.textSecondary }]}>
                      {minutesPlayed} min/game
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Performance Metrics Grid */}
        {playerStats && (
          <View style={styles.metricsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Performance Metrics
              </Text>
            </View>

            <View style={styles.metricsGrid}>
              {[
                { label: 'Points', value: points, icon: 'star.fill', type: 'points' as const, gradient: Gradients.primary },
                { label: 'Rebounds', value: rebounds, icon: 'arrow.up.circle.fill', type: 'rebounds' as const, gradient: { colors: [Colors.success, '#22C55E'] } },
                { label: 'Assists', value: assists, icon: 'hand.point.up.fill', type: 'assists' as const, gradient: { colors: [Colors.info, Colors.primary] } },
                { label: 'FG%', value: fgPercentage, icon: 'target', type: 'fg%' as const, gradient: { colors: [Colors.warning, '#FBBF24'] } },
              ].map((metric, index) => (
                <Animated.View
                  key={metric.label}
                  entering={ZoomIn.delay(1600 + index * 100).springify()}
                  style={styles.metricCardWrapper}
                >
                  <Card variant="elevated_high" padding="none" style={styles.metricCard}>
                    <LinearGradient
                      colors={metric.gradient.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.metricGradientTop}
                    >
                      <IconSymbol name={metric.icon} size={28} color="#FFFFFF" />
                    </LinearGradient>
                    
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricLabel, { color: currentColors.textSecondary }]}>
                        {metric.label}
                      </Text>
                      <Text style={[styles.metricValue, { color: currentColors.text }]}>
                        {metric.value}{metric.label === 'FG%' && '%'}
                      </Text>
                      <View style={[
                        styles.ratingBadge,
                        { backgroundColor: getRatingColor(getPerformanceRating(metric.value, metric.type)) }
                      ]}>
                        <Text style={styles.ratingText}>
                          {getPerformanceRating(metric.value, metric.type).replace('-', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Stats */}
        {playerStats && (
          <Animated.View entering={FadeInUp.delay(2000).springify()}>
            <Card variant="elevated" padding="large" style={styles.additionalStatsCard}>
              <View style={styles.statsHeader}>
                <IconSymbol name="chart.bar.fill" size={24} color={currentColors.primary} />
                <Text style={[styles.sectionTitle, { color: currentColors.text, marginBottom: 0 }]}>
                  Additional Stats
                </Text>
              </View>

              <View style={styles.additionalStatsGrid}>
                <View style={styles.progressStatItem}>
                  <ProgressIndicator
                    progress={ftPercentage}
                    size={100}
                    variant="gradient"
                    animated
                    label="FT%"
                  />
                  <Text style={[styles.progressStatLabel, { color: currentColors.textSecondary }]}>
                    Free Throws
                  </Text>
                </View>

                <View style={styles.additionalStatItem}>
                  <View style={[styles.statCircle, { backgroundColor: currentColors.surface }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={24} color={Colors.error} />
                    <Text style={[styles.statCircleValue, { color: currentColors.text }]}>
                      {turnovers}
                    </Text>
                  </View>
                  <Text style={[styles.statCircleLabel, { color: currentColors.textSecondary }]}>
                    Turnovers
                  </Text>
                </View>

                <View style={styles.additionalStatItem}>
                  <View style={[styles.statCircle, { backgroundColor: currentColors.surface }]}>
                    <IconSymbol name="clock.fill" size={24} color={currentColors.primary} />
                    <Text style={[styles.statCircleValue, { color: currentColors.text }]}>
                      {minutesPlayed}
                    </Text>
                  </View>
                  <Text style={[styles.statCircleLabel, { color: currentColors.textSecondary }]}>
                    Minutes
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Development Areas */}
        {selectedPlayer && playerStats && getDevelopmentAreas().length > 0 && (
          <Animated.View entering={SlideInLeft.delay(2200).springify()}>
            <Card variant="gradient" padding="large" style={styles.developmentCard}>
              <View style={styles.developmentHeader}>
                <IconSymbol name="star.fill" size={28} color="#FFFFFF" />
                <View style={styles.developmentHeaderText}>
                  <Text style={styles.developmentTitle}>Development Areas</Text>
                  <Text style={styles.developmentSubtitle}>
                    AI-powered recommendations for {selectedPlayer.name.split(' ')[0]}
                  </Text>
                </View>
              </View>

              {getDevelopmentAreas().map((area, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.delay(2400 + index * 150).duration(400)}
                >
                  <BlurView intensity={20} tint="light" style={styles.developmentArea}>
                    <View style={styles.developmentAreaHeader}>
                      <View style={styles.developmentIconContainer}>
                        <IconSymbol name={area.icon} size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.developmentAreaInfo}>
                        <View style={styles.developmentAreaTitleRow}>
                          <Text style={styles.developmentAreaTitle}>{area.area}</Text>
                          <View style={[
                            styles.priorityBadge,
                            { backgroundColor: area.priority === 'high' ? Colors.error : area.priority === 'medium' ? Colors.warning : Colors.info }
                          ]}>
                            <Text style={styles.priorityText}>{area.priority.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.developmentRecommendation}>
                          {area.recommendation}
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                </Animated.View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Action Buttons */}
        {selectedPlayer && (
          <Animated.View 
            entering={FadeInUp.delay(2600).springify()}
            style={styles.actionButtons}
          >
            {/* Compare Players Button */}
            {players.length >= 2 && (
              <Button
                title="Compare Players"
                onPress={() => setShowComparison(true)}
                variant="primaryGradient"
                icon={<IconSymbol name="chart.bar.xaxis" size={18} color="#FFFFFF" />}
                style={styles.buttonWrapper}
              />
            )}

            <AnimatedPressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[buttonAnimatedStyle, styles.buttonWrapper]}
            >
              <Button
                title="Export Report"
                onPress={handleExportReport}
                variant="outline"
                icon={<IconSymbol name="square.and.arrow.up" size={18} color={currentColors.primary} />}
                fullWidth
              />
            </AnimatedPressable>
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Player Comparison Modal */}
      <Modal
        visible={showComparison}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowComparison(false)}
      >
        <PlayerComparison
          players={players}
          playerStats={allPlayerStats}
          onClose={() => setShowComparison(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

export default function PlayerAnalytics() {
  return (
    <ComponentErrorBoundary componentName="PlayerAnalytics">
      <PlayerAnalyticsContent />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
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
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.textOnPrimary,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  errorBannerText: {
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
  heroCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.callout,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  timeframeWrapper: {
    flex: 1,
  },
  timeframeButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  timeframeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  timeframeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  timeframeText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  selectedTimeframeText: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  playerScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  playerOptionWrapper: {
    marginRight: Spacing.sm,
  },
  playerOption: {
    alignItems: 'center',
    minWidth: 100,
  },
  playerOptionName: {
    fontSize: Typography.callout,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  playerPosition: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginTop: Spacing.xs / 2,
  },
  overviewCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewName: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  positionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  positionText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  overviewMinutes: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  metricsSection: {
    marginTop: Spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  metricCardWrapper: {
    width: (Dimensions.get('window').width - Spacing.xl * 2 - Spacing.md) / 2,
  },
  metricCard: {
    overflow: 'hidden',
  },
  metricGradientTop: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricContent: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  ratingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  additionalStatsCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  additionalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressStatItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressStatLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  additionalStatItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs / 2,
    ...Shadows.small,
  },
  statCircleValue: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  statCircleLabel: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  developmentCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  developmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  developmentHeaderText: {
    flex: 1,
  },
  developmentTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs / 2,
  },
  developmentSubtitle: {
    fontSize: Typography.callout,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  developmentArea: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  developmentAreaHeader: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  developmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  developmentAreaInfo: {
    flex: 1,
  },
  developmentAreaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  developmentAreaTitle: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  developmentRecommendation: {
    fontSize: Typography.callout,
    color: '#FFFFFF',
    lineHeight: Typography.callout * 1.4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  bottomSpacing: {
    height: Spacing.xxxl,
  },
});


// import Button from '@/components/ui/button';
// import Card from '@/components/ui/card';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import PlayerAvatar from '@/components/ui/playerAvatar';
// import ProgressIndicator from '@/components/ui/progressIndicator';
// import { BorderRadius, Colors, DarkColors, Layout, Spacing, Typography, Shadows, Gradients, Animation } from '@/constants/theme';
// import { Player, mockCoach, mockPlayers } from '@/data/mockData';
// import { useResponsive } from '@/hooks/useResponsive';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import React, { useState } from 'react';
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Pressable,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated, {
//   FadeIn,
//   FadeInDown,
//   FadeInUp,
//   SlideInRight,
//   SlideInLeft,
//   ZoomIn,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// export default function PlayerAnalytics() {
//   const [selectedPlayer, setSelectedPlayer] = useState<Player>(mockPlayers[0]);
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'season' | 'last5' | 'last10'>('season');
//   const { isTablet, isLandscape } = useResponsive();
//   const theme = useColorScheme() ?? 'light';
//   const isDark = theme === 'dark';
//   const currentColors = isDark ? DarkColors : Colors;

//   const scale = useSharedValue(1);

//   const timeframes = [
//     { id: 'season', label: 'Full Season', icon: 'calendar' },
//     { id: 'last10', label: 'Last 10', icon: 'chart.bar.fill' },
//     { id: 'last5', label: 'Last 5', icon: 'chart.line.uptrend.xyaxis' },
//   ];

//   const getPerformanceRating = (stat: number, type: 'points' | 'rebounds' | 'assists' | 'fg%' | 'ft%'): 'excellent' | 'good' | 'average' | 'needs-work' => {
//     const thresholds = {
//       points: { excellent: 20, good: 15, average: 10 },
//       rebounds: { excellent: 8, good: 6, average: 4 },
//       assists: { excellent: 6, good: 4, average: 2 },
//       'fg%': { excellent: 50, good: 45, average: 40 },
//       'ft%': { excellent: 80, good: 75, average: 70 },
//     };

//     const t = thresholds[type];
//     if (stat >= t.excellent) return 'excellent';
//     if (stat >= t.good) return 'good';
//     if (stat >= t.average) return 'average';
//     return 'needs-work';
//   };

//   const getRatingColor = (rating: string): string => {
//     switch (rating) {
//       case 'excellent': return Colors.success;
//       case 'good': return Colors.info;
//       case 'average': return Colors.warning;
//       case 'needs-work': return Colors.error;
//       default: return Colors.textSecondary;
//     }
//   };

//   const getPositionName = (pos: string): string => {
//     const positions = {
//       'PG': 'Point Guard',
//       'SG': 'Shooting Guard',
//       'SF': 'Small Forward',
//       'PF': 'Power Forward',
//       'C': 'Center'
//     };
//     return positions[pos as keyof typeof positions] || pos;
//   };

//   const getDevelopmentAreas = (player: Player): Array<{area: string; priority: 'high' | 'medium' | 'low'; recommendation: string; icon: string}> => {
//     const areas = [];

//     if (player.stats.fieldGoalPercentage < 45) {
//       areas.push({
//         area: 'Shooting Accuracy',
//         priority: 'high' as const,
//         recommendation: 'Focus on form shooting and catch-and-shoot drills',
//         icon: 'target'
//       });
//     }

//     if (player.stats.freeThrowPercentage < 75) {
//       areas.push({
//         area: 'Free Throw Shooting',
//         priority: 'medium' as const,
//         recommendation: 'Daily free throw routine with proper follow-through',
//         icon: 'arrow.up.circle.fill'
//       });
//     }

//     if (player.stats.turnovers > 3) {
//       areas.push({
//         area: 'Ball Security',
//         priority: 'high' as const,
//         recommendation: 'Ball handling drills and decision-making training',
//         icon: 'hand.raised.fill'
//       });
//     }

//     if (player.position === 'PG' && player.stats.assists < 6) {
//       areas.push({
//         area: 'Playmaking',
//         priority: 'medium' as const,
//         recommendation: 'Court vision drills and assist-focused scrimmages',
//         icon: 'eye.fill'
//       });
//     }

//     return areas.slice(0, 3);
//   };

//   const handlePressIn = () => {
//     scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
//   };

//   const handlePressOut = () => {
//     scale.value = withSpring(1, Animation.spring.bouncy);
//   };

//   const buttonAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
//       {/* Animated Header */}
//       <Animated.View entering={FadeInDown.duration(600).springify()}>
//         <LinearGradient
//           colors={[currentColors.headerBackground, currentColors.background]}
//           style={styles.headerGradient}
//         >
//           <View style={styles.headerContent}>
//             <Animated.View 
//               entering={FadeIn.delay(200).duration(600)}
//               style={styles.logoContainer}
//             >
//               <LinearGradient
//                 colors={Gradients.primary.colors}
//                 start={Gradients.primary.start}
//                 end={Gradients.primary.end}
//                 style={[styles.logoBox, Shadows.primaryGlow]}
//               >
//                 <Text style={styles.logoText}>A</Text>
//               </LinearGradient>
//               <View>
//                 <Text style={[styles.logoSubtext, { color: currentColors.text }]}>
//                   AthlosCore™
//                 </Text>
//                 <Text style={[styles.logoTagline, { color: currentColors.primary }]}>
//                   Player Analytics
//                 </Text>
//               </View>
//             </Animated.View>

//             <Animated.View entering={FadeIn.delay(400).duration(600)}>
//               <PlayerAvatar
//                 name={mockCoach.name}
//                 imageUri={mockCoach.imageUri}
//                 size="medium"
//                 variant="gradient"
//                 showJerseyNumber={false}
//                 online
//               />
//             </Animated.View>
//           </View>
//         </LinearGradient>
//       </Animated.View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Hero Section */}
//         <Animated.View entering={ZoomIn.delay(600).duration(800).springify()}>
//           <Card variant="gradient" padding="large" style={styles.heroCard}>
//             <View style={styles.heroContent}>
//               <IconSymbol name="chart.line.uptrend.xyaxis" size={40} color={'dark'} />
//               <View style={styles.heroText}>
//                 <Text style={styles.heroTitle}>Performance Insights</Text>
//                 <Text style={styles.heroSubtitle}>AI-powered player analytics & development</Text>
//               </View>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Timeframe Selection */}
//         <Animated.View entering={FadeInUp.delay(800).springify()}>
//           <View style={styles.timeframeContainer}>
//             {timeframes.map((timeframe, index) => (
//               <Animated.View 
//                 key={timeframe.id}
//                 entering={ZoomIn.delay(900 + index * 100).springify()}
//                 style={styles.timeframeWrapper}
//               >
//                 <TouchableOpacity
//                   onPress={() => setSelectedTimeframe(timeframe.id as any)}
//                   style={[
//                     styles.timeframeButton,
//                     { backgroundColor: currentColors.surface, borderColor: currentColors.border }
//                   ]}
//                   activeOpacity={0.7}
//                 >
//                   {selectedTimeframe === timeframe.id ? (
//                     <LinearGradient
//                       colors={Gradients.primary.colors}
//                       style={styles.timeframeGradient}
//                     >
//                       <IconSymbol name={timeframe.icon} size={18} color={'dark'} />
//                       <Text style={styles.selectedTimeframeText}>{timeframe.label}</Text>
//                     </LinearGradient>
//                   ) : (
//                     <View style={styles.timeframeInner}>
//                       <IconSymbol name={timeframe.icon} size={18} color={currentColors.textSecondary} />
//                       <Text style={[styles.timeframeText, { color: currentColors.text }]}>
//                         {timeframe.label}
//                       </Text>
//                     </View>
//                   )}
//                 </TouchableOpacity>
//               </Animated.View>
//             ))}
//           </View>
//         </Animated.View>

//         {/* Player Selection */}
//         <Animated.View entering={SlideInRight.delay(1000).springify()}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
//               Select Player
//             </Text>
//           </View>
          
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.playerScrollContent}
//           >
//             {mockPlayers.map((player, index) => (
//               <Animated.View
//                 key={player.id}
//                 entering={ZoomIn.delay(1100 + index * 100).springify()}
//               >
//                 <TouchableOpacity
//                   onPress={() => setSelectedPlayer(player)}
//                   activeOpacity={0.8}
//                   style={styles.playerOptionWrapper}
//                 >
//                   <Card
//                     variant={selectedPlayer.id === player.id ? "gradient" : "elevated"}
//                     padding="medium"
//                     style={styles.playerOption}
//                   >
//                     <PlayerAvatar
//                       name={player.name}
//                       imageUri={player.imageUri}
//                       jerseyNumber={player.jerseyNumber}
//                       size="medium"
//                       variant={selectedPlayer.id === player.id ? "glow" : "default"}
//                     />
//                     <Text style={[
//                       styles.playerOptionName,
//                       { color: selectedPlayer.id === player.id ? 'dark' : currentColors.text }
//                     ]}>
//                       {player.name.split(' ')[0]}
//                     </Text>
//                     <Text style={[
//                       styles.playerPosition,
//                       { color: selectedPlayer.id === player.id ? 'dark' : currentColors.textSecondary }
//                     ]}>
//                       #{player.jerseyNumber}
//                     </Text>
//                   </Card>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))}
//           </ScrollView>
//         </Animated.View>

//         {/* Player Overview with Stats */}
//         <Animated.View entering={FadeInUp.delay(1400).springify()}>
//           <Card variant="elevated_high" padding="large" style={styles.overviewCard}>
//             <View style={styles.overviewHeader}>
//               <PlayerAvatar
//                 name={selectedPlayer.name}
//                 imageUri={selectedPlayer.imageUri}
//                 jerseyNumber={selectedPlayer.jerseyNumber}
//                 size="xlarge"
//                 variant="gradient"
//               />
//               <View style={styles.overviewInfo}>
//                 <Text style={[styles.overviewName, { color: currentColors.text }]}>
//                   {selectedPlayer.name}
//                 </Text>
//                 <View style={[styles.positionBadge, { backgroundColor: currentColors.primary }]}>
//                   <Text style={styles.positionText}>
//                     #{selectedPlayer.jerseyNumber} • {getPositionName(selectedPlayer.position)}
//                   </Text>
//                 </View>
//                 <View style={styles.overviewStats}>
//                   <IconSymbol name="clock.fill" size={16} color={currentColors.primary} />
//                   <Text style={[styles.overviewMinutes, { color: currentColors.textSecondary }]}>
//                     {selectedPlayer.stats.minutesPlayed} min/game
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Performance Metrics Grid */}
//         <View style={styles.metricsSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
//               Performance Metrics
//             </Text>
//           </View>

//           <View style={styles.metricsGrid}>
//             {[
//               { label: 'Points', value: selectedPlayer.stats.points, icon: 'star.fill', type: 'points' as const, gradient: Gradients.primary },
//               { label: 'Rebounds', value: selectedPlayer.stats.rebounds, icon: 'arrow.up.circle.fill', type: 'rebounds' as const, gradient: { colors: [Colors.success, '#22C55E'] } },
//               { label: 'Assists', value: selectedPlayer.stats.assists, icon: 'hand.point.up.fill', type: 'assists' as const, gradient: { colors: [Colors.info, Colors.primary] } },
//               { label: 'FG%', value: selectedPlayer.stats.fieldGoalPercentage, icon: 'target', type: 'fg%' as const, gradient: { colors: [Colors.warning, '#FBBF24'] } },
//             ].map((metric, index) => (
//               <Animated.View
//                 key={metric.label}
//                 entering={ZoomIn.delay(1600 + index * 100).springify()}
//                 style={styles.metricCardWrapper}
//               >
//                 <Card variant="elevated_high" padding="none" style={styles.metricCard}>
//                   <LinearGradient
//                     colors={metric.gradient.colors}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                     style={styles.metricGradientTop}
//                   >
//                     <IconSymbol name={metric.icon} size={28} color={'dark'} />
//                   </LinearGradient>
                  
//                   <View style={styles.metricContent}>
//                     <Text style={[styles.metricLabel, { color: currentColors.textSecondary }]}>
//                       {metric.label}
//                     </Text>
//                     <Text style={[styles.metricValue, { color: currentColors.text }]}>
//                       {metric.value}{metric.label === 'FG%' && '%'}
//                     </Text>
//                     <View style={[
//                       styles.ratingBadge,
//                       { backgroundColor: getRatingColor(getPerformanceRating(metric.value, metric.type)) }
//                     ]}>
//                       <Text style={styles.ratingText}>
//                         {getPerformanceRating(metric.value, metric.type).replace('-', ' ').toUpperCase()}
//                       </Text>
//                     </View>
//                   </View>
//                 </Card>
//               </Animated.View>
//             ))}
//           </View>
//         </View>

//         {/* Additional Stats with Progress Circles */}
//         <Animated.View entering={FadeInUp.delay(2000).springify()}>
//           <Card variant="elevated" padding="large" style={styles.additionalStatsCard}>
//             <View style={styles.statsHeader}>
//               <IconSymbol name="chart.bar.fill" size={24} color={currentColors.primary} />
//               <Text style={[styles.sectionTitle, { color: currentColors.text, marginBottom: 0 }]}>
//                 Additional Stats
//               </Text>
//             </View>

//             <View style={styles.additionalStatsGrid}>
//               <View style={styles.progressStatItem}>
//                 <ProgressIndicator
//                   progress={selectedPlayer.stats.freeThrowPercentage}
//                   size={100}
//                   variant="gradient"
//                   animated
//                   label="FT%"
//                 />
//                 <Text style={[styles.progressStatLabel, { color: currentColors.textSecondary }]}>
//                   Free Throws
//                 </Text>
//               </View>

//               <View style={styles.additionalStatItem}>
//                 <View style={[styles.statCircle, { backgroundColor: currentColors.surface }]}>
//                   <IconSymbol name="exclamationmark.triangle.fill" size={24} color={Colors.error} />
//                   <Text style={[styles.statCircleValue, { color: currentColors.text }]}>
//                     {selectedPlayer.stats.turnovers}
//                   </Text>
//                 </View>
//                 <Text style={[styles.statCircleLabel, { color: currentColors.textSecondary }]}>
//                   Turnovers
//                 </Text>
//               </View>

//               <View style={styles.additionalStatItem}>
//                 <View style={[styles.statCircle, { backgroundColor: currentColors.surface }]}>
//                   <IconSymbol name="clock.fill" size={24} color={currentColors.primary} />
//                   <Text style={[styles.statCircleValue, { color: currentColors.text }]}>
//                     {selectedPlayer.stats.minutesPlayed}
//                   </Text>
//                 </View>
//                 <Text style={[styles.statCircleLabel, { color: currentColors.textSecondary }]}>
//                   Minutes
//                 </Text>
//               </View>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Development Areas */}
//         <Animated.View entering={SlideInLeft.delay(2200).springify()}>
//           <Card variant="gradient" padding="large" style={styles.developmentCard}>
//             <View style={styles.developmentHeader}>
//               <IconSymbol name="star.fill" size={28} color={'dark'} />
//               <View style={styles.developmentHeaderText}>
//                 <Text style={styles.developmentTitle}>Development Areas</Text>
//                 <Text style={styles.developmentSubtitle}>
//                   AI-powered recommendations for {selectedPlayer.name.split(' ')[0]}
//                 </Text>
//               </View>
//             </View>

//             {getDevelopmentAreas(selectedPlayer).map((area, index) => (
//               <Animated.View
//                 key={index}
//                 entering={FadeIn.delay(2400 + index * 150).duration(400)}
//               >
//                 <BlurView intensity={20} tint="light" style={styles.developmentArea}>
//                   <View style={styles.developmentAreaHeader}>
//                     <View style={styles.developmentIconContainer}>
//                       <IconSymbol name={area.icon} size={20} color={'dark'} />
//                     </View>
//                     <View style={styles.developmentAreaInfo}>
//                       <View style={styles.developmentAreaTitleRow}>
//                         <Text style={styles.developmentAreaTitle}>{area.area}</Text>
//                         <View style={[
//                           styles.priorityBadge,
//                           { backgroundColor: area.priority === 'high' ? Colors.error : area.priority === 'medium' ? Colors.warning : Colors.info }
//                         ]}>
//                           <Text style={styles.priorityText}>{area.priority.toUpperCase()}</Text>
//                         </View>
//                       </View>
//                       <Text style={styles.developmentRecommendation}>
//                         {area.recommendation}
//                       </Text>
//                     </View>
//                   </View>
//                 </BlurView>
//               </Animated.View>
//             ))}
//           </Card>
//         </Animated.View>

//         {/* Action Buttons */}
//         <Animated.View 
//           entering={FadeInUp.delay(2600).springify()}
//           style={styles.actionButtons}
//         >
//           <AnimatedPressable
//             onPressIn={handlePressIn}
//             onPressOut={handlePressOut}
//             style={[buttonAnimatedStyle, styles.buttonWrapper]}
//           >
//             <Button
//               title="Export Report"
//               onPress={() => console.log('Export')}
//               variant="primaryGradient"
//               icon={<IconSymbol name="square.and.arrow.up" size={18} color={'dark'} />}
//               fullWidth
//             />
//           </AnimatedPressable>

//           <Button
//             title="Share Analysis"
//             onPress={() => console.log('Share')}
//             variant="outline"
//             icon={<IconSymbol name="paperplane.fill" size={18} color={currentColors.primary} />}
//             style={styles.buttonWrapper}
//           />
//         </Animated.View>

//         <View style={styles.bottomSpacing} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   // Header
//   headerGradient: {
//     paddingVertical: Spacing.lg,
//     paddingHorizontal: Spacing.xl,
//   },

//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   logoBox: {
//     width: 40,
//     height: 40,
//     borderRadius: BorderRadius.sm,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   logoText: {
//     fontSize: Typography.title2,
//     fontWeight: '900',
//     color: Colors.textOnPrimary,
//   },

//   logoSubtext: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//     letterSpacing: 1,
//   },

//   logoTagline: {
//     fontSize: Typography.caption,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//     marginTop: 2,
//   },

//   content: {
//     flex: 1,
//   },

//   // Hero Section
//   heroCard: {
//     marginHorizontal: Spacing.xl,
//     marginTop: Spacing.lg,
//   },

//   heroContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.lg,
//   },

//   heroText: {
//     flex: 1,
//   },

//   heroTitle: {
//     fontSize: Typography.title3,
//     fontWeight: '700',
//     color: 'dark',
//     marginBottom: Spacing.xs,
//   },

//   heroSubtitle: {
//     fontSize: Typography.callout,
//     color: 'dark',
//     fontWeight: '500',
//   },

//   // Timeframe
//   timeframeContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: Spacing.xl,
//     gap: Spacing.sm,
//     marginTop: Spacing.lg,
//   },

//   timeframeWrapper: {
//     flex: 1,
//   },

//   timeframeButton: {
//     borderRadius: BorderRadius.lg,
//     overflow: 'hidden',
//     borderWidth: 1,
//   },

//   timeframeGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: Spacing.xs,
//     paddingVertical: Spacing.md,
//   },

//   timeframeInner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: Spacing.xs,
//     paddingVertical: Spacing.md,
//   },

//   timeframeText: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   selectedTimeframeText: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   // Section Headers
//   sectionHeader: {
//     paddingHorizontal: Spacing.xl,
//     marginTop: Spacing.xl,
//     marginBottom: Spacing.md,
//   },

//   sectionTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//   },

//   // Player Selection
//   playerScrollContent: {
//     paddingHorizontal: Spacing.xl,
//     gap: Spacing.md,
//   },

//   playerOptionWrapper: {
//     marginRight: Spacing.sm,
//   },

//   playerOption: {
//     alignItems: 'center',
//     minWidth: 100,
//   },

//   playerOptionName: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginTop: Spacing.sm,
//   },

//   playerPosition: {
//     fontSize: Typography.footnote,
//     fontWeight: '600',
//     marginTop: Spacing.xs / 2,
//   },

//   // Overview Card
//   overviewCard: {
//     marginHorizontal: Spacing.xl,
//     marginTop: Spacing.lg,
//   },

//   overviewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.lg,
//   },

//   overviewInfo: {
//     flex: 1,
//   },

//   overviewName: {
//     fontSize: Typography.title3,
//     fontWeight: '700',
//     marginBottom: Spacing.sm,
//   },

//   positionBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.xs,
//     borderRadius: BorderRadius.full,
//     marginBottom: Spacing.sm,
//   },

//   positionText: {
//     fontSize: Typography.footnote,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   overviewStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//   },

//   overviewMinutes: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   // Metrics Section
//   metricsSection: {
//     marginTop: Spacing.lg,
//   },

//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: Spacing.xl,
//     gap: Spacing.md,
//   },

//   metricCardWrapper: {
//     width: (Dimensions.get('window').width - Spacing.xl * 2 - Spacing.md) / 2,
//   },

//   metricCard: {
//     overflow: 'hidden',
//   },

//   metricGradientTop: {
//     height: 80,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   metricContent: {
//     padding: Spacing.md,
//     alignItems: 'center',
//   },

//   metricLabel: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//     marginBottom: Spacing.xs,
//   },

//   metricValue: {
//     fontSize: Typography.title2,
//     fontWeight: '700',
//     marginBottom: Spacing.sm,
//   },

//   ratingBadge: {
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 4,
//     borderRadius: BorderRadius.full,
//   },

//   ratingText: {
//     fontSize: Typography.caption,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   // Additional Stats
//   additionalStatsCard: {
//     marginHorizontal: Spacing.xl,
//     marginTop: Spacing.lg,
//   },

//   statsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     marginBottom: Spacing.lg,
//   },

//   additionalStatsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },

//   progressStatItem: {
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   progressStatLabel: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   additionalStatItem: {
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   statCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: Spacing.xs / 2,
//     ...Shadows.small,
//   },

//   statCircleValue: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//   },

//   statCircleLabel: {
//     fontSize: Typography.footnote,
//     fontWeight: '600',
//   },

//   // Development Card
//   developmentCard: {
//     marginHorizontal: Spacing.xl,
//     marginTop: Spacing.lg,
//   },

//   developmentHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.md,
//     marginBottom: Spacing.lg,
//   },

//   developmentHeaderText: {
//     flex: 1,
//   },

//   developmentTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//     color: 'dark',
//     marginBottom: Spacing.xs / 2,
//   },

//   developmentSubtitle: {
//     fontSize: Typography.callout,
//     color: 'dark',
//     fontWeight: '500',
//   },

//   developmentArea: {
//     borderRadius: BorderRadius.lg,
//     overflow: 'hidden',
//     marginBottom: Spacing.md,
//   },

//   developmentAreaHeader: {
//     flexDirection: 'row',
//     padding: Spacing.md,
//     gap: Spacing.md,
//   },

//   developmentIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   developmentAreaInfo: {
//     flex: 1,
//   },

//   developmentAreaTitleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: Spacing.sm,
//   },

//   developmentAreaTitle: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//     color: 'dark',
//     flex: 1,
//   },

//   priorityBadge: {
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 2,
//     borderRadius: BorderRadius.sm,
//   },

//   priorityText: {
//     fontSize: Typography.caption,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   developmentRecommendation: {
//     fontSize: Typography.callout,
//     color: 'dark',
//     lineHeight: Typography.callout * 1.4,
//   },

//   // Action Buttons
//   actionButtons: {
//     flexDirection: 'row',
//     paddingHorizontal: Spacing.xl,
//     marginTop: Spacing.xl,
//     gap: Spacing.md,
//   },

//   buttonWrapper: {
//     flex: 1,
//   },

//   bottomSpacing: {
//     height: Spacing.xxxl,
//   },
// });