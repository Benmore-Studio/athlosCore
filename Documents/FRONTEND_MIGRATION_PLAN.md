# Frontend Migration Plan: Backend Integration

**Project**: AthlosCore Mobile Application
**Date**: 2025-10-27
**Status**: Planning Phase

## Executive Summary

This document outlines the migration plan to integrate the AthlosCore React Native frontend with the production backend API. The migration will replace mock data services with real API calls while maintaining the existing UI/UX and component architecture.

**Migration Approach**: Incremental, feature-by-feature migration with parallel mock/API support during development.

---

## Current Architecture

### File Structure
```
athlosCore/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Dashboard (uses mockData)
│   │   ├── teams.tsx            # Team selection (uses mockData)
│   │   ├── games.tsx            # Recent games (uses mockData)
│   │   ├── videos.tsx           # Video list
│   │   └── explore.tsx          # Analytics
│   ├── video/
│   │   ├── [id].tsx             # Video player
│   │   └── upload.tsx           # Video upload
│   └── welcome.tsx              # Onboarding
├── services/
│   └── videoService.ts          # Mock video service
├── data/
│   ├── mockData.ts              # Mock teams, players, games
│   └── mockVideos.ts            # Mock video data
├── components/
│   └── ui/                      # Reusable UI components
└── constants/
    └── theme.ts                 # Design tokens
```

### Current Mock Data Usage
- **Dashboard** (`app/(tabs)/index.tsx`): `mockCoach`, `mockGames`, `mockTeams`
- **Teams Screen** (`app/(tabs)/teams.tsx`): `mockTeams`
- **Games Screen** (`app/(tabs)/games.tsx`): `mockGames`
- **Video Service** (`services/videoService.ts`): `mockVideos`

---

## Migration Architecture

### Phase-Based Approach

**Phase 1**: Authentication & Infrastructure (Week 1)
**Phase 2**: Video Management (Week 2)
**Phase 3**: Teams & Players (Week 3)
**Phase 4**: Analytics & Stats (Week 4)
**Phase 5**: Testing & Optimization (Week 5)

---

## Phase 1: Authentication & Infrastructure

### 1.1 Create API Configuration

**File**: `config/api.ts`
```typescript
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
```

**Dependencies to Install**:
```bash
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-dotenv
```

---

### 1.2 Create HTTP Client

**File**: `services/api/client.ts`
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Disable SSL verification in development
    if (!API_CONFIG.SSL_VERIFY) {
      // Note: React Native doesn't support this directly
      // You may need to use a custom SSL handler or accept self-signed certs
      console.warn('SSL verification disabled for development');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
      // You can dispatch a logout action here if using state management
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 1.3 Create Authentication Service

**File**: `services/api/authService.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  org_name?: string;
  org_ids?: string[];
}

export interface Organization {
  org_id: string;
  name: string;
  created_at: string;
  last_updated_at: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    const { token } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    return token;
  }

  async register(data: RegisterData): Promise<{ user_id: string; email: string; organizations: string[] }> {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get(API_ENDPOINTS.ORGS_LIST);
    return response.data;
  }

  async checkOrgName(name: string): Promise<{ exists: boolean; organization?: Organization }> {
    const response = await apiClient.get(`${API_ENDPOINTS.CHECK_ORG_NAME}?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();
```

---

### 1.4 Create Authentication Context

**File**: `contexts/AuthContext.tsx`
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/api/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const register = async (data: any) => {
    await authService.register(data);
    // Auto-login after registration can be implemented here
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### 1.5 Update Root Layout

**File**: `app/_layout.tsx` (modify existing)
```typescript
import { AuthProvider } from '@/contexts/AuthContext';

// Wrap the existing layout with AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Existing ThemeProvider and Stack components */}
    </AuthProvider>
  );
}
```

---

### 1.6 Create Login/Register Screens

**Files to Create**:
- `app/auth/login.tsx`
- `app/auth/register.tsx`
- `app/auth/org-selection.tsx`

**Example**: `app/auth/login.tsx`
```typescript
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
```

---

## Phase 2: Video Management

### 2.1 Create Video Service

**File**: `services/api/videoService.ts`
```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export interface Video {
  video_id: string;
  title?: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  file_size?: number;
  gcsPath: string;
  org_id: string;
  created_at: string;
  updated_at?: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  video_id: string;
  expires_at: string;
}

