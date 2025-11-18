// File: services/api/teamService.ts
import apiClient from './client';
import { API_ENDPOINTS, withRetry } from '@/config/api';
import offlineApiService from './offlineApiService';

export interface Team {
  team_id: string;
  video_id: string;
  model_team_identifier: string;
  name?: string;
  created_at: string;
  updated_at?: string;
}

class TeamService {
  /**
   * Get teams with offline support and retry
   */
  async getTeams(filters?: {
    video_id?: string;
    name?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ teams: Team[]; pagination: any }> {
    const cacheKey = `teams_${filters?.video_id || 'all'}_${filters?.page || 1}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.TEAMS, { params: filters });
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 2 * 60 * 60 * 1000 // 2 hours cache
      }
    );
  }

  /**
   * Get team by ID with offline support and retry
   */
  async getTeamById(teamId: string): Promise<Team> {
    const cacheKey = `team_${teamId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.TEAM_BY_ID(teamId));
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Create team with retry
   * Note: Clears relevant caches after creation
   */
  async createTeam(data: {
    team_id: string;
    video_id: string;
    model_team_identifier: string;
    name?: string;
  }): Promise<void> {
    await withRetry(async () => {
      await apiClient.post(API_ENDPOINTS.TEAMS, data);
    });
    
    // Clear relevant caches
    await offlineApiService.clearCache(`teams_${data.video_id}_1`);
    await offlineApiService.clearCache(`teams_all_1`);
  }

  /**
   * Update team with retry
   * Note: Clears relevant caches after update
   */
  async updateTeam(teamId: string, data: { name?: string }): Promise<void> {
    await withRetry(async () => {
      await apiClient.put(API_ENDPOINTS.TEAM_BY_ID(teamId), data);
    });
    
    // Clear team-specific cache
    await offlineApiService.clearCache(`team_${teamId}`);
    
    // Clear all teams list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const teamListKeys = cachedKeys.filter(key => key.startsWith('teams_'));
    for (const key of teamListKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Delete team with retry
   * Note: Clears relevant caches after deletion
   */
  async deleteTeam(teamId: string): Promise<void> {
    await withRetry(async () => {
      await apiClient.delete(API_ENDPOINTS.TEAM_BY_ID(teamId));
    });
    
    // Clear team-specific cache
    await offlineApiService.clearCache(`team_${teamId}`);
    
    // Clear all teams list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const teamListKeys = cachedKeys.filter(key => key.startsWith('teams_'));
    for (const key of teamListKeys) {
      await offlineApiService.clearCache(key);
    }
  }
}

export default new TeamService();