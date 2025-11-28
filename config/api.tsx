// File: config/api.ts
import Constants from 'expo-constants';

// ✅ Get configuration from app.config.js extra field
const extra = Constants.expoConfig?.extra || {};

// ✅ API Configuration with environment awareness
export const API_CONFIG = {
  BASE_URL: extra.apiBaseUrl || (__DEV__
    ? 'https://athloscore.someexamplesof.ai/api/v1/public'
    : 'https://api.athloscore.com/api/v1/public'),
  TIMEOUT: 30000,
  SSL_VERIFY: extra.sslVerify ?? !__DEV__, // ✅ Use config flag, fallback to dev mode
  ALLOW_SELF_SIGNED: extra.allowSelfSignedCertificates ?? __DEV__, // ✅ Allow in dev only
  USE_MOCK_DATA: extra.useMockData || false,
  
  // ✅ NEW: Retry Configuration
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 10000, // 10 seconds
    BACKOFF_MULTIPLIER: 2, // Exponential: 1s, 2s, 4s, 8s...
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // HTTP codes that should trigger retry
  },
};

// ✅ API Endpoints
export const API_ENDPOINTS = {
  // Auth Endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ORGS_LIST: '/auth/orgs-list',
  CHECK_ORG_NAME: '/auth/check-org-name',

  // Video Endpoints
  VIDEOS: '/videos',
  VIDEO_BY_ID: (id: string) => `/videos/${id}`,
  VIDEO_UPLOAD_URL: '/videos/get-upload-url',
  VIDEO_STREAM: (id: string) => `/videos/${id}/stream`,
  VIDEO_STATUS: (id: string) => `/videos/${id}/status`,
  VIDEO_UPDATE_STATUS: (id: string) => `/videos/${id}/status`,
  VIDEO_DELETE: (id: string) => `/videos/${id}`,

  // Player Endpoints
  PLAYERS: '/players',
  PLAYER_BY_ID: (id: string) => `/players/${id}`,
  PLAYER_UPDATE: (id: string) => `/players/${id}`,
  PLAYER_DELETE: (id: string) => `/players/${id}`,

  // Player Stats Endpoints
  PLAYER_STATS: '/player-stats',
  PLAYER_STATS_BULK: '/player-stats/bulk',
  PLAYER_STATS_BY_VIDEO: (videoId: string) => `/player-stats/by-video/${videoId}`,
  PLAYER_STATS_BY_PLAYER: (playerId: string) => `/player-stats/by-player/${playerId}`,
  PLAYER_STATS_BY_TEAM: (teamId: string) => `/player-stats/by-team/${teamId}`,
  TEAM_TOTALS: (teamId: string, videoId: string) => `/player-stats/team/${teamId}/totals?video_id=${videoId}`,

  // Team Endpoints
  TEAMS: '/teams',
  TEAM_BY_ID: (id: string) => `/teams/${id}`,
  TEAM_UPDATE: (id: string) => `/teams/${id}`,
  TEAM_DELETE: (id: string) => `/teams/${id}`,

  // Game Endpoints
  GAMES: '/games',
  GAME_BY_ID: (id: string) => `/games/${id}`,
  GAME_UPDATE: (id: string) => `/games/${id}`,
  GAME_DELETE: (id: string) => `/games/${id}`,
  TEAM_SEASON_STATS: (teamId: string) => `/games/team/${teamId}/season-stats`,
};

// ✅ API Configuration Details (for debugging)
export const API_INFO = {
  version: '1.0.0',
  lastUpdated: '2025-10-27',
  documentation: 'https://athloscore.someexamplesof.ai/api/docs',
  supportedFormats: {
    video: ['.mp4', '.mov', '.avi', '.mkv'],
    image: ['.jpg', '.jpeg', '.png'],
  },
  limits: {
    maxVideoSize: 500 * 1024 * 1024, // 500MB
    maxImageSize: 10 * 1024 * 1024,  // 10MB
    pageSize: 50,
    maxPageSize: 100,
  },
};

// ✅ Helper function to build full URL
export const buildApiUrl = (endpoint: string | ((arg: string) => string), param?: string): string => {
  const path = typeof endpoint === 'function' && param ? endpoint(param) : endpoint;
  return `${API_CONFIG.BASE_URL}${path}`;
};

// ✅ Helper function to check if API is configured
export const isApiConfigured = (): boolean => {
  return !!API_CONFIG.BASE_URL && API_CONFIG.BASE_URL.length > 0;
};