export interface VideoMetadata {
  video_id: string;
  file_name: string;
  gcsPath: string;
  org_id: string;
  title?: string;
  description?: string;
  duration?: number;
  file_size?: number;
  file_type?: '.mp4' | '.mov' | '.avi' | '.mkv';
}

class VideoService {
  async getVideos(filters?: {
    status?: string;
    title?: string;
    org_id?: string;
  }): Promise<Video[]> {
    const response = await apiClient.get(API_ENDPOINTS.VIDEOS, { params: filters });
    return response.data;
  }

  async getVideoById(videoId: string): Promise<Video> {
    const response = await apiClient.get(API_ENDPOINTS.VIDEO_BY_ID(videoId));
    return response.data;
  }

  async getUploadUrl(fileName: string): Promise<UploadUrlResponse> {
    const response = await apiClient.post(API_ENDPOINTS.VIDEO_UPLOAD_URL, { file_name: fileName });
    return response.data;
  }

  async saveVideoMetadata(metadata: VideoMetadata): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIDEOS, metadata);
  }

  async getStreamingUrl(videoId: string): Promise<{ stream_url: string; expires_at: string }> {
    const response = await apiClient.get(API_ENDPOINTS.VIDEO_STREAM(videoId));
    return response.data;
  }

  async getVideoStatus(videoId: string): Promise<{
    video_id: string;
    status: string;
    progress_percentage?: number;
    estimated_completion?: string;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.VIDEO_STATUS(videoId));
    return response.data;
  }

  async updateVideoStatus(videoId: string, status: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.VIDEO_STATUS(videoId), { status });
  }

  async deleteVideo(videoId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VIDEO_BY_ID(videoId));
  }

  // Upload video directly to GCS
  async uploadToGCS(signedUrl: string, fileUri: string): Promise<void> {
    // Use React Native fetch or axios to upload
    const response = await fetch(fileUri);
    const blob = await response.blob();

    await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'video/mp4', // Adjust based on file type
      },
    });
  }
}

export default new VideoService();
```

---

### 2.2 Migrate Video Upload Screen

**File**: `app/video/upload.tsx` (modify existing)
```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import videoService from '@/services/api/videoService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VideoUploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoUpload = async (fileUri: string, fileName: string) => {
    setUploading(true);
    try {
      // Step 1: Get signed upload URL
      const { upload_url, video_id } = await videoService.getUploadUrl(fileName);

      // Step 2: Upload to GCS
      await videoService.uploadToGCS(upload_url, fileUri);

      // Step 3: Save metadata
      const orgId = await AsyncStorage.getItem('current_org_id'); // Assumes org is stored
      await videoService.saveVideoMetadata({
        video_id,
        file_name: fileName,
        gcsPath: upload_url.split('?')[0], // Extract GCS path without query params
        org_id: orgId!,
        title: 'Game Film', // Can be customized
      });

      Alert.alert('Success', 'Video uploaded successfully. Processing will begin shortly.');
      router.back();
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload video. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Rest of the component...
}
```

---

### 2.3 Migrate Video Player Screen

**File**: `app/video/[id].tsx` (modify existing)
```typescript
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import videoService from '@/services/api/videoService';
import { ActivityIndicator, View } from 'react-native';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoStream();
  }, [id]);

  const loadVideoStream = async () => {
    try {
      const { stream_url } = await videoService.getStreamingUrl(id);
      setStreamUrl(stream_url);
    } catch (error) {
      console.error('Failed to load video stream:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View><ActivityIndicator /></View>;
  }

  return (
    <View>
      {/* Use streamUrl with Video component */}
      {/* <Video source={{ uri: streamUrl }} /> */}
    </View>
  );
}
```

---

## Phase 3: Teams & Players

### 3.1 Create Team Service

**File**: `services/api/teamService.ts`
```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export interface Team {
  team_id: string;
  video_id: string;
  model_team_identifier: string;
  name?: string;
  created_at: string;
  updated_at?: string;
}

class TeamService {
  async getTeams(filters?: {
    video_id?: string;
    name?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ teams: Team[]; pagination: any }> {
    const response = await apiClient.get(API_ENDPOINTS.TEAMS, { params: filters });
    return response.data;
  }

  async getTeamById(teamId: string): Promise<Team> {
    const response = await apiClient.get(API_ENDPOINTS.TEAM_BY_ID(teamId));
    return response.data;
  }

  async createTeam(data: {
    team_id: string;
    video_id: string;
    model_team_identifier: string;
    name?: string;
  }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.TEAMS, data);
  }

  async updateTeam(teamId: string, data: { name?: string }): Promise<void> {
    await apiClient.put(API_ENDPOINTS.TEAM_BY_ID(teamId), data);
  }

  async deleteTeam(teamId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TEAM_BY_ID(teamId));
  }
}

