// File: services/api/playerService.ts
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import offlineApiService from './offlineApiService';

export interface Player {
  player_id: string;
  team_id: string;
  video_id: string;
  model_player_identifier: string;
  name?: string;
  player_number?: number;
  stats?: PlayerStats;
  created_at: string;
  updated_at?: string;
}

export interface PlayerStats {
  two_point_att: number;
  two_point_made: number;
  three_point_att: number;
  three_point_made: number;
  free_throw_att: number;
  free_throw_made: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  possessions_count: number;
  passes_made: number;
  passes_received: number;
  interceptions_made: number;
}

class PlayerService {
  /**
   * Get players with offline support
   */
  async getPlayers(filters?: {
    video_id?: string;
    team_id?: string;
    name?: string;
    player_number?: string;
    stats?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ players: Player[]; pagination: any }> {
    const cacheKey = `players_${filters?.team_id || filters?.video_id || 'all'}_${filters?.page || 1}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYERS, { params: filters });
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Get player by ID with offline support
   */
  async getPlayerById(playerId: string, includeStats = false): Promise<Player> {
    const cacheKey = `player_${playerId}_${includeStats ? 'with_stats' : 'no_stats'}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYER_BY_ID(playerId), {
          params: { stats: includeStats },
        });
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 30 * 60 * 1000 // 30 minutes cache
      }
    );
  }

  /**
   * Create player
   * Note: Clears relevant caches after creation
   */
  async createPlayer(data: {
    player_id: string;
    team_id: string;
    video_id: string;
    model_player_identifier: string;
    name?: string;
    player_number?: number;
  }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PLAYERS, data);
    
    // Clear relevant caches
    await offlineApiService.clearCache(`players_${data.team_id}_1`);
    await offlineApiService.clearCache(`players_${data.video_id}_1`);
    await offlineApiService.clearCache(`players_all_1`);
  }

  /**
   * Update player
   * Note: Clears relevant caches after update
   */
  async updatePlayer(playerId: string, data: { name?: string; player_number?: number }): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PLAYER_BY_ID(playerId), data);
    
    // Clear player-specific cache
    await offlineApiService.clearCache(`player_${playerId}_with_stats`);
    await offlineApiService.clearCache(`player_${playerId}_no_stats`);
    
    // Clear players list caches (you might want to be more specific based on team_id if available)
    const cachedKeys = await offlineApiService.getCachedKeys();
    const playerListKeys = cachedKeys.filter(key => key.startsWith('players_'));
    for (const key of playerListKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Delete player
   * Note: Clears relevant caches after deletion
   */
  async deletePlayer(playerId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PLAYER_BY_ID(playerId));
    
    // Clear player-specific cache
    await offlineApiService.clearCache(`player_${playerId}_with_stats`);
    await offlineApiService.clearCache(`player_${playerId}_no_stats`);
    
    // Clear all players list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const playerListKeys = cachedKeys.filter(key => key.startsWith('players_'));
    for (const key of playerListKeys) {
      await offlineApiService.clearCache(key);
    }
  }
}

export default new PlayerService();