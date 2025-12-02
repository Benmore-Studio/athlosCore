// File: app/(tabs)/teams.tsx
// Teams Screen - Redesigned to match Dashboard design system
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useTeamStore, usePlayerStore } from '@/stores';
import { BorderRadius, Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import teamService from '@/services/api/teamService';
import playerService from '@/services/api/playerService';
import userService from '@/services/api/userService';
import * as Sentry from '@sentry/react-native';

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

interface TeamFormData {
  name: string;
  sport: string;
  season: string;
}

interface PlayerFormData {
  name: string;
  jersey_number: string;
  position: string;
  height: string;
  weight: string;
}

export default function TeamsScreen() {
  const { currentColors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { teams, selectedTeam, setSelectedTeam, loadTeams, setTeams } = useTeamStore();
  const { players, loadPlayers, setPlayers } = usePlayerStore();

  // Responsive breakpoints
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  const [teamForm, setTeamForm] = useState<TeamFormData>({
    name: '',
    sport: 'Basketball',
    season: '2024-25',
  });

  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    name: '',
    jersey_number: '',
    position: 'PG',
    height: '',
    weight: '',
  });

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const sports = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Volleyball'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadPlayers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await loadCoachProfile();
      await loadTeams();
    } catch (err) {
      console.error('Failed to load data:', err);
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
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
      console.error('Failed to load coach profile:', err);
    }
  };

  // Team CRUD Operations
  const handleCreateTeam = () => {
    setEditingTeam(null);
    setTeamForm({
      name: '',
      sport: 'Basketball',
      season: '2024-25',
    });
    setShowTeamModal(true);
  };

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      sport: team.sport || 'Basketball',
      season: team.season || '2024-25',
    });
    setShowTeamModal(true);
  };

  const handleSaveTeam = async () => {
    if (!teamForm.name.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      if (editingTeam) {
        const updated = await teamService.updateTeam(editingTeam.id, teamForm);
        const updatedTeams = teams.map(t => t.id === editingTeam.id ? updated : t);
        setTeams(updatedTeams);
        if (selectedTeam?.id === editingTeam.id) {
          setSelectedTeam(updated);
        }
        Alert.alert('Success', 'Team updated successfully');
      } else {
        const newTeam = await teamService.createTeam(teamForm);
        setTeams([...teams, newTeam]);
        if (!selectedTeam) {
          setSelectedTeam(newTeam);
        }
        Alert.alert('Success', 'Team created successfully');
      }
      setShowTeamModal(false);
    } catch (err) {
      console.error('Failed to save team:', err);
      Alert.alert('Error', 'Failed to save team. Please try again.');
    }
  };

  const handleDeleteTeam = (team: any) => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete ${team.name}? This will remove all players and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamService.deleteTeam(team.id);
              const updatedTeams = teams.filter(t => t.id !== team.id);
              setTeams(updatedTeams);
              if (selectedTeam?.id === team.id) {
                setSelectedTeam(updatedTeams[0] || null);
              }
              Alert.alert('Success', 'Team deleted successfully');
            } catch (err) {
              console.error('Failed to delete team:', err);
              Alert.alert('Error', 'Failed to delete team. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Player CRUD Operations
  const handleAddPlayer = () => {
    if (!selectedTeam) {
      Alert.alert('Error', 'Please select a team first');
      return;
    }
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      jersey_number: '',
      position: 'PG',
      height: '',
      weight: '',
    });
    setShowPlayerModal(true);
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      jersey_number: player.jersey_number?.toString() || '',
      position: player.position || 'PG',
      height: player.height || '',
      weight: player.weight?.toString() || '',
    });
    setShowPlayerModal(true);
  };

  const handleSavePlayer = async () => {
    if (!selectedTeam) return;

    if (!playerForm.name.trim() || !playerForm.jersey_number) {
      Alert.alert('Error', 'Please enter player name and jersey number');
      return;
    }

    try {
      const playerData = {
        name: playerForm.name,
        jersey_number: parseInt(playerForm.jersey_number),
        position: playerForm.position,
        height: playerForm.height || undefined,
        weight: playerForm.weight ? parseFloat(playerForm.weight) : undefined,
        team_id: selectedTeam.id,
      };

      if (editingPlayer) {
        const updated = await playerService.updatePlayer(editingPlayer.id, playerData);
        const updatedPlayers = players.map(p => p.id === editingPlayer.id ? updated : p);
        setPlayers(updatedPlayers);
        Alert.alert('Success', 'Player updated successfully');
      } else {
        const newPlayer = await playerService.createPlayer(playerData);
        setPlayers([...players, newPlayer]);
        Alert.alert('Success', 'Player added successfully');
      }
      setShowPlayerModal(false);
    } catch (err) {
      console.error('Failed to save player:', err);
      Alert.alert('Error', 'Failed to save player. Please try again.');
    }
  };

  const handleDeletePlayer = (player: any) => {
    Alert.alert(
      'Remove Player',
      `Remove ${player.name} from the roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await playerService.deletePlayer(player.id);
              const updatedPlayers = players.filter(p => p.id !== player.id);
              setPlayers(updatedPlayers);
              Alert.alert('Success', 'Player removed successfully');
            } catch (err) {
              console.error('Failed to delete player:', err);
              Alert.alert('Error', 'Failed to remove player. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading teams...
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
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Teams</Text>
            <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
              {teams.length} {teams.length === 1 ? 'team' : 'teams'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.primary }]}
            onPress={handleCreateTeam}
            accessibilityLabel="Add new team"
          >
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
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
        <View style={styles.mainContent}>
          {/* HERO: Selected Team Card with Navy Gradient */}
          {selectedTeam ? (
            <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              <LinearGradient
                colors={['#1E2A3A', '#2D3E52']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroTeamCard}
              >
                <View style={styles.heroTeamHeader}>
                  <View style={styles.heroTeamInfo}>
                    <Text style={styles.heroTeamLabel}>Selected Team</Text>
                    <Text style={styles.heroTeamName}>{selectedTeam.name}</Text>
                    <Text style={styles.heroTeamMeta}>
                      {selectedTeam.sport || 'Basketball'} • {selectedTeam.season || '2024-25'}
                    </Text>
                  </View>
                  <View style={styles.heroTeamActions}>
                    <TouchableOpacity
                      onPress={() => handleEditTeam(selectedTeam)}
                      style={styles.heroActionButton}
                    >
                      <IconSymbol name="pencil" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>
                      {selectedTeam.wins || 0}-{selectedTeam.losses || 0}
                    </Text>
                    <Text style={styles.heroStatLabel}>Record</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{players.length}</Text>
                    <Text style={styles.heroStatLabel}>Players</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={[styles.heroStatValue, { color: Colors.primary }]}>
                      {selectedTeam.wins && selectedTeam.losses
                        ? Math.round((selectedTeam.wins / (selectedTeam.wins + selectedTeam.losses)) * 100)
                        : 0}%
                    </Text>
                    <Text style={styles.heroStatLabel}>Win Rate</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <>
              {/* Hero Empty State */}
              <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                <LinearGradient
                  colors={['#1E2A3A', '#2D3E52']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyStateHero}
                >
                  <View style={[styles.emptyStateHeroContent, isTablet && styles.emptyStateHeroContentTablet]}>
                    <View style={styles.emptyStateLeft}>
                      <View style={styles.emptyStateIconContainer}>
                        <LinearGradient
                          colors={[Colors.primary, Colors.primaryLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.emptyStateIconGradient}
                        >
                          <IconSymbol name="sportscourt.fill" size={isTablet ? 48 : 40} color="#FFFFFF" />
                        </LinearGradient>
                      </View>

                      <Text style={[styles.emptyStateTitle, isTablet && styles.emptyStateTitleTablet]}>
                        Welcome to Teams
                      </Text>
                      <Text style={[styles.emptyStateDescription, isTablet && styles.emptyStateDescriptionTablet]}>
                        Create your first team to start managing players, tracking games, and analyzing performance with AI-powered insights
                      </Text>

                      <TouchableOpacity
                        style={styles.emptyStateCTA}
                        onPress={handleCreateTeam}
                      >
                        <LinearGradient
                          colors={[Colors.primary, Colors.primaryLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.emptyStateCTAGradient}
                        >
                          <IconSymbol name="plus" size={20} color="#FFFFFF" />
                          <Text style={styles.emptyStateCTAText}>Create Your First Team</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>

                    {isTablet && (
                      <View style={styles.emptyStateRight}>
                        <View style={styles.emptyStatsPreview}>
                          <View style={styles.emptyStatPreviewItem}>
                            <Text style={styles.emptyStatPreviewValue}>0-0</Text>
                            <Text style={styles.emptyStatPreviewLabel}>Record</Text>
                          </View>
                          <View style={styles.emptyStatDivider} />
                          <View style={styles.emptyStatPreviewItem}>
                            <Text style={styles.emptyStatPreviewValue}>0</Text>
                            <Text style={styles.emptyStatPreviewLabel}>Players</Text>
                          </View>
                          <View style={styles.emptyStatDivider} />
                          <View style={styles.emptyStatPreviewItem}>
                            <Text style={[styles.emptyStatPreviewValue, { color: Colors.primary }]}>0%</Text>
                            <Text style={styles.emptyStatPreviewLabel}>Win Rate</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Feature Cards */}
              <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sectionContainer}>
                <View style={[styles.sectionCard, { backgroundColor: currentColors.cardBackground }]}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '15' }]}>
                        <IconSymbol name="star.fill" size={18} color={Colors.primary} />
                      </View>
                      <Text style={[styles.sectionTitle, { color: currentColors.text }]}>What You Can Do</Text>
                    </View>
                  </View>

                  <View style={styles.featureGrid}>
                    <View style={styles.featureRow}>
                      <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.featureCardWrapper}>
                        <View style={[styles.featureCard, { backgroundColor: currentColors.surface }]}>
                          <View style={[styles.featureIconLarge, { backgroundColor: Colors.primary + '15' }]}>
                            <IconSymbol name="person.3.fill" size={28} color={Colors.primary} />
                          </View>
                          <Text style={[styles.featureCardTitle, { color: currentColors.text }]}>
                            Manage Roster
                          </Text>
                          <Text style={[styles.featureCardDescription, { color: currentColors.textSecondary }]}>
                            Add players, track positions, jersey numbers, and build your complete team roster
                          </Text>
                        </View>
                      </Animated.View>

                      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.featureCardWrapper}>
                        <View style={[styles.featureCard, { backgroundColor: currentColors.surface }]}>
                          <View style={[styles.featureIconLarge, { backgroundColor: Colors.info + '15' }]}>
                            <IconSymbol name="chart.bar.fill" size={28} color={Colors.info} />
                          </View>
                          <Text style={[styles.featureCardTitle, { color: currentColors.text }]}>
                            Track Performance
                          </Text>
                          <Text style={[styles.featureCardDescription, { color: currentColors.textSecondary }]}>
                            Monitor player stats, game results, and see detailed performance analytics over time
                          </Text>
                        </View>
                      </Animated.View>
                    </View>

                    <View style={styles.featureRow}>
                      <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.featureCardWrapper}>
                        <View style={[styles.featureCard, { backgroundColor: currentColors.surface }]}>
                          <View style={[styles.featureIconLarge, { backgroundColor: Colors.success + '15' }]}>
                            <IconSymbol name="video.fill" size={28} color={Colors.success} />
                          </View>
                          <Text style={[styles.featureCardTitle, { color: currentColors.text }]}>
                            AI Video Analysis
                          </Text>
                          <Text style={[styles.featureCardDescription, { color: currentColors.textSecondary }]}>
                            Upload game footage and get AI-powered insights, highlights, and coaching recommendations
                          </Text>
                        </View>
                      </Animated.View>

                      <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.featureCardWrapper}>
                        <View style={[styles.featureCard, { backgroundColor: currentColors.surface }]}>
                          <View style={[styles.featureIconLarge, { backgroundColor: Colors.warning + '15' }]}>
                            <IconSymbol name="lightbulb.fill" size={28} color={Colors.warning} />
                          </View>
                          <Text style={[styles.featureCardTitle, { color: currentColors.text }]}>
                            Get AI Insights
                          </Text>
                          <Text style={[styles.featureCardDescription, { color: currentColors.textSecondary }]}>
                            Receive personalized coaching tips and strategic insights based on your team's data
                          </Text>
                        </View>
                      </Animated.View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </>
          )}

          {/* Other Teams Section */}
          {teams.length > 1 && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sectionContainer}>
              <View style={[styles.sectionCard, { backgroundColor: currentColors.cardBackground }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.sectionIcon, { backgroundColor: Colors.headerBackground + '15' }]}>
                      <IconSymbol name="sportscourt.fill" size={18} color={Colors.headerBackground} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: currentColors.text }]}>All Teams</Text>
                  </View>
                </View>

                <View style={[styles.teamsGrid, isTablet && styles.teamsGridTablet]}>
                  {teams.filter(t => t.id !== selectedTeam?.id).map((team, index) => (
                    <Animated.View
                      key={team.id}
                      entering={FadeInRight.delay(250 + index * 50).duration(300)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.teamCard,
                          { backgroundColor: currentColors.surface },
                          isTablet && styles.teamCardTablet
                        ]}
                        onPress={() => setSelectedTeam(team)}
                      >
                        <View style={styles.teamCardContent}>
                          <View style={styles.teamCardInfo}>
                            <Text style={[styles.teamCardName, { color: currentColors.text }]} numberOfLines={1}>
                              {team.name}
                            </Text>
                            <Text style={[styles.teamCardMeta, { color: currentColors.textSecondary }]}>
                              {team.wins || 0}-{team.losses || 0} • {team.player_count || 0} players
                            </Text>
                          </View>
                          <IconSymbol name="chevron.right" size={16} color={currentColors.textLight} />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Roster Section */}
          {selectedTeam && (
            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.sectionContainer}>
              <View style={[styles.sectionCard, { backgroundColor: currentColors.cardBackground }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '15' }]}>
                      <IconSymbol name="person.3.fill" size={18} color={Colors.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Roster</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleAddPlayer}
                    style={[styles.addButton, { backgroundColor: Colors.primary }]}
                  >
                    <IconSymbol name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Player</Text>
                  </TouchableOpacity>
                </View>

                {players.length === 0 ? (
                  <View style={styles.emptyRoster}>
                    <IconSymbol name="person.badge.plus" size={40} color={currentColors.textLight} />
                    <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                      No players on roster yet
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Table Header for Tablet */}
                    {isTablet && (
                      <View style={styles.rosterHeaderRow}>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, width: 32 }]}>#</Text>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, flex: 1, marginLeft: 56 }]}>Player</Text>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, width: 60, textAlign: 'center' }]}>POS</Text>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, width: 80, textAlign: 'center' }]}>Height</Text>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, width: 80, textAlign: 'center' }]}>Weight</Text>
                        <Text style={[styles.rosterHeaderText, { color: currentColors.textSecondary, width: 80, textAlign: 'center' }]}>Actions</Text>
                      </View>
                    )}

                    {players.map((player, index) => (
                      <Animated.View
                        key={player.id}
                        entering={FadeInUp.delay(350 + index * 30).duration(300)}
                      >
                        <View
                          style={[
                            styles.playerRow,
                            index < players.length - 1 && { borderBottomWidth: 1, borderBottomColor: currentColors.border }
                          ]}
                        >
                          <View style={[styles.jerseyBadge, { backgroundColor: Colors.primary + '15' }]}>
                            <Text style={[styles.jerseyNumber, { color: Colors.primary }]}>
                              {player.jersey_number}
                            </Text>
                          </View>
                          <PlayerAvatar
                            name={player.name}
                            imageUri={player.imageUri}
                            jerseyNumber={player.jersey_number}
                            size="small"
                            variant="default"
                          />
                          <View style={styles.playerInfo}>
                            <Text style={[styles.playerName, { color: currentColors.text }]} numberOfLines={1}>
                              {player.name}
                            </Text>
                            {!isTablet && (
                              <Text style={[styles.playerMeta, { color: currentColors.textSecondary }]}>
                                {player.position} {player.height ? `• ${player.height}` : ''}
                              </Text>
                            )}
                          </View>
                          {isTablet && (
                            <>
                              <Text style={[styles.playerPosText, { color: currentColors.textSecondary }]}>
                                {player.position || '-'}
                              </Text>
                              <Text style={[styles.playerStatText, { color: currentColors.text }]}>
                                {player.height || '-'}
                              </Text>
                              <Text style={[styles.playerStatText, { color: currentColors.text }]}>
                                {player.weight ? `${player.weight} lbs` : '-'}
                              </Text>
                            </>
                          )}
                          <View style={styles.playerActions}>
                            <TouchableOpacity
                              onPress={() => handleEditPlayer(player)}
                              style={[styles.actionIconButton, { backgroundColor: Colors.primary + '15' }]}
                            >
                              <IconSymbol name="pencil" size={14} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeletePlayer(player)}
                              style={[styles.actionIconButton, { backgroundColor: Colors.error + '15' }]}
                            >
                              <IconSymbol name="trash" size={14} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Animated.View>
                    ))}
                  </>
                )}
              </View>
            </Animated.View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Team Modal */}
      <Modal
        visible={showTeamModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: currentColors.border }]}>
            <TouchableOpacity onPress={() => setShowTeamModal(false)}>
              <Text style={[styles.modalCancel, { color: currentColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {editingTeam ? 'Edit Team' : 'New Team'}
            </Text>
            <TouchableOpacity onPress={handleSaveTeam}>
              <Text style={[styles.modalSave, { color: Colors.primary }]}>
                {editingTeam ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Team Name</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: currentColors.surface,
                  color: currentColors.text,
                  borderColor: currentColors.border
                }]}
                value={teamForm.name}
                onChangeText={(text) => setTeamForm({ ...teamForm, name: text })}
                placeholder="Enter team name"
                placeholderTextColor={currentColors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Sport</Text>
              <View style={styles.optionsRow}>
                {sports.slice(0, 3).map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => setTeamForm({ ...teamForm, sport })}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: teamForm.sport === sport ? Colors.primary : currentColors.surface,
                        borderColor: teamForm.sport === sport ? Colors.primary : currentColors.border
                      }
                    ]}
                  >
                    <Text style={[
                      styles.optionChipText,
                      { color: teamForm.sport === sport ? '#FFFFFF' : currentColors.text }
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Season</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: currentColors.surface,
                  color: currentColors.text,
                  borderColor: currentColors.border
                }]}
                value={teamForm.season}
                onChangeText={(text) => setTeamForm({ ...teamForm, season: text })}
                placeholder="e.g., 2024-25"
                placeholderTextColor={currentColors.textLight}
              />
            </View>

            {editingTeam && (
              <TouchableOpacity
                onPress={() => {
                  setShowTeamModal(false);
                  handleDeleteTeam(editingTeam);
                }}
                style={[styles.deleteButton, { backgroundColor: Colors.error + '15' }]}
              >
                <IconSymbol name="trash" size={18} color={Colors.error} />
                <Text style={[styles.deleteButtonText, { color: Colors.error }]}>Delete Team</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Player Modal */}
      <Modal
        visible={showPlayerModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: currentColors.border }]}>
            <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
              <Text style={[styles.modalCancel, { color: currentColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {editingPlayer ? 'Edit Player' : 'Add Player'}
            </Text>
            <TouchableOpacity onPress={handleSavePlayer}>
              <Text style={[styles.modalSave, { color: Colors.primary }]}>
                {editingPlayer ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Player Name</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: currentColors.surface,
                  color: currentColors.text,
                  borderColor: currentColors.border
                }]}
                value={playerForm.name}
                onChangeText={(text) => setPlayerForm({ ...playerForm, name: text })}
                placeholder="Enter player name"
                placeholderTextColor={currentColors.textLight}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Jersey #</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={playerForm.jersey_number}
                  onChangeText={(text) => setPlayerForm({ ...playerForm, jersey_number: text })}
                  placeholder="00"
                  keyboardType="number-pad"
                  placeholderTextColor={currentColors.textLight}
                />
              </View>

              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Position</Text>
                <View style={styles.positionsRow}>
                  {positions.map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      onPress={() => setPlayerForm({ ...playerForm, position: pos })}
                      style={[
                        styles.positionChip,
                        {
                          backgroundColor: playerForm.position === pos ? Colors.primary : currentColors.surface,
                          borderColor: playerForm.position === pos ? Colors.primary : currentColors.border
                        }
                      ]}
                    >
                      <Text style={[
                        styles.positionChipText,
                        { color: playerForm.position === pos ? '#FFFFFF' : currentColors.text }
                      ]}>
                        {pos}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Height</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={playerForm.height}
                  onChangeText={(text) => setPlayerForm({ ...playerForm, height: text })}
                  placeholder="6'2&quot;"
                  placeholderTextColor={currentColors.textLight}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Weight (lbs)</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }]}
                  value={playerForm.weight}
                  onChangeText={(text) => setPlayerForm({ ...playerForm, weight: text })}
                  placeholder="185"
                  keyboardType="decimal-pad"
                  placeholderTextColor={currentColors.textLight}
                />
              </View>
            </View>

            {editingPlayer && (
              <TouchableOpacity
                onPress={() => {
                  setShowPlayerModal(false);
                  handleDeletePlayer(editingPlayer);
                }}
                style={[styles.deleteButton, { backgroundColor: Colors.error + '15' }]}
              >
                <IconSymbol name="trash" size={18} color={Colors.error} />
                <Text style={[styles.deleteButtonText, { color: Colors.error }]}>Remove Player</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Hero Team Card - Navy Gradient
  heroTeamCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  heroTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  heroTeamInfo: {
    flex: 1,
  },
  heroTeamLabel: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  heroTeamName: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroTeamMeta: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  heroTeamActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  heroActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Empty State - Hero Section
  emptyStateHero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  emptyStateHeroContent: {
    alignItems: 'center',
  },
  emptyStateHeroContentTablet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  emptyStateLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  emptyStateRight: {
    marginLeft: Spacing.xl,
    minWidth: 280,
  },
  emptyStateIconContainer: {
    marginBottom: Spacing.lg,
  },
  emptyStateIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primaryGlow,
  },
  emptyStateTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateTitleTablet: {
    fontSize: Typography.title1,
    textAlign: 'left',
  },
  emptyStateDescription: {
    fontSize: Typography.subhead,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.subhead * 1.5,
  },
  emptyStateDescriptionTablet: {
    fontSize: Typography.body,
    textAlign: 'left',
    maxWidth: 500,
  },
  emptyStatsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  emptyStatPreviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  emptyStatPreviewValue: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyStatPreviewLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  emptyStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyStateCTA: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  emptyStateCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyStateCTAText: {
    fontSize: Typography.subhead,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Feature Cards - 2x2 Grid
  featureGrid: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
  },
  featureCardWrapper: {
    width: '46%',
    maxWidth: 400,
  },
  featureCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    minHeight: 180,
  },
  featureIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  featureCardTitle: {
    fontSize: Typography.subhead,
    fontWeight: '700',
  },
  featureCardDescription: {
    fontSize: Typography.footnote,
    lineHeight: Typography.footnote * 1.5,
  },

  // Section Container
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

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Teams Grid
  teamsGrid: {
    gap: Spacing.sm,
  },
  teamsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  teamCardTablet: {
    width: '48%',
    marginRight: '2%',
    marginBottom: Spacing.sm,
  },
  teamCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCardInfo: {
    flex: 1,
  },
  teamCardName: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    marginBottom: 2,
  },
  teamCardMeta: {
    fontSize: Typography.footnote,
  },

  // Roster
  rosterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  rosterHeaderText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  jerseyBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyNumber: {
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  playerMeta: {
    fontSize: Typography.footnote,
    marginTop: 2,
  },
  playerPosText: {
    width: 60,
    fontSize: Typography.subhead,
    fontWeight: '500',
    textAlign: 'center',
  },
  playerStatText: {
    width: 80,
    fontSize: Typography.subhead,
    fontWeight: '500',
    textAlign: 'center',
  },
  playerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: 80,
    justifyContent: 'center',
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty States
  emptyRoster: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.subhead,
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
  modalSave: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.body,
    minHeight: 48,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  positionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  positionChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  positionChipText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  deleteButtonText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
});
