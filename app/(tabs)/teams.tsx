// File: app/(tabs)/teams.tsx
// Copy this entire file and replace your existing teams.tsx

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useTeamStore, usePlayerStore } from '@/stores';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
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
  const { currentColors, isDark } = useTheme();
  const { teams, selectedTeam, setSelectedTeam, loadTeams, setTeams } = useTeamStore();
  const { players, loadPlayers, setPlayers } = usePlayerStore();
  
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
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
        // Update existing team
        const updated = await teamService.updateTeam(editingTeam.id, teamForm);
        const updatedTeams = teams.map(t => t.id === editingTeam.id ? updated : t);
        setTeams(updatedTeams);
        if (selectedTeam?.id === editingTeam.id) {
          setSelectedTeam(updated);
        }
        Alert.alert('Success', 'Team updated successfully');
      } else {
        // Create new team
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
        // Update existing player
        const updated = await playerService.updatePlayer(editingPlayer.id, playerData);
        const updatedPlayers = players.map(p => p.id === editingPlayer.id ? updated : p);
        setPlayers(updatedPlayers);
        Alert.alert('Success', 'Player updated successfully');
      } else {
        // Create new player
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
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading teams...
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
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>Teams</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Teams Section */}
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                My Teams
              </Text>
              <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
                {teams.length} {teams.length === 1 ? 'team' : 'teams'}
              </Text>
            </View>
            <Button
              title="Add Team"
              onPress={handleCreateTeam}
              variant="primaryGradient"
              icon={<IconSymbol name="plus" size={18} color="#FFFFFF" />}
              size="small"
            />
          </View>

          {teams.length === 0 ? (
            <Card variant="elevated" padding="large" style={styles.emptyCard}>
              <IconSymbol name="sportscourt.fill" size={48} color={currentColors.textLight} />
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No Teams Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
                Create your first team to get started
              </Text>
            </Card>
          ) : (
            <View style={styles.teamsList}>
              {teams.map((team, index) => (
                <Animated.View
                  key={team.id}
                  entering={ZoomIn.delay(800 + index * 100).springify()}
                >
                  <Card
                    variant={selectedTeam?.id === team.id ? "gradient" : "elevated"}
                    padding="large"
                    style={styles.teamCard}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedTeam(team)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.teamCardHeader}>
                        <View style={styles.teamInfo}>
                          <Text style={[
                            styles.teamName,
                            { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {team.name}
                          </Text>
                          <View style={styles.teamMeta}>
                            <Text style={[
                              styles.teamMetaText,
                              { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.textSecondary }
                            ]}>
                              {team.sport} • {team.season}
                            </Text>
                          </View>
                        </View>
                        {selectedTeam?.id === team.id && (
                          <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                        )}
                      </View>

                      <View style={styles.teamStats}>
                        <View style={styles.teamStat}>
                          <Text style={[
                            styles.teamStatValue,
                            { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {team.wins || 0}-{team.losses || 0}
                          </Text>
                          <Text style={[
                            styles.teamStatLabel,
                            { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.textSecondary }
                          ]}>
                            Record
                          </Text>
                        </View>
                        <View style={styles.teamStat}>
                          <Text style={[
                            styles.teamStatValue,
                            { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.text }
                          ]}>
                            {team.player_count || 0}
                          </Text>
                          <Text style={[
                            styles.teamStatLabel,
                            { color: selectedTeam?.id === team.id ? '#FFFFFF' : currentColors.textSecondary }
                          ]}>
                            Players
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.teamActions}>
                      <TouchableOpacity
                        onPress={() => handleEditTeam(team)}
                        style={[styles.actionButton, { backgroundColor: currentColors.surface }]}
                      >
                        <IconSymbol name="pencil" size={16} color={currentColors.primary} />
                        <Text style={[styles.actionButtonText, { color: currentColors.primary }]}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTeam(team)}
                        style={[styles.actionButton, { backgroundColor: currentColors.error + '20' }]}
                      >
                        <IconSymbol name="trash" size={16} color={currentColors.error} />
                        <Text style={[styles.actionButtonText, { color: currentColors.error }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Players Section */}
        {selectedTeam && (
          <Animated.View entering={FadeInUp.delay(1000).springify()}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Roster
                </Text>
                <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
                  {selectedTeam.name}
                </Text>
              </View>
              <Button
                title="Add Player"
                onPress={handleAddPlayer}
                variant="outline"
                icon={<IconSymbol name="person.badge.plus" size={18} color={currentColors.primary} />}
                size="small"
              />
            </View>

            {players.length === 0 ? (
              <Card variant="elevated" padding="large" style={styles.emptyCard}>
                <IconSymbol name="person.3.fill" size={48} color={currentColors.textLight} />
                <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                  No Players Yet
                </Text>
                <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
                  Add players to your roster
                </Text>
              </Card>
            ) : (
              <View style={styles.playersList}>
                {players.map((player, index) => (
                  <Animated.View
                    key={player.id}
                    entering={ZoomIn.delay(1200 + index * 100).springify()}
                  >
                    <Card variant="elevated" padding="medium" style={styles.playerCard}>
                      <View style={styles.playerCardContent}>
                        <PlayerAvatar
                          name={player.name}
                          imageUri={player.imageUri}
                          jerseyNumber={player.jersey_number}
                          size="medium"
                        />
                        <View style={styles.playerInfo}>
                          <Text style={[styles.playerName, { color: currentColors.text }]}>
                            {player.name}
                          </Text>
                          <Text style={[styles.playerMeta, { color: currentColors.textSecondary }]}>
                            #{player.jersey_number} • {player.position}
                          </Text>
                          {player.height && player.weight && (
                            <Text style={[styles.playerDetails, { color: currentColors.textLight }]}>
                              {player.height} • {player.weight} lbs
                            </Text>
                          )}
                        </View>
                        <View style={styles.playerActions}>
                          <TouchableOpacity
                            onPress={() => handleEditPlayer(player)}
                            style={styles.iconButton}
                          >
                            <IconSymbol name="pencil.circle.fill" size={28} color={currentColors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeletePlayer(player)}
                            style={styles.iconButton}
                          >
                            <IconSymbol name="trash.circle.fill" size={28} color={currentColors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Team Modal */}
      <Modal
        visible={showTeamModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {editingTeam ? 'Edit Team' : 'Create Team'}
            </Text>
            <TouchableOpacity onPress={() => setShowTeamModal(false)}>
              <IconSymbol name="xmark.circle.fill" size={28} color={currentColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Team Name *</Text>
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
              <View style={styles.optionsGrid}>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => setTeamForm({ ...teamForm, sport })}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: teamForm.sport === sport ? currentColors.primary : currentColors.surface,
                        borderColor: currentColors.border
                      }
                    ]}
                  >
                    <Text style={[
                      styles.optionText,
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
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowTeamModal(false)}
              variant="ghost"
              style={styles.modalButton}
            />
            <Button
              title={editingTeam ? 'Update' : 'Create'}
              onPress={handleSaveTeam}
              variant="primaryGradient"
              style={styles.modalButton}
            />
          </View>
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
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {editingPlayer ? 'Edit Player' : 'Add Player'}
            </Text>
            <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
              <IconSymbol name="xmark.circle.fill" size={28} color={currentColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: currentColors.text }]}>Player Name *</Text>
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
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Jersey # *</Text>
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

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: currentColors.text }]}>Position</Text>
                <View style={styles.positionsRow}>
                  {positions.map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      onPress={() => setPlayerForm({ ...playerForm, position: pos })}
                      style={[
                        styles.positionButton,
                        { 
                          backgroundColor: playerForm.position === pos ? currentColors.primary : currentColors.surface,
                          borderColor: currentColors.border
                        }
                      ]}
                    >
                      <Text style={[
                        styles.positionText,
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
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowPlayerModal(false)}
              variant="ghost"
              style={styles.modalButton}
            />
            <Button
              title={editingPlayer ? 'Update' : 'Add'}
              onPress={handleSavePlayer}
              variant="primaryGradient"
              style={styles.modalButton}
            />
          </View>
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
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: Typography.callout,
    fontWeight: '500',
    marginTop: Spacing.xs / 2,
  },
  emptyCard: {
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  emptyMessage: {
    fontSize: Typography.callout,
    textAlign: 'center',
  },
  teamsList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  teamCard: {
    overflow: 'hidden',
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  teamMetaText: {
    fontSize: Typography.callout,
    fontWeight: '500',
  },
  teamStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  teamStat: {
    alignItems: 'center',
  },
  teamStatValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  teamStatLabel: {
    fontSize: Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.xs / 2,
  },
  teamActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  playersList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  playerCard: {
    overflow: 'hidden',
  },
  playerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: Typography.callout,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  playerMeta: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  playerDetails: {
    fontSize: Typography.footnote,
    marginTop: Spacing.xs / 2,
  },
  playerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs / 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Typography.callout,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  optionText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  positionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  positionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  positionText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modalButton: {
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