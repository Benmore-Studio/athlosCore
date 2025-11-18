import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import GameCard from '@/components/games/GameCard';
import SeasonSummary from '@/components/games/SeasonSummary';
import GameVideoModal from '@/components/games/GameVideoModal';
import { Game } from '@/types/game';

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

export default function RecentGamesScreen() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoGame, setSelectedVideoGame] = useState<Game | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { currentColors, isDark } = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO: Fetch updated games data
      // const updatedGames = await gameService.getRecentGames();
    } catch (error) {
      console.error('Failed to refresh games:', error);
    } finally {
      setRefreshing(false);
    }
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
          <SeasonSummary team={mockTeams[0]} />
        </Animated.View>

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
          {mockGames.map((game, index) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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