export default new TeamService();
```

---

### 3.2 Create Player Service

**File**: `services/api/playerService.ts`
```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

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
  async getPlayers(filters?: {
    video_id?: string;
    team_id?: string;
    name?: string;
    player_number?: string;
    stats?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ players: Player[]; pagination: any }> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYERS, { params: filters });
    return response.data;
  }

  async getPlayerById(playerId: string, includeStats = false): Promise<Player> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYER_BY_ID(playerId), {
      params: { stats: includeStats },
    });
    return response.data;
  }

  async createPlayer(data: {
    player_id: string;
    team_id: string;
    video_id: string;
    model_player_identifier: string;
    name?: string;
    player_number?: number;
  }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PLAYERS, data);
  }

  async updatePlayer(playerId: string, data: { name?: string; player_number?: number }): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PLAYER_BY_ID(playerId), data);
  }

  async deletePlayer(playerId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PLAYER_BY_ID(playerId));
  }
}

export default new PlayerService();
```

---

### 3.3 Migrate Teams Screen

**File**: `app/(tabs)/teams.tsx` (modify existing)
```typescript
import React, { useEffect, useState } from 'react';
import teamService, { Team } from '@/services/api/teamService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const orgId = await AsyncStorage.getItem('current_org_id');
      // Note: API doesn't have org_id filter on teams endpoint
      // You may need to filter client-side or request backend enhancement
      const { teams: fetchedTeams } = await teamService.getTeams();
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component...
}
```

---

## Phase 4: Analytics & Stats

### 4.1 Create Player Stats Service

**File**: `services/api/playerStatsService.ts`
```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { PlayerStats } from './playerService';

class PlayerStatsService {
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
    const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS, { params: filters });
    return response.data;
  }

  async getPlayerStatsByVideo(videoId: string): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_VIDEO(videoId));
    return response.data;
  }

  async getPlayerStatsByPlayer(playerId: string): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_PLAYER(playerId));
    return response.data;
  }

  async getPlayerStatsByTeam(teamId: string): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYER_STATS_BY_TEAM(teamId));
    return response.data;
  }

  async getTeamTotals(teamId: string, videoId: string): Promise<any> {
    const response = await apiClient.get(`${API_ENDPOINTS.TEAM_TOTALS(teamId)}?video_id=${videoId}`);
    return response.data;
  }

  async createPlayerStat(data: PlayerStats & { video_id: string; player_id: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PLAYER_STATS, data);
  }

  async createBulkPlayerStats(stats: any[]): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.PLAYER_STATS}/bulk`, stats);
  }
}

export default new PlayerStatsService();
```

---

### 4.2 Migrate Analytics Screen

**File**: `app/(tabs)/explore.tsx` (modify existing)
```typescript
import React, { useEffect, useState } from 'react';
import playerStatsService from '@/services/api/playerStatsService';

export default function AnalyticsScreen() {
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Assuming you have teamId and videoId available
      const teamId = 'team-123'; // Get from context or props
      const videoId = 'video-789'; // Get from context or props

      const totals = await playerStatsService.getTeamTotals(teamId, videoId);
      setTeamStats(totals);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component...
}
```

---

## Phase 5: Data Transformation Layer

### 5.1 Create Data Mappers

**Purpose**: Map API responses to existing mock data structures to minimize UI changes.

**File**: `services/api/mappers/videoMapper.ts`
```typescript
import { Video as APIVideo } from '@/services/api/videoService';
import { Video as MockVideo } from '@/data/mockVideos';

export function mapAPIVideoToMock(apiVideo: APIVideo): MockVideo {
  return {
    id: apiVideo.video_id,
    title: apiVideo.title || 'Untitled Video',
    thumbnail: '', // Can be generated or provided by API
    duration: apiVideo.duration || 0,
    uploadDate: apiVideo.created_at,
    status: apiVideo.status,
    teams: [], // Fetch separately if needed
  };
}

export function mapAPIVideosToMock(apiVideos: APIVideo[]): MockVideo[] {
  return apiVideos.map(mapAPIVideoToMock);
}
```

