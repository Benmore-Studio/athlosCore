import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients, Animation } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ Changed: Use theme context
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import teamService, { Team } from '@/services/api/teamService';
import userService from '@/services/api/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

function TeamSelectionScreenContent() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isTablet, isLandscape } = useResponsive();
  const { currentColors, isDark } = useTheme(); // ✅ Changed: Get colors and theme from context

  const scale = useSharedValue(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      await loadCoachProfile();
      await loadTeams();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      
      Sentry.captureException(err, {
        tags: { screen: 'team_selection', action: 'load_initial_data' },
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

  const loadTeams = async () => {
    try {
      const orgId = await AsyncStorage.getItem('current_org_id');
      
      const { teams: fetchedTeams } = await teamService.getTeams();
      
      const filteredTeams = orgId 
        ? fetchedTeams.filter(team => team.org_id === orgId)
        : fetchedTeams;

      setTeams(filteredTeams);

      if (filteredTeams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(filteredTeams[0].id);
      }

    } catch (err) {
      throw new Error('Failed to load teams. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTeams();
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh teams';
      setError(errorMsg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleContinue = async () => {
    if (!selectedTeamId) {
      return;
    }

    try {
      await AsyncStorage.setItem('current_team_id', selectedTeamId);
      console.log('Continue with team:', selectedTeamId);
      
    } catch (err) {
      console.error('Failed to save team selection:', err);
      Sentry.captureException(err, {
        tags: { screen: 'team_selection', action: 'continue' },
      });
    }
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

  const getWinPercentage = (team: Team) => {
    const wins = team.wins || 0;
    const losses = team.losses || 0;
    const totalGames = wins + losses;
    
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
  };

  const getTeamStats = (team: Team) => {
    return {
      record: { wins: team.wins || 0, losses: team.losses || 0 },
      playerCount: team.player_count || 0,
      winPercentage: getWinPercentage(team),
    };
  };

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading teams...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error && teams.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol 
            name="exclamationmark.triangle.fill" 
            size={48} 
            color={currentColors.error}
          />
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>
            Unable to Load Teams
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
  if (teams.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.emptyContainer}>
          <IconSymbol 
            name="person.3.fill" 
            size={64} 
            color={currentColors.textLight}
          />
          <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
            No Teams Found
          </Text>
          <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
            You don't have any teams yet. Contact your organization admin to get started.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Animated Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={[currentColors.headerBackground, currentColors.background]}
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
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>Team Selection</Text>
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
              <IconSymbol name="person.3.fill" size={48} color="#FFFFFF" />
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Select Your Team</Text>
                <Text style={styles.heroSubtitle}>Choose the team you want to manage</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Error Banner */}
        {error && teams.length > 0 && (
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

        {/* Teams Grid */}
        <View style={styles.teamsSection}>
          <Animated.View entering={FadeInUp.delay(800).springify()}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Your Teams
              </Text>
              <View style={[styles.teamCountBadge, { backgroundColor: currentColors.primary }]}>
                <Text style={styles.teamCountText}>{teams.length}</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.teamsGrid}>
            {teams.map((team, index) => {
              const isSelected = selectedTeamId === team.id;
              const stats = getTeamStats(team);

              return (
                <Animated.View
                  key={team.id}
                  entering={ZoomIn.delay(1000 + index * 150).springify()}
                  style={styles.teamCardWrapper}
                >
                  <TouchableOpacity
                    onPress={() => handleTeamSelect(team.id)}
                    activeOpacity={0.9}
                  >
                    <Card
                      variant={isSelected ? "gradient" : "elevated_high"}
                      padding="none"
                      style={[
                        styles.teamCard,
                        isSelected && Shadows.primaryGlow
                      ]}
                    >
                      {/* Team Header */}
                      {!isSelected && (
                        <LinearGradient
                          colors={[
                            isDark ? 'rgba(233, 122, 66, 0.1)' : 'rgba(233, 122, 66, 0.05)',
                            'transparent'
                          ]}
                          style={styles.teamHeaderGradient}
                        >
                          <View style={styles.teamHeader}>
                            <View style={styles.teamTitleRow}>
                              <Text style={[styles.teamName, { color: currentColors.text }]}>
                                {team.name}
                              </Text>
                              {team.sport && (
                                <View style={[styles.levelBadge, { backgroundColor: currentColors.surface }]}>
                                  <IconSymbol name="sportscourt.fill" size={12} color={currentColors.primary} />
                                  <Text style={[styles.levelText, { color: currentColors.text }]}>
                                    {team.sport}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </LinearGradient>
                      )}

                      {isSelected && (
                        <View style={styles.teamHeader}>
                          <View style={styles.teamTitleRow}>
                            <Text style={styles.teamNameSelected}>{team.name}</Text>
                            {team.sport && (
                              <View style={styles.levelBadgeSelected}>
                                <IconSymbol name="sportscourt.fill" size={12} color="#FFFFFF" />
                                <Text style={styles.levelTextSelected}>{team.sport}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Stats Row */}
                      <View style={[
                        styles.statsRow,
                        { backgroundColor: isSelected ? 'transparent' : currentColors.cardBackground }
                      ]}>
                        <View style={styles.statColumn}>
                          <View style={styles.statIconContainer}>
                            <IconSymbol 
                              name="chart.bar.fill" 
                              size={20} 
                              color={isSelected ? '#FFFFFF' : currentColors.primary}
                            />
                          </View>
                          <Text style={[
                            styles.statValue,
                            { color: isSelected ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {stats.record.wins}-{stats.record.losses}
                          </Text>
                          <Text style={[
                            styles.statLabel,
                            { color: isSelected ? '#FFFFFF' : currentColors.textSecondary }
                          ]}>
                            Record
                          </Text>
                        </View>

                        <View style={[styles.statDivider, { 
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : currentColors.border 
                        }]} />

                        <View style={styles.statColumn}>
                          <View style={styles.statIconContainer}>
                            <IconSymbol 
                              name="person.3.fill" 
                              size={20} 
                              color={isSelected ? '#FFFFFF' : currentColors.primary}
                            />
                          </View>
                          <Text style={[
                            styles.statValue,
                            { color: isSelected ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {stats.playerCount}
                          </Text>
                          <Text style={[
                            styles.statLabel,
                            { color: isSelected ? '#FFFFFF' : currentColors.textSecondary }
                          ]}>
                            Players
                          </Text>
                        </View>

                        <View style={[styles.statDivider, { 
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : currentColors.border 
                        }]} />

                        <View style={styles.statColumn}>
                          <View style={styles.statIconContainer}>
                            <IconSymbol 
                              name="chart.line.uptrend.xyaxis" 
                              size={20} 
                              color={isSelected ? '#FFFFFF' : currentColors.primary}
                            />
                          </View>
                          <Text style={[
                            styles.statValue,
                            { color: isSelected ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {stats.winPercentage}%
                          </Text>
                          <Text style={[
                            styles.statLabel,
                            { color: isSelected ? '#FFFFFF' : currentColors.textSecondary }
                          ]}>
                            Win %
                          </Text>
                        </View>
                      </View>

                      {/* Selection Indicator */}
                      <View style={[
                        styles.selectionSection,
                        { backgroundColor: isSelected ? 'transparent' : currentColors.cardBackground }
                      ]}>
                        <View style={styles.selectionHeader}>
                          <Text style={[
                            styles.selectionTitle,
                            { color: isSelected ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {isSelected ? 'Selected Team' : 'Tap to Select'}
                          </Text>
                          {isSelected && (
                            <View style={styles.selectedCheck}>
                              <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Selected Team Details */}
        {selectedTeam && (
          <Animated.View entering={FadeInUp.delay(1400).springify()}>
            <Card variant="elevated_high" padding="large" style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <IconSymbol name="info.circle.fill" size={28} color={currentColors.primary} />
                <View style={styles.detailsHeaderText}>
                  <Text style={[styles.detailsTitle, { color: currentColors.text }]}>
                    Team Information
                  </Text>
                  <Text style={[styles.detailsSubtitle, { color: currentColors.textSecondary }]}>
                    {selectedTeam.name}
                  </Text>
                </View>
              </View>

              {/* Team Info Grid */}
              <View style={styles.infoGrid}>
                {selectedTeam.season && (
                  <View style={[styles.infoItem, { backgroundColor: currentColors.surface }]}>
                    <IconSymbol name="calendar" size={20} color={currentColors.primary} />
                    <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>
                      Season
                    </Text>
                    <Text style={[styles.infoValue, { color: currentColors.text }]}>
                      {selectedTeam.season}
                    </Text>
                  </View>
                )}

                {selectedTeam.sport && (
                  <View style={[styles.infoItem, { backgroundColor: currentColors.surface }]}>
                    <IconSymbol name="sportscourt.fill" size={20} color={currentColors.primary} />
                    <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>
                      Sport
                    </Text>
                    <Text style={[styles.infoValue, { color: currentColors.text }]}>
                      {selectedTeam.sport}
                    </Text>
                  </View>
                )}

                <View style={[styles.infoItem, { backgroundColor: currentColors.surface }]}>
                  <IconSymbol name="clock.fill" size={20} color={currentColors.primary} />
                  <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>
                    Created
                  </Text>
                  <Text style={[styles.infoValue, { color: currentColors.text }]}>
                    {new Date(selectedTeam.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <View style={[styles.infoItem, { backgroundColor: currentColors.surface }]}>
                  <IconSymbol name="arrow.up.right" size={20} color={currentColors.success} />
                  <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>
                    Win Rate
                  </Text>
                  <Text style={[styles.infoValue, { color: currentColors.success }]}>
                    {getWinPercentage(selectedTeam)}%
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Continue Button */}
        <Animated.View entering={FadeInUp.delay(2000).springify()} style={styles.buttonContainer}>
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[buttonAnimatedStyle, styles.buttonWrapper]}
          >
            <Button
              title="Continue with Team"
              onPress={handleContinue}
              variant="primaryGradient"
              size="large"
              icon={<IconSymbol name="arrow.right" size={20} color="#FFFFFF" />}
              iconPosition="right"
              fullWidth
              disabled={!selectedTeamId}
            />
          </AnimatedPressable>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function TeamSelectionScreen() {
  return (
    <ComponentErrorBoundary componentName="TeamSelectionScreen">
      <TeamSelectionScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Loading State
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

  // Error State
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

  // Empty State
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

  // Error Banner
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

  // Header
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

  // Hero Card
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
    color: 'dark',
    marginBottom: Spacing.xs,
  },

  heroSubtitle: {
    fontSize: Typography.callout,
    color: 'dark',
    fontWeight: '500',
  },

  // Teams Section
  teamsSection: {
    marginTop: Spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },

  teamCountBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  teamCountText: {
    fontSize: Typography.footnote,
    fontWeight: '900',
    color: 'dark',
  },

  teamsGrid: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },

  teamCardWrapper: {
    marginBottom: Spacing.sm,
  },

  teamCard: {
    overflow: 'hidden',
  },

  teamHeaderGradient: {
    padding: Spacing.lg,
  },

  teamHeader: {
    padding: Spacing.lg,
  },

  teamTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  teamName: {
    fontSize: Typography.headline,
    fontWeight: '700',
    flex: 1,
  },

  teamNameSelected: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: 'dark',
    flex: 1,
  },

  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },

  levelBadgeSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  levelText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
  },

  levelTextSelected: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: 'dark',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },

  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },

  statIconContainer: {
    marginBottom: Spacing.xs / 2,
  },

  statValue: {
    fontSize: Typography.title3,
    fontWeight: '900',
  },

  statLabel: {
    fontSize: Typography.caption,
    fontWeight: '600',
  },

  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },

  // Selection Section
  selectionSection: {
    padding: Spacing.lg,
  },

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectionTitle: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },

  selectedCheck: {
    width: 24,
    height: 24,
  },

  // Details Card
  detailsCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },

  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  detailsHeaderText: {
    flex: 1,
  },

  detailsTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },

  detailsSubtitle: {
    fontSize: Typography.callout,
    fontWeight: '500',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  infoItem: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },

  infoLabel: {
    fontSize: Typography.caption,
    fontWeight: '600',
  },

  infoValue: {
    fontSize: Typography.body,
    fontWeight: '700',
  },

  // Button
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },

  buttonWrapper: {
    width: '100%',
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
// import { mockCoach, mockTeams } from '@/data/mockData';
// import { useResponsive } from '@/hooks/useResponsive';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import React, { useState } from 'react';
// import {
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
//   ZoomIn,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// export default function TeamSelectionScreen() {
//   const [selectedTeamId, setSelectedTeamId] = useState(mockTeams[0].id);
//   const { isTablet, isLandscape } = useResponsive();
//   const theme = useColorScheme() ?? 'light';
//   const isDark = theme === 'dark';
//   const currentColors = isDark ? DarkColors : Colors;

//   const scale = useSharedValue(1);
//   const selectedTeam = mockTeams.find(team => team.id === selectedTeamId);

//   const handleTeamSelect = (teamId: string) => {
//     setSelectedTeamId(teamId);
//   };

//   const handleContinue = () => {
//     console.log('Continue with team:', selectedTeamId);
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

//   const getWinPercentage = (team: typeof mockTeams[0]) => {
//     return (team.record.wins / (team.record.wins + team.record.losses)) * 100;
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
//       {/* Animated Header */}
//       <Animated.View entering={FadeInDown.duration(600).springify()}>
//         <LinearGradient
//           colors={[currentColors.headerBackground, currentColors.background]}
//           style={styles.headerGradient}
//         >
//           <View style={styles.headerContent}>
//             <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.logoContainer}>
//               <LinearGradient
//                 colors={Gradients.primary.colors}
//                 start={Gradients.primary.start}
//                 end={Gradients.primary.end}
//                 style={[styles.logoBox, Shadows.primaryGlow]}
//               >
//                 <Text style={styles.logoText}>A</Text>
//               </LinearGradient>
//               <View>
//                 <Text style={[styles.logoSubtext, { color: currentColors.text }]}>AthlosCore™</Text>
//                 <Text style={[styles.logoTagline, { color: currentColors.primary }]}>Team Selection</Text>
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
//               <IconSymbol name="person.3.fill" size={48} color={'dark'} />
//               <View style={styles.heroText}>
//                 <Text style={styles.heroTitle}>Select Your Team</Text>
//                 <Text style={styles.heroSubtitle}>Choose the team you want to manage</Text>
//               </View>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Teams Grid */}
//         <View style={styles.teamsSection}>
//           <Animated.View entering={FadeInUp.delay(800).springify()}>
//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
//                 Your Teams
//               </Text>
//               <View style={[styles.teamCountBadge, { backgroundColor: currentColors.primary }]}>
//                 <Text style={styles.teamCountText}>{mockTeams.length}</Text>
//               </View>
//             </View>
//           </Animated.View>

//           <View style={styles.teamsGrid}>
//             {mockTeams.map((team, index) => {
//               const isSelected = selectedTeamId === team.id;
//               const winPercentage = getWinPercentage(team);

//               return (
//                 <Animated.View
//                   key={team.id}
//                   entering={ZoomIn.delay(1000 + index * 150).springify()}
//                   style={styles.teamCardWrapper}
//                 >
//                   <TouchableOpacity
//                     onPress={() => handleTeamSelect(team.id)}
//                     activeOpacity={0.9}
//                   >
//                     <Card
//                       variant={isSelected ? "gradient" : "elevated_high"}
//                       padding="none"
//                       style={[
//                         styles.teamCard,
//                         isSelected && Shadows.primaryGlow
//                       ]}
//                     >
//                       {/* Team Header with Gradient */}
//                       {!isSelected && (
//                         <LinearGradient
//                           colors={[
//                             isDark ? 'rgba(233, 122, 66, 0.1)' : 'rgba(233, 122, 66, 0.05)',
//                             'transparent'
//                           ]}
//                           style={styles.teamHeaderGradient}
//                         >
//                           <View style={styles.teamHeader}>
//                             <View style={styles.teamTitleRow}>
//                               <Text style={[styles.teamName, { color: currentColors.text }]}>
//                                 {team.name}
//                               </Text>
//                               <View style={[styles.levelBadge, { backgroundColor: currentColors.surface }]}>
//                                 <IconSymbol name="star.fill" size={12} color={currentColors.primary} />
//                                 <Text style={[styles.levelText, { color: currentColors.text }]}>
//                                   {team.level}
//                                 </Text>
//                               </View>
//                             </View>
//                           </View>
//                         </LinearGradient>
//                       )}

//                       {isSelected && (
//                         <View style={styles.teamHeader}>
//                           <View style={styles.teamTitleRow}>
//                             <Text style={styles.teamNameSelected}>{team.name}</Text>
//                             <View style={styles.levelBadgeSelected}>
//                               <IconSymbol name="star.fill" size={12} color={'dark'} />
//                               <Text style={styles.levelTextSelected}>{team.level}</Text>
//                             </View>
//                           </View>
//                         </View>
//                       )}

//                       {/* Stats Row */}
//                       <View style={[
//                         styles.statsRow,
//                         { backgroundColor: isSelected ? 'transparent' : currentColors.cardBackground }
//                       ]}>
//                         <View style={styles.statColumn}>
//                           <View style={styles.statIconContainer}>
//                             <IconSymbol 
//                               name="chart.bar.fill" 
//                               size={20} 
//                               color={isSelected ? 'dark' : currentColors.primary}
//                             />
//                           </View>
//                           <Text style={[
//                             styles.statValue,
//                             { color: isSelected ? 'dark' : currentColors.text }
//                           ]}>
//                             {team.record.wins}-{team.record.losses}
//                           </Text>
//                           <Text style={[
//                             styles.statLabel,
//                             { color: isSelected ? 'dark' : currentColors.textSecondary }
//                           ]}>
//                             Record
//                           </Text>
//                         </View>

//                         <View style={[styles.statDivider, { 
//                           backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : currentColors.border 
//                         }]} />

//                         <View style={styles.statColumn}>
//                           <View style={styles.statIconContainer}>
//                             <IconSymbol 
//                               name="person.3.fill" 
//                               size={20} 
//                               color={isSelected ? 'dark' : currentColors.primary}
//                             />
//                           </View>
//                           <Text style={[
//                             styles.statValue,
//                             { color: isSelected ? 'dark' : currentColors.text }
//                           ]}>
//                             {team.players.length}
//                           </Text>
//                           <Text style={[
//                             styles.statLabel,
//                             { color: isSelected ? 'dark' : currentColors.textSecondary }
//                           ]}>
//                             Players
//                           </Text>
//                         </View>

//                         <View style={[styles.statDivider, { 
//                           backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : currentColors.border 
//                         }]} />

//                         <View style={styles.statColumn}>
//                           <View style={styles.statIconContainer}>
//                             <IconSymbol 
//                               name="chart.line.uptrend.xyaxis" 
//                               size={20} 
//                               color={isSelected ? 'dark' : currentColors.primary}
//                             />
//                           </View>
//                           <Text style={[
//                             styles.statValue,
//                             { color: isSelected ? 'dark' : currentColors.text }
//                           ]}>
//                             {Math.round(winPercentage)}%
//                           </Text>
//                           <Text style={[
//                             styles.statLabel,
//                             { color: isSelected ? 'dark' : currentColors.textSecondary }
//                           ]}>
//                             Win %
//                           </Text>
//                         </View>
//                       </View>

//                       {/* Players Preview */}
//                       <View style={[
//                         styles.playersSection,
//                         { backgroundColor: isSelected ? 'transparent' : currentColors.cardBackground }
//                       ]}>
//                         <View style={styles.playersSectionHeader}>
//                           <Text style={[
//                             styles.playersTitle,
//                             { color: isSelected ? 'dark' : currentColors.text }
//                           ]}>
//                             Top Players
//                           </Text>
//                           {isSelected && (
//                             <View style={styles.selectedCheck}>
//                               <IconSymbol name="checkmark.circle.fill" size={20} color={'dark'} />
//                             </View>
//                           )}
//                         </View>

//                         <View style={styles.playersRow}>
//                           {team.players.slice(0, 4).map((player, idx) => (
//                             <View
//                               key={player.id}
//                               style={[
//                                 styles.playerAvatar,
//                                 { marginLeft: idx > 0 ? -Spacing.sm : 0 }
//                               ]}
//                             >
//                               <PlayerAvatar
//                                 name={player.name}
//                                 imageUri={player.imageUri}
//                                 jerseyNumber={player.jerseyNumber}
//                                 size="small"
//                                 variant={isSelected ? "glow" : "default"}
//                               />
//                             </View>
//                           ))}
//                           {team.players.length > 4 && (
//                             <View style={[
//                               styles.morePlayersCircle,
//                               { 
//                                 backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : currentColors.surface,
//                                 borderColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : currentColors.border
//                               }
//                             ]}>
//                               <Text style={[
//                                 styles.morePlayersText,
//                                 { color: isSelected ? 'dark' : currentColors.text }
//                               ]}>
//                                 +{team.players.length - 4}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       </View>
//                     </Card>
//                   </TouchableOpacity>
//                 </Animated.View>
//               );
//             })}
//           </View>
//         </View>

//         {/* Selected Team Details */}
//         {selectedTeam && (
//           <Animated.View entering={FadeInUp.delay(1400).springify()}>
//             <Card variant="elevated_high" padding="large" style={styles.detailsCard}>
//               <View style={styles.detailsHeader}>
//                 <IconSymbol name="chart.bar.fill" size={28} color={currentColors.primary} />
//                 <View style={styles.detailsHeaderText}>
//                   <Text style={[styles.detailsTitle, { color: currentColors.text }]}>
//                     Team Performance
//                   </Text>
//                   <Text style={[styles.detailsSubtitle, { color: currentColors.textSecondary }]}>
//                     {selectedTeam.name} • Season Stats
//                   </Text>
//                 </View>
//               </View>

//               {/* Performance Grid */}
//               <View style={styles.performanceGrid}>
//                 {[
//                   { label: 'Avg Points', value: selectedTeam.stats.averagePoints, icon: 'star.fill', color: Colors.primary },
//                   { label: 'Points Allowed', value: selectedTeam.stats.pointsAllowed, icon: 'arrow.down.circle.fill', color: Colors.error },
//                   { label: 'FG%', value: `${selectedTeam.stats.fieldGoalPercentage}%`, icon: 'target', color: Colors.success },
//                   { label: 'Turnovers', value: selectedTeam.stats.turnovers, icon: 'exclamationmark.triangle.fill', color: Colors.warning },
//                 ].map((stat, index) => (
//                   <Animated.View
//                     key={index}
//                     entering={ZoomIn.delay(1600 + index * 100).springify()}
//                     style={[styles.performanceCard, { backgroundColor: currentColors.surface }]}
//                   >
//                     <View style={[styles.performanceIcon, { backgroundColor: stat.color + '20' }]}>
//                       <IconSymbol name={stat.icon} size={24} color={stat.color} />
//                     </View>
//                     <Text style={[styles.performanceValue, { color: currentColors.text }]}>
//                       {stat.value}
//                     </Text>
//                     <Text style={[styles.performanceLabel, { color: currentColors.textSecondary }]}>
//                       {stat.label}
//                     </Text>
//                   </Animated.View>
//                 ))}
//               </View>

//               {/* Recent Game */}
//               {selectedTeam.recentGame && (
//                 <BlurView
//                   intensity={10}
//                   tint={isDark ? 'dark' : 'light'}
//                   style={styles.recentGameCard}
//                 >
//                   <View style={styles.recentGameHeader}>
//                     <IconSymbol 
//                       name="clock.fill" 
//                       size={18} 
//                       color={currentColors.primary}
//                     />
//                     <Text style={[styles.recentGameTitle, { color: currentColors.text }]}>
//                       Recent Game
//                     </Text>
//                   </View>
//                   <View style={styles.recentGameContent}>
//                     <View style={[
//                       styles.resultBadge,
//                       { backgroundColor: selectedTeam.recentGame.result === 'W' ? Colors.success : Colors.error }
//                     ]}>
//                       <Text style={styles.resultText}>{selectedTeam.recentGame.result}</Text>
//                     </View>
//                     <Text style={[styles.recentGameText, { color: currentColors.text }]}>
//                       vs {selectedTeam.recentGame.opponent}
//                     </Text>
//                     <Text style={[styles.recentGameScore, { color: currentColors.primary }]}>
//                       {selectedTeam.recentGame.score.team}-{selectedTeam.recentGame.score.opponent}
//                     </Text>
//                   </View>
//                 </BlurView>
//               )}
//             </Card>
//           </Animated.View>
//         )}

//         {/* Continue Button */}
//         <Animated.View entering={FadeInUp.delay(2000).springify()} style={styles.buttonContainer}>
//           <AnimatedPressable
//             onPressIn={handlePressIn}
//             onPressOut={handlePressOut}
//             style={[buttonAnimatedStyle, styles.buttonWrapper]}
//           >
//             <Button
//               title="Continue with Team"
//               onPress={handleContinue}
//               variant="primaryGradient"
//               size="large"
//               icon={<IconSymbol name="arrow.right" size={20} color={'dark'} />}
//               iconPosition="right"
//               fullWidth
//             />
//           </AnimatedPressable>
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

//   // Hero Card
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

//   // Teams Section
//   teamsSection: {
//     marginTop: Spacing.lg,
//   },

//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: Spacing.xl,
//     marginBottom: Spacing.md,
//   },

//   sectionTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//   },

//   teamCountBadge: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   teamCountText: {
//     fontSize: Typography.footnote,
//     fontWeight: '900',
//     color: 'dark',
//   },

//   teamsGrid: {
//     paddingHorizontal: Spacing.xl,
//     gap: Spacing.lg,
//   },

//   teamCardWrapper: {
//     marginBottom: Spacing.sm,
//   },

//   teamCard: {
//     overflow: 'hidden',
//   },

//   teamHeaderGradient: {
//     padding: Spacing.lg,
//   },

//   teamHeader: {
//     padding: Spacing.lg,
//   },

//   teamTitleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   teamName: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//     flex: 1,
//   },

//   teamNameSelected: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//     color: 'dark',
//     flex: 1,
//   },

//   levelBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs / 2,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: Spacing.xs / 2,
//     borderRadius: BorderRadius.full,
//   },

//   levelBadgeSelected: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs / 2,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: Spacing.xs / 2,
//     borderRadius: BorderRadius.full,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },

//   levelText: {
//     fontSize: Typography.footnote,
//     fontWeight: '700',
//   },

//   levelTextSelected: {
//     fontSize: Typography.footnote,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   // Stats Row
//   statsRow: {
//     flexDirection: 'row',
//     paddingVertical: Spacing.lg,
//     paddingHorizontal: Spacing.lg,
//   },

//   statColumn: {
//     flex: 1,
//     alignItems: 'center',
//     gap: Spacing.xs,
//   },

//   statIconContainer: {
//     marginBottom: Spacing.xs / 2,
//   },

//   statValue: {
//     fontSize: Typography.title3,
//     fontWeight: '900',
//   },

//   statLabel: {
//     fontSize: Typography.caption,
//     fontWeight: '600',
//   },

//   statDivider: {
//     width: 1,
//     alignSelf: 'stretch',
//     marginHorizontal: Spacing.sm,
//   },

//   // Players Section
//   playersSection: {
//     padding: Spacing.lg,
//   },

//   playersSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: Spacing.md,
//   },

//   playersTitle: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//   },

//   selectedCheck: {
//     width: 24,
//     height: 24,
//   },

//   playersRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   playerAvatar: {
//     // marginLeft handled inline
//   },

//   morePlayersCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     borderWidth: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: -Spacing.sm,
//   },

//   morePlayersText: {
//     fontSize: Typography.caption,
//     fontWeight: '900',
//   },

//   // Details Card
//   detailsCard: {
//     marginHorizontal: Spacing.xl,
//     marginTop: Spacing.lg,
//   },

//   detailsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.md,
//     marginBottom: Spacing.lg,
//   },

//   detailsHeaderText: {
//     flex: 1,
//   },

//   detailsTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//     marginBottom: Spacing.xs / 2,
//   },

//   detailsSubtitle: {
//     fontSize: Typography.callout,
//     fontWeight: '500',
//   },

//   performanceGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: Spacing.sm,
//     marginBottom: Spacing.lg,
//   },

//   performanceCard: {
//     width: '48%',
//     padding: Spacing.md,
//     borderRadius: BorderRadius.lg,
//     alignItems: 'center',
//     gap: Spacing.xs,
//   },

//   performanceIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   performanceValue: {
//     fontSize: Typography.title3,
//     fontWeight: '900',
//   },

//   performanceLabel: {
//     fontSize: Typography.caption,
//     fontWeight: '600',
//   },

//   // Recent Game
//   recentGameCard: {
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.md,
//     overflow: 'hidden',
//   },

//   recentGameHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     marginBottom: Spacing.sm,
//   },

//   recentGameTitle: {
//     fontSize: Typography.callout,
//     fontWeight: '700',
//   },

//   recentGameContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   resultBadge: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   resultText: {
//     fontSize: Typography.callout,
//     fontWeight: '900',
//     color: 'dark',
//   },

//   recentGameText: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//     flex: 1,
//   },

//   recentGameScore: {
//     fontSize: Typography.headline,
//     fontWeight: '900',
//   },

//   // Button
//   buttonContainer: {
//     paddingHorizontal: Spacing.xl,
//     marginTop: Spacing.xl,
//   },

//   buttonWrapper: {
//     width: '100%',
//   },

//   bottomSpacing: {
//     height: Spacing.xxxl,
//   },
// });