// API Configuration
export const API_CONFIG = {
    BASE_URL: __DEV__
      ? 'https://athloscore.someexamplesof.ai/api/v1/public'
      : 'https://api.athloscore.com/api/v1/public',
    TIMEOUT: 30000,
    SSL_VERIFY: !__DEV__, // Disable SSL verification in development
  };
  
  export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ORGS_LIST: '/auth/orgs-list',
    CHECK_ORG_NAME: '/auth/check-org-name',
  
    // Videos
    VIDEOS: '/videos',
    VIDEO_BY_ID: (id: string) => `/videos/${id}`,
    VIDEO_UPLOAD_URL: '/videos/get-upload-url',
    VIDEO_STREAM: (id: string) => `/videos/${id}/stream`,
    VIDEO_STATUS: (id: string) => `/videos/${id}/status`,
  
    // Players
    PLAYERS: '/players',
    PLAYER_BY_ID: (id: string) => `/players/${id}`,
  
    // Player Stats
    PLAYER_STATS: '/player-stats',
    PLAYER_STATS_BY_VIDEO: (videoId: string) => `/player-stats/by-video/${videoId}`,
    PLAYER_STATS_BY_PLAYER: (playerId: string) => `/player-stats/by-player/${playerId}`,
    PLAYER_STATS_BY_TEAM: (teamId: string) => `/player-stats/by-team/${teamId}`,
    TEAM_TOTALS: (teamId: string) => `/player-stats/team/${teamId}/totals`,
  
    // Teams
    TEAMS: '/teams',
    TEAM_BY_ID: (id: string) => `/teams/${id}`,
  };