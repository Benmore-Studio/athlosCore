// File: app/(tabs)/index.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { mockCoach, mockGames, mockTeams } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { currentColors, isDark } = useTheme();

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
    { 
      icon: 'chart.line.uptrend.xyaxis', 
      value: '87.3', 
      label: 'Avg Points',
      // ✅ ADD: Accessibility label
      accessibilityLabel: 'Average points: 87.3 per game'
    },
    { 
      icon: 'person.3.fill', 
      value: 15, 
      label: 'Players',
      accessibilityLabel: '15 players on roster'
    },
    { 
      icon: 'video.fill', 
      value: 24, 
      label: 'Game Films',
      accessibilityLabel: '24 game films uploaded'
    },
  ];

  const quickActionsData = [
    { 
      id: 'team-selection', 
      icon: 'person.fill', 
      label: 'Team\nManagement', 
      gradient: Gradients.primary,
      // ✅ ADD: Accessibility
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

  const recentGamesData = [
    { 
      home: 'Lincoln Eagles', 
      away: 'Central Warriors', 
      score: '87-74', 
      date: 'Mar 15', 
      win: true,
      // ✅ ADD: Accessibility
      accessibilityLabel: 'Win against Central Warriors, March 15, final score 87 to 74',
      accessibilityHint: 'Tap to view game details and statistics'
    },
    { 
      home: 'Lincoln Eagles', 
      away: 'Riverside Eagles', 
      score: '69-72', 
      date: 'Mar 8', 
      win: false,
      accessibilityLabel: 'Loss to Riverside Eagles, March 8, final score 69 to 72',
      accessibilityHint: 'Tap to view game details and statistics'
    },
  ];

  const performanceStatsData = [
    { 
      label: 'FG%', 
      value: '47%', 
      icon: 'chart.bar.fill',
      accessibilityLabel: 'Field goal percentage: 47 percent'
    },
    { 
      label: 'Rebounds', 
      value: '33', 
      icon: 'arrow.up.circle.fill',
      accessibilityLabel: 'Average rebounds: 33 per game'
    },
    { 
      label: 'Turnovers', 
      value: '14', 
      icon: 'arrow.down.circle.fill',
      accessibilityLabel: 'Average turnovers: 14 per game'
    },
  ];

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      // ✅ ADD: Screen-level accessibility
      accessibilityLabel="Dashboard screen"
    >
      <DashboardHeader 
        coachName={mockCoach.name}
        coachImageUri={mockCoach.imageUri}
        currentColors={currentColors}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        // ✅ ADD: Accessibility for scrollable content
        accessibilityLabel="Dashboard content"
      >
        <WelcomeHero
          coachName={mockCoach.name}
          coachImageUri={mockCoach.imageUri}
          record="18-6"
          nextGame="Friday vs Riverside"
          onViewFilm={() => router.push('/videos')}
          // ✅ PASS DOWN: Accessibility props
          accessibilityLabel={`Welcome back, ${mockCoach.name}. Team record: 18 wins, 6 losses`}
          viewFilmAccessibilityLabel="View recent game film"
        />

        <QuickStats 
          stats={quickStatsData} 
          currentColors={currentColors}
          // ✅ ADD: Section label
          sectionAccessibilityLabel="Quick statistics section"
        />

        <QuickActions 
          actions={quickActionsData}
          onActionPress={handleAction}
          currentColors={currentColors}
          // ✅ ADD: Section label
          sectionAccessibilityLabel="Quick actions section"
        />

        <RecentGames
          games={recentGamesData}
          onSeeAll={() => router.push('/games')}
          onGamePress={() => router.push('/games')}
          onCategoryPress={() => router.push('/videos')}
          onWatchFilm={() => handleAction('watch-full')}
          currentColors={currentColors}
          // ✅ ADD: Section labels
          sectionAccessibilityLabel="Recent games section"
          seeAllAccessibilityLabel="See all games"
          seeAllAccessibilityHint="View complete game history"
        />

        <View style={styles.bottomGrid}>
          <TeamPerformance
            winRate={75}
            stats={performanceStatsData}
            onPress={() => router.push('/explore')}
            // ✅ ADD: Accessibility
            accessibilityLabel="Team performance: 75 percent win rate"
            accessibilityHint="Tap to view detailed team analytics"
          />

          <PlayerSpotlight
            players={currentTeam.players.slice(0, 3)}
            onSeeAll={() => router.push('/teams')}
            onPlayerPress={() => router.push('/teams')}
            currentColors={currentColors}
            // ✅ ADD: Accessibility
            sectionAccessibilityLabel="Player spotlight section"
            seeAllAccessibilityLabel="See all players"
            seeAllAccessibilityHint="View complete team roster"
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


// Uncomment to test
// import React, { useEffect, useState } from 'react';
// import { ScrollView, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
// import { useTheme } from '@/contexts/ThemeContext';
// import { useTeamStore, usePlayerStore } from '@/stores';
// import { Colors, Gradients, Spacing, Typography } from '@/constants/theme';
// import DashboardHeader from '@/components/dashboard/DashboardHeader';
// import WelcomeHero from '@/components/dashboard/WelcomeHero';
// import QuickStats from '@/components/dashboard/QuickStats';
// import QuickActions from '@/components/dashboard/QuickActions';
// import RecentGames from '@/components/dashboard/RecentGames';
// import TeamPerformance from '@/components/dashboard/TeamPerformance';
// import PlayerSpotlight from '@/components/dashboard/PlayerSpotlight';
// import userService from '@/services/api/userService';
// import teamService from '@/services/api/teamService';
// import { IconSymbol } from '@/components/ui/icon-symbol';

// interface Coach {
//   id: string;
//   name: string;
//   imageUri?: string;
//   email: string;
// }

// export default function DashboardScreen() {
//   // Store hooks
//   const { selectedTeam, teams, loadTeams } = useTeamStore();
//   const { players, loadPlayers, isLoading: playersLoading } = usePlayerStore();
  
//   const { currentColors, isDark } = useTheme();
  
//   // Local state
//   const [coach, setCoach] = useState<Coach | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [teamStats, setTeamStats] = useState({
//     avgPoints: 0,
//     totalGames: 0,
//     winRate: 0,
//     totalFilms: 0,
//   });

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   useEffect(() => {
//     // Load players when team changes
//     if (selectedTeam) {
//       loadPlayers(selectedTeam.id);
//       loadTeamStats();
//     }
//   }, [selectedTeam]);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Load coach profile
//       await loadCoachProfile();
      
//       // Load teams if not already loaded
//       if (teams.length === 0) {
//         await loadTeams();
//       }
      
//       // Load players if team is selected
//       if (selectedTeam) {
//         await loadPlayers(selectedTeam.id);
//         await loadTeamStats();
//       }
      
//     } catch (err) {
//       console.error('Failed to load dashboard data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCoachProfile = async () => {
//     try {
//       const profile = await userService.getProfile();
//       setCoach({
//         id: profile.id,
//         name: profile.name || profile.email,
//         email: profile.email,
//         imageUri: profile.avatar_url,
//       });
//     } catch (err) {
//       console.error('Failed to load coach profile:', err);
//       setCoach({
//         id: 'default',
//         name: 'Coach',
//         email: 'coach@athloscore.com',
//       });
//     }
//   };

//   const loadTeamStats = async () => {
//     if (!selectedTeam) return;
    
//     try {
//       // Calculate stats from team data
//       const wins = selectedTeam.wins || 0;
//       const losses = selectedTeam.losses || 0;
//       const totalGames = wins + losses;
//       const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
      
//       setTeamStats({
//         avgPoints: 87.3, // This would come from actual game data
//         totalGames,
//         winRate,
//         totalFilms: 24, // This would come from video service
//       });
//     } catch (err) {
//       console.error('Failed to load team stats:', err);
//     }
//   };

//   const handleAction = (actionId: string) => {
//     const routes: Record<string, string> = {
//       'team-selection': '/teams',
//       'analytics': '/explore',
//       'upload': '/videos',
//       'ai-analysis': '/explore',
//       'watch-full': '/videos',
//     };
    
//     if (routes[actionId]) {
//       router.push(routes[actionId]);
//     }
//   };

//   // Quick stats data from store
//   const quickStatsData = [
//     { 
//       icon: 'chart.line.uptrend.xyaxis', 
//       value: teamStats.avgPoints.toFixed(1), 
//       label: 'Avg Points',
//       accessibilityLabel: `Average points: ${teamStats.avgPoints.toFixed(1)} per game`
//     },
//     { 
//       icon: 'person.3.fill', 
//       value: players.length, 
//       label: 'Players',
//       accessibilityLabel: `${players.length} players on roster`
//     },
//     { 
//       icon: 'video.fill', 
//       value: teamStats.totalFilms, 
//       label: 'Game Films',
//       accessibilityLabel: `${teamStats.totalFilms} game films uploaded`
//     },
//   ];

//   const quickActionsData = [
//     { 
//       id: 'team-selection', 
//       icon: 'person.fill', 
//       label: 'Team\nManagement', 
//       gradient: Gradients.primary,
//       accessibilityLabel: 'Team Management',
//       accessibilityHint: 'View and manage your team roster'
//     },
//     { 
//       id: 'analytics', 
//       icon: 'chart.bar.fill', 
//       label: 'Statistics &\nAnalytics', 
//       gradient: { colors: [Colors.info, Colors.primary] },
//       accessibilityLabel: 'Statistics and Analytics',
//       accessibilityHint: 'View team and player statistics'
//     },
//     { 
//       id: 'upload', 
//       icon: 'video.fill', 
//       label: 'Upload Game\nFilm', 
//       gradient: { colors: [Colors.success, '#10B981'] },
//       accessibilityLabel: 'Upload Game Film',
//       accessibilityHint: 'Upload and analyze new game footage'
//     },
//     { 
//       id: 'ai-analysis', 
//       icon: 'star.fill', 
//       label: 'AI Game\nAnalysis', 
//       gradient: { colors: [Colors.warning, '#F59E0B'] },
//       accessibilityLabel: 'AI Game Analysis',
//       accessibilityHint: 'Get AI-powered insights on game performance'
//     },
//   ];

//   const recentGamesData = [
//     { 
//       home: selectedTeam?.name || 'Team', 
//       away: 'Central Warriors', 
//       score: '87-74', 
//       date: 'Mar 15', 
//       win: true,
//       accessibilityLabel: 'Win against Central Warriors, March 15, final score 87 to 74',
//       accessibilityHint: 'Tap to view game details and statistics'
//     },
//     { 
//       home: selectedTeam?.name || 'Team', 
//       away: 'Riverside Eagles', 
//       score: '69-72', 
//       date: 'Mar 8', 
//       win: false,
//       accessibilityLabel: 'Loss to Riverside Eagles, March 8, final score 69 to 72',
//       accessibilityHint: 'Tap to view game details and statistics'
//     },
//   ];

//   const performanceStatsData = [
//     { 
//       label: 'FG%', 
//       value: '47%', 
//       icon: 'chart.bar.fill',
//       accessibilityLabel: 'Field goal percentage: 47 percent'
//     },
//     { 
//       label: 'Rebounds', 
//       value: '33', 
//       icon: 'arrow.up.circle.fill',
//       accessibilityLabel: 'Average rebounds: 33 per game'
//     },
//     { 
//       label: 'Turnovers', 
//       value: '14', 
//       icon: 'arrow.down.circle.fill',
//       accessibilityLabel: 'Average turnovers: 14 per game'
//     },
//   ];

//   // Loading state
//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={currentColors.primary} />
//           <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
//             Loading dashboard...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // No team selected state
//   if (!selectedTeam) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
//         <DashboardHeader 
//           coachName={coach?.name || 'Coach'}
//           coachImageUri={coach?.imageUri}
//           currentColors={currentColors}
//         />
        
//         <View style={styles.emptyContainer}>
//           <IconSymbol 
//             name="sportscourt.fill" 
//             size={64} 
//             color={currentColors.textLight}
//           />
//           <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
//             No Team Selected
//           </Text>
//           <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
//             Select a team to view your dashboard
//           </Text>
//           <TouchableOpacity
//             style={[styles.selectTeamButton, { backgroundColor: currentColors.primary }]}
//             onPress={() => router.push('/teams')}
//           >
//             <IconSymbol name="person.3.fill" size={20} color="#FFFFFF" />
//             <Text style={styles.selectTeamButtonText}>Select Team</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const teamRecord = `${selectedTeam.wins || 0}-${selectedTeam.losses || 0}`;
//   const nextGame = "Friday vs Riverside"; // This would come from games service

//   return (
//     <SafeAreaView 
//       style={[styles.container, { backgroundColor: currentColors.background }]}
//       accessibilityLabel="Dashboard screen"
//     >
//       <DashboardHeader 
//         coachName={coach?.name || 'Coach'}
//         coachImageUri={coach?.imageUri}
//         currentColors={currentColors}
//       />

//       <ScrollView 
//         style={styles.content} 
//         showsVerticalScrollIndicator={false}
//         accessibilityLabel="Dashboard content"
//       >
//         <WelcomeHero
//           coachName={coach?.name || 'Coach'}
//           coachImageUri={coach?.imageUri}
//           record={teamRecord}
//           nextGame={nextGame}
//           onViewFilm={() => router.push('/videos')}
//           accessibilityLabel={`Welcome back, ${coach?.name}. ${selectedTeam.name} record: ${teamRecord}`}
//           viewFilmAccessibilityLabel="View recent game film"
//         />

//         <QuickStats 
//           stats={quickStatsData} 
//           currentColors={currentColors}
//           sectionAccessibilityLabel="Quick statistics section"
//         />

//         <QuickActions 
//           actions={quickActionsData}
//           onActionPress={handleAction}
//           currentColors={currentColors}
//           sectionAccessibilityLabel="Quick actions section"
//         />

//         <RecentGames
//           games={recentGamesData}
//           onSeeAll={() => router.push('/games')}
//           onGamePress={() => router.push('/games')}
//           onCategoryPress={() => router.push('/videos')}
//           onWatchFilm={() => handleAction('watch-full')}
//           currentColors={currentColors}
//           sectionAccessibilityLabel="Recent games section"
//           seeAllAccessibilityLabel="See all games"
//           seeAllAccessibilityHint="View complete game history"
//         />

//         <View style={styles.bottomGrid}>
//           <TeamPerformance
//             winRate={teamStats.winRate}
//             stats={performanceStatsData}
//             onPress={() => router.push('/explore')}
//             accessibilityLabel={`Team performance: ${teamStats.winRate} percent win rate`}
//             accessibilityHint="Tap to view detailed team analytics"
//           />

//           <PlayerSpotlight
//             players={players.slice(0, 3)}
//             onSeeAll={() => router.push('/teams')}
//             onPlayerPress={() => router.push('/teams')}
//             currentColors={currentColors}
//             sectionAccessibilityLabel="Player spotlight section"
//             seeAllAccessibilityLabel="See all players"
//             seeAllAccessibilityHint="View complete team roster"
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: Spacing.md,
//   },
//   loadingText: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: Spacing.xxl,
//     gap: Spacing.md,
//   },
//   emptyTitle: {
//     fontSize: Typography.title2,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   emptyMessage: {
//     fontSize: Typography.body,
//     textAlign: 'center',
//     maxWidth: 300,
//   },
//   selectTeamButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     paddingHorizontal: Spacing.lg,
//     paddingVertical: Spacing.md,
//     borderRadius: 12,
//     marginTop: Spacing.md,
//   },
//   selectTeamButtonText: {
//     fontSize: Typography.body,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   bottomGrid: {
//     paddingHorizontal: Spacing.xl,
//     marginTop: Spacing.xl,
//     paddingBottom: Spacing.xl,
//     gap: Spacing.lg,
//   },
// });