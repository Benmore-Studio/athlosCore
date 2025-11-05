// File: services/api/playerStatsService.ts
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { PlayerStats } from './playerService';
import offlineApiService from './offlineApiService';

class PlayerStatsService {
  /**
   * Get player stats with offline support
   */
  async getPlayerStats(filters?: {
    video_id?: string;
    player_id?: string;
    team_id?: string;
    min_points?: number;
    max_points?: number;
    min_assists?: number;
    min_possessions?: number;
    page?: number;
    page_size?: number;
  }): Promise<{ player_stats: any[]; pagination: any }> {
    const cacheKey = `player_stats_${filters?.video_id || filters?.player_id || filters?.team_id || 'all'}_${filters?.page || 1}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS, { params: filters });
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 30 * 60 * 1000 // 30 minutes cache
      }
    );
  }

  /**
   * Get player stats by video with offline support
   */
  async getPlayerStatsByVideo(videoId: string): Promise<any[]> {
    const cacheKey = `player_stats_video_${videoId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_VIDEO(videoId));
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Get player stats by player with offline support
   */
  async getPlayerStatsByPlayer(playerId: string): Promise<any[]> {
    const cacheKey = `player_stats_player_${playerId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_PLAYER(playerId));
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Get player stats by team with offline support
   */
  async getPlayerStatsByTeam(teamId: string): Promise<any[]> {
    const cacheKey = `player_stats_team_${teamId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_TEAM(teamId));
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Get team totals with offline support
   */
  async getTeamTotals(teamId: string, videoId: string): Promise<any> {
    const cacheKey = `team_totals_${teamId}_${videoId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get(`${API_ENDPOINTS.TEAM_TOTALS(teamId)}?video_id=${videoId}`);
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Create player stat
   * Note: Clears related caches after creation
   */
  async createPlayerStat(data: PlayerStats & { video_id: string; player_id: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PLAYER_STATS, data);
    
    // Clear related caches
    await offlineApiService.clearCache(`player_stats_video_${data.video_id}`);
    await offlineApiService.clearCache(`player_stats_player_${data.player_id}`);
    
    // Clear general stats caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const statsKeys = cachedKeys.filter(key => key.startsWith('player_stats_'));
    for (const key of statsKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Create bulk player stats
   * Note: Clears all stats caches after bulk creation
   */
  async createBulkPlayerStats(stats: any[]): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.PLAYER_STATS}/bulk`, stats);
    
    // Clear all stats-related caches since we don't know which players/videos/teams were affected
    const cachedKeys = await offlineApiService.getCachedKeys();
    const statsKeys = cachedKeys.filter(key => 
      key.startsWith('player_stats_') || 
      key.startsWith('team_totals_')
    );
    for (const key of statsKeys) {
      await offlineApiService.clearCache(key);
    }
  }
}

export default new PlayerStatsService();