// ✅ NEW: Sleep/delay utility for retry logic
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ✅ NEW: Calculate retry delay with exponential backoff
export const calculateRetryDelay = (attemptNumber: number): number => {
  const { INITIAL_DELAY, MAX_DELAY, BACKOFF_MULTIPLIER } = API_CONFIG.RETRY;
  const delay = INITIAL_DELAY * Math.pow(BACKOFF_MULTIPLIER, attemptNumber - 1);
  return Math.min(delay, MAX_DELAY);
};

// ✅ NEW: Check if error is retryable
export const isRetryableError = (error: any): boolean => {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }

  // Check HTTP status codes
  const status = error.response?.status;
  return API_CONFIG.RETRY.RETRY_STATUS_CODES.includes(status);
};

// ✅ NEW: Retry wrapper for API calls
export interface RetryOptions {
  maxRetries?: number;
  onRetry?: (attemptNumber: number, error: any) => void;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = API_CONFIG.RETRY.MAX_RETRIES,
    onRetry,
    shouldRetry = isRetryableError,
  } = options;

  let lastError: any;
  let attemptNumber = 0;

  while (attemptNumber <= maxRetries) {
    try {
      // If this is a retry, wait before attempting
      if (attemptNumber > 0) {
        const delay = calculateRetryDelay(attemptNumber);
        if (__DEV__) console.log(`🔄 Retry ${attemptNumber}/${maxRetries} after ${delay}ms`);
        await sleep(delay);
      }

      // Attempt the API call
      const result = await apiCall();

      // Success! Return the result
      if (attemptNumber > 0 && __DEV__) {
        console.log(`✅ Succeeded on retry ${attemptNumber}`);
      }

      return result;

    } catch (error) {
      lastError = error;
      attemptNumber++;

      // Check if we should retry
      const shouldRetryThisError = shouldRetry(error);
      const hasMoreRetries = attemptNumber <= maxRetries;

      if (__DEV__ && !shouldRetryThisError) {
        console.log(`❌ Failed (non-retryable): ${error.message || 'Unknown error'}`);
      }

      // If we shouldn't retry or have no more retries, throw the error
      if (!shouldRetryThisError || !hasMoreRetries) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attemptNumber, error);
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

// ✅ NEW: Network status helper
export interface NetworkStatus {
  isConnected: boolean;
  type?: string;
}

// ✅ NEW: Create retry-aware fetch wrapper
export const createRetryFetch = (fetchFn: typeof fetch) => {
  return async (url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<Response> => {
    return withRetry(
      () => fetchFn(url, options),
      retryOptions
    );
  };
};

// ✅ NEW: Error classes for better error handling
export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends Error {
  public readonly lastError: any;
  public readonly attempts: number;

  constructor(lastError: any, attempts: number) {
    super(`Request failed after ${attempts} attempts: ${lastError.message || 'Unknown error'}`);
    this.name = 'RetryExhaustedError';
    this.lastError = lastError;
    this.attempts = attempts;
  }
}

// ✅ Development mode logging
if (__DEV__) {
  console.log('🔧 API Config:', API_CONFIG.BASE_URL, '| SSL:', API_CONFIG.SSL_VERIFY ? 'ON' : 'OFF');
}

// ✅ Type definitions for better TypeScript support
export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// ✅ Query parameter helpers
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface VideoQueryParams extends PaginationParams {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  title?: string;
  org_id?: string;
}

export interface PlayerQueryParams extends PaginationParams {
  video_id?: string;
  team_id?: string;
  name?: string;
  player_number?: string;
  stats?: boolean;
}

export interface TeamQueryParams extends PaginationParams {
  video_id?: string;
  name?: string;
}

export interface PlayerStatsQueryParams extends PaginationParams {
  video_id?: string;
  player_id?: string;
  team_id?: string;
  min_points?: number;
  max_points?: number;
  min_assists?: number;
  min_possessions?: number;
}

// ✅ Helper to build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
};

// ✅ Helper to build full URL with query params
export const buildFullUrl = (
  endpoint: string | ((arg: string) => string),
  param?: string,
  queryParams?: Record<string, any>
): string => {
  const baseUrl = buildApiUrl(endpoint, param);
  const queryString = queryParams ? buildQueryString(queryParams) : '';
  return `${baseUrl}${queryString}`;
};

// ✅ Export default configuration
export default {
  config: API_CONFIG,
  endpoints: API_ENDPOINTS,
  info: API_INFO,
  helpers: {
    buildApiUrl,
    buildQueryString,
    buildFullUrl,
    isApiConfigured,
    withRetry,
    calculateRetryDelay,
    isRetryableError,
    createRetryFetch,
  },
  errors: {
    NetworkError,
    TimeoutError,
    RetryExhaustedError,
  },
};