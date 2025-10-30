/**
 * Player Store
 *
 * Global state management for players with AsyncStorage persistence.
 * Manages selected player, player lists, and player-related operations.
 */

import { create } from 'zustand';
import { Player } from '@/data/mockData';
import { storage, StorageKeys } from '@/utils/storage';

interface PlayerStore {
  // State
  selectedPlayer: Player | null;
  players: Player[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedPlayer: (player: Player | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed
  getPlayersByTeam: (teamId: string) => Player[];
  getPlayerById: (playerId: string) => Player | undefined;

  // Persistence
  loadSelectedPlayer: () => Promise<void>;
  persistSelectedPlayer: () => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  selectedPlayer: null,
  players: [],
  isLoading: false,
  error: null,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  setSelectedPlayer: (player) => {
    set({ selectedPlayer: player, error: null });

    // Persist to AsyncStorage
    if (player) {
      storage.setItem(StorageKeys.SELECTED_PLAYER_ID, player.id).catch(console.error);
    } else {
      storage.removeItem(StorageKeys.SELECTED_PLAYER_ID).catch(console.error);
    }
  },

  setPlayers: (players) => {
    set({ players, error: null });
  },

  addPlayer: (player) => {
    set((state) => ({
      players: [...state.players, player],
      error: null,
    }));
  },

  updatePlayer: (playerId, updates) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player
      ),
      selectedPlayer:
        state.selectedPlayer?.id === playerId
          ? { ...state.selectedPlayer, ...updates }
          : state.selectedPlayer,
      error: null,
    }));
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
      selectedPlayer:
        state.selectedPlayer?.id === playerId ? null : state.selectedPlayer,
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

  getPlayersByTeam: (teamId) => {
    // This would filter players by team ID in a real implementation
    // For now, return all players
    return get().players;
  },

  getPlayerById: (playerId) => {
    return get().players.find((p) => p.id === playerId);
  },

  loadSelectedPlayer: async () => {
    try {
      const playerId = await storage.getItem<string>(StorageKeys.SELECTED_PLAYER_ID);
      if (playerId) {
        const { players } = get();
        const player = players.find((p) => p.id === playerId);
        if (player) {
          set({ selectedPlayer: player });
        }
      }
    } catch (error) {
      console.error('Error loading selected player:', error);
      set({ error: 'Failed to load selected player' });
    }
  },

  persistSelectedPlayer: async () => {
    try {
      const { selectedPlayer } = get();
      if (selectedPlayer) {
        await storage.setItem(StorageKeys.SELECTED_PLAYER_ID, selectedPlayer.id);
      } else {
        await storage.removeItem(StorageKeys.SELECTED_PLAYER_ID);
      }
    } catch (error) {
      console.error('Error persisting selected player:', error);
    }
  },

  reset: () => {
    set(initialState);
    storage.removeItem(StorageKeys.SELECTED_PLAYER_ID).catch(console.error);
  },
}));