**File**: `services/api/mappers/playerMapper.ts`
```typescript
import { Player as APIPlayer, PlayerStats as APIStats } from '@/services/api/playerService';
import { Player as MockPlayer } from '@/data/mockData';

export function mapAPIPlayerToMock(apiPlayer: APIPlayer): MockPlayer {
  const stats = apiPlayer.stats;

  return {
    id: apiPlayer.player_id,
    name: apiPlayer.name || 'Unknown Player',
    jerseyNumber: apiPlayer.player_number || 0,
    position: 'PG', // API doesn't provide position, may need to add this field
    stats: {
      points: (stats?.two_point_made || 0) * 2 + (stats?.three_point_made || 0) * 3 + (stats?.free_throw_made || 0),
      rebounds: (stats?.offensive_rebounds || 0) + (stats?.defensive_rebounds || 0),
      assists: stats?.assists || 0,
      fieldGoalPercentage: calculateFGPercentage(stats),
      freeThrowPercentage: calculateFTPercentage(stats),
      turnovers: stats?.turnovers || 0,
      minutesPlayed: 0, // API doesn't provide this
    },
  };
}

function calculateFGPercentage(stats?: APIStats): number {
  if (!stats) return 0;
  const attempts = stats.two_point_att + stats.three_point_att;
  const made = stats.two_point_made + stats.three_point_made;
  return attempts > 0 ? (made / attempts) * 100 : 0;
}

function calculateFTPercentage(stats?: APIStats): number {
  if (!stats) return 0;
  return stats.free_throw_att > 0 ? (stats.free_throw_made / stats.free_throw_att) * 100 : 0;
}
```

---

## Environment Configuration

### Create `.env` file
```env
# API Configuration
API_BASE_URL=https://athloscore.someexamplesof.ai/api/v1/public
API_TIMEOUT=30000

# Feature Flags
USE_MOCK_DATA=false
ENABLE_SSL_VERIFICATION=false

# Debug
DEBUG_API_CALLS=true
```

