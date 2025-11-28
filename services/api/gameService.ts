// File: services/api/gameService.ts
import apiClient from './client';
import { API_ENDPOINTS, withRetry } from '@/config/api';
import offlineApiService from './offlineApiService';

export interface Game {
  game_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  game_date: string;
  status: 'completed' | 'upcoming' | 'in_progress' | 'cancelled';
  video_id?: string;
  thumbnail_url?: string;
  venue?: string;
  notes?: string;
  org_id: string;
  created_at: string;
  updated_at?: string;
}

export interface GameWithDetails extends Game {
  home_team?: any; // Team details
  away_team?: any; // Team details
  video?: any; // Video details
  box_score?: any; // Box score stats
  highlights?: any[]; // Game highlights
}

export interface CreateGameData {
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  org_id: string;
  home_score?: number;
  away_score?: number;
  status?: 'upcoming' | 'in_progress' | 'completed';
  video_id?: string;
  venue?: string;
  notes?: string;
}

export interface UpdateGameData {
  home_score?: number;
  away_score?: number;
  status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  video_id?: string;
  venue?: string;
  notes?: string;
}

class GameService {
  /**
   * Get games with offline support and retry
   */
  async getGames(filters?: {
    status?: string;
    team_id?: string;
    org_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Game[]> {
    const cacheKey = `games_${filters?.org_id || 'all'}_${filters?.status || 'all'}_${filters?.team_id || 'all'}`;

    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.GAMES, { params: filters });
          return response.data;
        });
      },
      {
        key: cacheKey,
        expiryMs: 15 * 60 * 1000 // 15 minutes cache
      }
    );
  }

  /**
   * Get game by ID with offline support and retry
   */
  async getGameById(gameId: string): Promise<GameWithDetails> {
    const cacheKey = `game_${gameId}`;

    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.GAME_BY_ID(gameId));
          return response.data;
        });
      },
      {
        key: cacheKey,
        expiryMs: 10 * 60 * 1000 // 10 minutes cache
      }
    );
  }

  /**
   * Get recent games for a team
   */
  async getRecentGames(teamId: string, limit: number = 10): Promise<Game[]> {
    const cacheKey = `recent_games_${teamId}_${limit}`;

    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.GAMES, {
            params: {
              team_id: teamId,
              status: 'completed',
              page_size: limit,
              sort: 'game_date:desc'
            }
          });
          return response.data;
        });
      },
      {
        key: cacheKey,
        expiryMs: 10 * 60 * 1000 // 10 minutes cache
      }
    );
  }

  /**
   * Create a new game
   */
  async createGame(gameData: CreateGameData): Promise<Game> {
    const game = await withRetry(async () => {
      const response = await apiClient.post(API_ENDPOINTS.GAMES, gameData);
      return response.data;
    });

    // Clear games caches
    await offlineApiService.clearCache(`games_${gameData.org_id}_all_all`);
    await offlineApiService.clearCache(`games_all_all_all`);

    return game;
  }

  /**
   * Update game details
   */
  async updateGame(gameId: string, gameData: UpdateGameData): Promise<Game> {
    const game = await withRetry(async () => {
      const response = await apiClient.put(API_ENDPOINTS.GAME_UPDATE(gameId), gameData);
      return response.data;
    });

    // Clear related caches
    await offlineApiService.clearCache(`game_${gameId}`);

    // Clear all games list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const gamesListKeys = cachedKeys.filter(key => key.startsWith('games_'));
    for (const key of gamesListKeys) {
      await offlineApiService.clearCache(key);
    }

    return game;
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<void> {
    await withRetry(async () => {
      await apiClient.delete(API_ENDPOINTS.GAME_DELETE(gameId));
    });

    // Clear game-specific cache
    await offlineApiService.clearCache(`game_${gameId}`);

    // Clear all games list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const gamesListKeys = cachedKeys.filter(key => key.startsWith('games_'));
    for (const key of gamesListKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Get games by date range
   */
  async getGamesByDateRange(startDate: string, endDate: string, orgId?: string): Promise<Game[]> {
    return withRetry(async () => {
      const response = await apiClient.get(API_ENDPOINTS.GAMES, {
        params: {
          start_date: startDate,
          end_date: endDate,
          org_id: orgId,
        }
      });
      return response.data;
    });
  }

  /**
   * Get team's season stats from games
   */
  async getTeamSeasonStats(teamId: string, season?: string): Promise<any> {
    const cacheKey = `team_season_stats_${teamId}_${season || 'current'}`;

    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.TEAM_SEASON_STATS(teamId), {
            params: season ? { season } : undefined
          });
          return response.data;
        });
      },
      {
        key: cacheKey,
        expiryMs: 30 * 60 * 1000 // 30 minutes cache
      }
    );
  }
}

export default new GameService();
