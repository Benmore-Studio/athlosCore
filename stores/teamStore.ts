/**
 * Team Store
 *
 * Global state management for teams with AsyncStorage persistence.
 * Manages selected team, team list, and team-related operations.
 */

import { create } from 'zustand';
import { Team } from '@/data/mockData';
import { storage, StorageKeys } from '@/utils/storage';

interface TeamStore {
  // State
  selectedTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedTeam: (team: Team | null) => void;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Persistence
  loadSelectedTeam: () => Promise<void>;
  persistSelectedTeam: () => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  selectedTeam: null,
  teams: [],
  isLoading: false,
  error: null,
};

export const useTeamStore = create<TeamStore>((set, get) => ({
  ...initialState,

  setSelectedTeam: (team) => {
    set({ selectedTeam: team, error: null });

    // Persist to AsyncStorage
    if (team) {
      storage.setItem(StorageKeys.SELECTED_TEAM_ID, team.id).catch(console.error);
    } else {
      storage.removeItem(StorageKeys.SELECTED_TEAM_ID).catch(console.error);
    }
  },

  setTeams: (teams) => {
    set({ teams, error: null });
  },

  addTeam: (team) => {
    set((state) => ({
      teams: [...state.teams, team],
      error: null,
    }));
  },

  updateTeam: (teamId, updates) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, ...updates } : team
      ),
      selectedTeam:
        state.selectedTeam?.id === teamId
          ? { ...state.selectedTeam, ...updates }
          : state.selectedTeam,
      error: null,
    }));
  },

  removeTeam: (teamId) => {
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== teamId),
      selectedTeam:
        state.selectedTeam?.id === teamId ? null : state.selectedTeam,
      error: null,
    }));
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  loadSelectedTeam: async () => {
    try {
      const teamId = await storage.getItem<string>(StorageKeys.SELECTED_TEAM_ID);
      if (teamId) {
        const { teams } = get();
        const team = teams.find((t) => t.id === teamId);
        if (team) {
          set({ selectedTeam: team });
        }
      }
    } catch (error) {
      console.error('Error loading selected team:', error);
      set({ error: 'Failed to load selected team' });
    }
  },

  persistSelectedTeam: async () => {
    try {
      const { selectedTeam } = get();
      if (selectedTeam) {
        await storage.setItem(StorageKeys.SELECTED_TEAM_ID, selectedTeam.id);
      } else {
        await storage.removeItem(StorageKeys.SELECTED_TEAM_ID);
      }
    } catch (error) {
      console.error('Error persisting selected team:', error);
    }
  },

  reset: () => {
    set(initialState);
    storage.removeItem(StorageKeys.SELECTED_TEAM_ID).catch(console.error);
  },
}));