### Update `app.json`
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": process.env.API_BASE_URL,
      "useMockData": process.env.USE_MOCK_DATA === "true"
    }
  }
}
```

---

## Testing Strategy

### Unit Tests
- Test API services with mocked axios responses
- Test data mappers for correct transformations
- Test authentication flow

### Integration Tests
- Test full user flows (login → upload → view analytics)
- Test error handling and retry logic
- Test offline behavior

### E2E Tests (Detox or Maestro)
- Test complete user journeys
- Test video upload and playback
- Test analytics viewing

---

## Error Handling Strategy

### Global Error Handler

**File**: `services/api/errorHandler.ts`
```typescript
import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export function handleAPIError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    switch (status) {
      case 400:
        Alert.alert('Invalid Request', message);
        break;
      case 401:
        Alert.alert('Authentication Error', 'Please log in again');
        break;
      case 404:
        Alert.alert('Not Found', message);
        break;
      case 500:
        Alert.alert('Server Error', 'Please try again later');
        break;
      default:
        Alert.alert('Error', message);
    }
  } else {
    Alert.alert('Error', 'An unexpected error occurred');
  }
}
```

---

## Performance Optimization

### Caching Strategy
- Use React Query or SWR for data fetching and caching
- Cache video streaming URLs
- Cache player and team data with invalidation

### Pagination
- Implement infinite scroll for video lists
- Use pagination for player and team lists

### Offline Support
- Store essential data in AsyncStorage
- Queue video uploads for retry on connection restore
- Display cached data when offline

---

## Security Considerations

### Token Management
- Store tokens in React Native Secure Storage (not AsyncStorage for production)
- Implement token refresh mechanism
- Clear tokens on logout

### SSL Pinning (Production)
- Implement SSL pinning for production builds
- Use libraries like `react-native-ssl-pinning`

### Data Encryption
- Encrypt sensitive data at rest
- Use HTTPS for all API calls

---

## Migration Checklist

### Phase 1: Infrastructure ✅
- [ ] Install dependencies (axios, async-storage)
- [ ] Create API configuration
- [ ] Create HTTP client with interceptors
- [ ] Create authentication service
- [ ] Create authentication context
- [ ] Build login/register screens
- [ ] Test authentication flow

### Phase 2: Videos ✅
- [ ] Create video service
- [ ] Update video upload screen
- [ ] Update video player screen
- [ ] Test video upload flow
- [ ] Test video streaming

### Phase 3: Teams & Players ✅
- [ ] Create team service
- [ ] Create player service
- [ ] Migrate teams screen
- [ ] Migrate player lists
- [ ] Test team and player data fetching

### Phase 4: Analytics ✅
- [ ] Create player stats service
- [ ] Migrate analytics screen
- [ ] Add data visualization
- [ ] Test analytics calculations

### Phase 5: Polish ✅
- [ ] Create data mappers
- [ ] Add error handling
- [ ] Implement caching
- [ ] Add loading states
- [ ] Test offline behavior
- [ ] Performance optimization
- [ ] Security audit

---

## Rollback Plan

### Feature Flags
Use environment variable `USE_MOCK_DATA` to toggle between mock and API data:

```typescript
// Example in service
export async function getVideos() {
  if (process.env.USE_MOCK_DATA === 'true') {
    return mockVideos;
  }
  return videoService.getVideos();
}
```

### Gradual Rollout
1. Enable API for internal testing only
2. Enable for beta testers
3. Enable for 10% of users
4. Enable for 50% of users
5. Enable for all users

---

## Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: Infrastructure | Auth, API setup | 1 week |
| Phase 2: Videos | Video upload & playback | 1 week |
| Phase 3: Teams & Players | Data fetching | 1 week |
| Phase 4: Analytics | Stats integration | 1 week |
| Phase 5: Testing & Polish | QA, optimization | 1 week |
| **Total** | | **5 weeks** |

---

## Success Criteria

### Functional Requirements
- [ ] Users can register and login
- [ ] Users can upload videos
- [ ] Videos process successfully
- [ ] Users can view player stats
- [ ] Users can view team analytics
- [ ] All data persists across sessions

### Non-Functional Requirements
- [ ] API calls complete within 3 seconds
- [ ] App remains responsive during uploads
- [ ] Error messages are user-friendly
- [ ] Offline mode works for cached data
- [ ] No data loss during network interruptions

---

## Known Issues & Mitigations

### Issue 1: API Registration Returns 500
**Status**: Identified during testing
**Impact**: Users cannot register new accounts
**Mitigation**: Report to backend team, use existing test accounts for development
**Tracking**: API_CONTRACT.md

### Issue 2: Self-Signed SSL Certificates
**Status**: Development environment only
**Impact**: Requires SSL verification bypass
**Mitigation**: Production will use valid certificates
**Tracking**: Handled in API client configuration

### Issue 3: API Lacks Organization Context
**Status**: Teams endpoint doesn't filter by organization
**Impact**: Users may see teams from other organizations
**Mitigation**: Client-side filtering or backend enhancement request
**Tracking**: Needs discussion with backend team

---

## Post-Migration Tasks

### Documentation
- [ ] Update README with API setup instructions
- [ ] Document environment variables
- [ ] Create API troubleshooting guide
- [ ] Update deployment documentation

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Firebase Analytics)
- [ ] Set up performance monitoring
- [ ] Create dashboard for API health

### Optimization
- [ ] Implement React Query for caching
- [ ] Add optimistic UI updates
- [ ] Implement background sync
- [ ] Add push notifications for processing complete

---

## Resources

### API Documentation
- [API Contract](./API_CONTRACT.md)
- Backend Swagger: https://athloscore.someexamplesof.ai/api/v1/public/docs/

### Libraries
- Axios: https://axios-http.com/
- React Query: https://tanstack.com/query/latest
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/

### Testing Tools
- Detox: https://wix.github.io/Detox/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/

---

## Contact & Support

**Technical Lead**: Jacob Haqq
**Backend API Questions**: [Backend team contact]
**Migration Questions**: Reference this document or API_CONTRACT.md

---

## Appendix

### Sample API Calls (cURL)

**Login**:
```bash
curl -k -X POST 'https://athloscore.someexamplesof.ai/api/v1/public/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get Videos** (requires token):
```bash
curl -k -X GET 'https://athloscore.someexamplesof.ai/api/v1/public/videos' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Get Organizations**:
```bash
curl -k -X GET 'https://athloscore.someexamplesof.ai/api/v1/public/auth/orgs-list'
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | Jacob Haqq | Initial migration plan created |

---

**End of Migration Plan**
