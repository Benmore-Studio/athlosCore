// File: app/(tabs)/index.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ Changed: Use theme context
import { Colors, Gradients, Spacing } from '@/constants/theme';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import QuickStats from '@/components/dashboard/QuickStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentGames from '@/components/dashboard/RecentGames';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import PlayerSpotlight from '@/components/dashboard/PlayerSpotlight';

export default function DashboardScreen() {
  const currentTeam = mockTeams[0];
  const { currentColors, isDark } = useTheme(); // ✅ Changed: Get colors from theme context

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

  const quickStatsData = [
    { icon: 'chart.line.uptrend.xyaxis', value: '87.3', label: 'Avg Points' },
    { icon: 'person.3.fill', value: 15, label: 'Players' },
    { icon: 'video.fill', value: 24, label: 'Game Films' },
  ];

  const quickActionsData = [
    { id: 'team-selection', icon: 'person.fill', label: 'Team\nManagement', gradient: Gradients.primary },
    { id: 'analytics', icon: 'chart.bar.fill', label: 'Statistics &\nAnalytics', gradient: { colors: [Colors.info, Colors.primary] } },
    { id: 'upload', icon: 'video.fill', label: 'Upload Game\nFilm', gradient: { colors: [Colors.success, '#10B981'] } },
    { id: 'ai-analysis', icon: 'star.fill', label: 'AI Game\nAnalysis', gradient: { colors: [Colors.warning, '#F59E0B'] } },
  ];

  const recentGamesData = [
    { home: 'Lincoln Eagles', away: 'Central Warriors', score: '87-74', date: 'Mar 15', win: true },
    { home: 'Lincoln Eagles', away: 'Riverside Eagles', score: '69-72', date: 'Mar 8', win: false },
  ];

  const performanceStatsData = [
    { label: 'FG%', value: '47%', icon: 'chart.bar.fill' },
    { label: 'Rebounds', value: '33', icon: 'arrow.up.circle.fill' },
    { label: 'Turnovers', value: '14', icon: 'arrow.down.circle.fill' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <DashboardHeader 
        coachName={mockCoach.name}
        coachImageUri={mockCoach.imageUri}
        currentColors={currentColors}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WelcomeHero
          coachName={mockCoach.name}
          coachImageUri={mockCoach.imageUri}
          record="18-6"
          nextGame="Friday vs Riverside"
          onViewFilm={() => router.push('/videos')}
        />

        <QuickStats stats={quickStatsData} currentColors={currentColors} />

        <QuickActions 
          actions={quickActionsData}
          onActionPress={handleAction}
          currentColors={currentColors}
        />

        <RecentGames
          games={recentGamesData}
          onSeeAll={() => router.push('/games')}
          onGamePress={() => router.push('/games')}
          onCategoryPress={() => router.push('/videos')}
          onWatchFilm={() => handleAction('watch-full')}
          currentColors={currentColors}
        />

        <View style={styles.bottomGrid}>
          <TeamPerformance
            winRate={75}
            stats={performanceStatsData}
            onPress={() => router.push('/explore')}
          />

          <PlayerSpotlight
            players={currentTeam.players.slice(0, 3)}
            onSeeAll={() => router.push('/teams')}
            onPlayerPress={() => router.push('/teams')}
            currentColors={currentColors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomGrid: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
});