# AthlosCore API Integration - Developer Handoff

**Date**: 2025-12-08
**Status**: Teams Tab Complete, 6 Screens Remaining
**Estimated Time**: 4-6 hours for complete integration
**Priority**: HIGH - Required for production deployment

---

## Executive Summary

The frontend application has been built with mock data and needs full API integration. The backend API contract is defined in `Documents/API_CONTRACT.md`. Of 34 API endpoints, only 5 are currently working (see `Documents/API_STATUS_REPORT.md`), but we need the frontend ready so it "just works" when backend fixes their endpoints.

**✅ COMPLETED**: Teams tab (`app/(tabs)/teams.tsx`) - Use as reference implementation
**❌ REMAINING**: 6 major screens need API integration

---

## 🏗️ Infrastructure Already in Place

**Good News**: Most of the heavy lifting is done! You don't need to create API infrastructure from scratch.

### API Client Configuration
✅ **Location**: `services/api/client.ts`
- Axios client with 30s timeout
- Auto-attached Bearer token from AsyncStorage
- SSL error detection and user-friendly messages
- 401 auto-logout and token removal
- Development mode request/response logging
- Pre-configured error messages via `err.userMessage`

### API Configuration
✅ **Location**: `config/api.tsx`
- All endpoint definitions (API_ENDPOINTS)
- Retry logic with exponential backoff (3 retries: 1s→2s→4s)
- Query parameter builders (`buildQueryString`, `buildFullUrl`)
- TypeScript types for all requests (PaginationParams, VideoQueryParams, etc.)
- Environment-aware (dev vs production URLs)
- Error classes (NetworkError, TimeoutError, RetryExhaustedError)

### Environment Variables
✅ **Location**: `.env`
```bash
API_BASE_URL=https://athloscore.someexamplesof.ai/api/v1/public
API_TIMEOUT=30000
USE_MOCK_DATA=false
DEBUG_API_CALLS=true
```

### What You DON'T Need to Do
- ❌ Create Axios client (already exists)
- ❌ Add retry logic (built-in with `withRetry`)
- ❌ Handle 401 errors (auto-logout already configured)
- ❌ Add dev logging (already comprehensive)
- ❌ Create TypeScript types for queries (already defined)
- ❌ Build query string helpers (already available)

**Your Job**: Just call the API services, transform the data, and handle the three scenarios (success/empty/error).

---

## 🎯 Core Integration Pattern (Established in Teams Tab)

### 1. Remove Mock Data Imports
```typescript
// ❌ WRONG
import { mockTeams, mockPlayers } from '@/data/mockData';

// ✅ CORRECT
import type { Team as UITeam, Player as UIPlayer } from '@/data/mockData';
// Only import types, not data
```

### 2. Use API Services
```typescript
import teamService from '@/services/api/teamService';
import playerService from '@/services/api/playerService';

// Call API, handle errors, NO mock fallback
const loadData = async () => {
  try {
    const response = await teamService.getTeams();
    const uiData = response.teams.map(mapAPIToUI);
    setData(uiData);
  } catch (err: any) {
    console.error('❌ API Error:', err);
    Sentry.captureException(err);
    Alert.alert('Error', 'Failed to load data. Please check connection.');
    setData([]); // Empty state, NOT mock data
  }
};
```

### 3. Create Data Mappers
API schemas don't match UI schemas. Transform them:

```typescript
// Example from teams.tsx
const mapAPITeamToUITeam = (apiTeam: APITeam): UITeam => ({
  id: apiTeam.team_id,
  name: apiTeam.name || 'Unnamed Team',
  level: 'Basketball Team',
  record: { wins: 0, losses: 0 },
  players: [],
  stats: { /* defaults */ },
});
```

### 4. Handle Empty States (Not Errors)
```typescript
// Empty array from API is valid
if (response.teams.length === 0) {
  setTeams([]);
  console.log('📭 No teams found');
  // UI will show empty state component
}
```

### 5. Proper Error UI
```typescript
// Show errors to users, never silently use mock data
catch (err: any) {
  Alert.alert(
    'Unable to Load Data',
    err.userMessage || 'Could not connect to server. Please try again.',
    [{ text: 'OK' }]
  );
  setData([]); // Always set empty, never mock
}
```

### 6. Use Built-in Retry Logic (Optional)
For flaky network conditions, wrap API calls with retry:

```typescript
import { withRetry } from '@/config/api';

const loadDataWithRetry = async () => {
  try {
    const response = await withRetry(
      () => teamService.getTeams(),
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.log(`🔄 Retry ${attempt}: ${error.message}`);
        }
      }
    );
    setData(response.teams.map(mapAPIToUI));
  } catch (err: any) {
    // After 3 retries, show error
    console.error('❌ Failed after retries:', err);
    Alert.alert('Error', err.userMessage || 'Failed to load data');
    setData([]);
  }
};
```

**When to use retry**:
- ✅ Critical data loads (dashboard, teams list)
- ✅ User-initiated refreshes
- ❌ NOT for creates/updates/deletes (avoid duplicate submissions)

---

## 🔄 Loading States Best Practice

### Standard Pattern
```typescript
const [isLoading, setIsLoading] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await service.getData();
    setData(response.data.map(mapAPIToUI));
  } catch (err: any) {
    console.error('❌ Load error:', err);
    setError(err.userMessage || 'Failed to load');
    Alert.alert('Error', err.userMessage || 'Failed to load data');
    setData([]);
  } finally {
    setIsLoading(false);
  }
};

// Pull-to-refresh
const onRefresh = async () => {
  setIsRefreshing(true);
  await loadData();
  setIsRefreshing(false);
};
```

### UI Display Pattern
```typescript
{isLoading && <ActivityIndicator size="large" />}
{error && <ErrorMessage message={error} onRetry={loadData} />}
{!isLoading && !error && data.length === 0 && <EmptyState />}
{!isLoading && data.length > 0 && <DataList data={data} />}
```

---

## 📄 Pagination Pattern

The API returns pagination metadata. Handle it like this:

### State Setup
```typescript
interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

const [data, setData] = useState<UIItem[]>([]);
const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  pageSize: 20,
  totalItems: 0,
  hasMore: false,
});
```

### Load More Function
```typescript
const loadMore = async () => {
  if (!pagination.hasMore || isLoading) return;

  try {
    const nextPage = pagination.page + 1;
    const response = await service.getData({
      page: nextPage,
      page_size: 20
    });

    // Append new data
    setData([...data, ...response.items.map(mapAPIToUI)]);

    // Update pagination state
    setPagination({
      page: nextPage,
      pageSize: 20,
      totalItems: response.pagination.total_items,
      hasMore: nextPage < response.pagination.total_pages,
    });
  } catch (err: any) {
    Alert.alert('Error', err.userMessage || 'Failed to load more');
  }
};
```

### FlatList Integration
```typescript
<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  refreshing={isRefreshing}
  onRefresh={onRefresh}
  ListFooterComponent={
    pagination.hasMore ? <ActivityIndicator /> : null
  }
/>
```

---

## 📋 Screen-by-Screen Integration Tasks

### 1. Videos Tab (`app/(tabs)/videos.tsx`)

**Current State**: Has `usingMockData` flag, uses videoStore
**API Service**: `services/api/videoService.ts`
**Estimated Time**: 45 minutes

#### Tasks:
1. ✅ Check if videoStore is already integrated (might be done)
2. Remove any mock data fallbacks in error handlers
3. Add data mapper if needed (API Video → UI Video format)
4. Test with:
   - API working (empty array)
   - API failing (network error)
   - API working (with data)

#### API Endpoints Needed:
```typescript
// Get all videos
GET /videos
Response: { videos: Video[], pagination: {...} }

// Get streaming URL
GET /videos/{video_id}/stream
Response: { stream_url: string, expires_at: string }

// Get processing status
GET /videos/{video_id}/status
Response: { video_id: string, status: 'processing', progress: 45 }
```

#### Data Mapping:
```typescript
interface APIVideo {
  video_id: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  gcsPath: string;
  created_at: string;
}

interface UIVideo {
  id: string;
  title: string;
  thumbnail?: string;
  duration: number;
  status: string;
  date: string;
  tags?: string[];
}

const mapAPIVideoToUIVideo = (apiVideo: APIVideo): UIVideo => ({
  id: apiVideo.video_id,
  title: apiVideo.title || 'Untitled Video',
  duration: apiVideo.duration || 0,
  status: apiVideo.status,
  date: apiVideo.created_at,
  // thumbnail will come from different endpoint later
});
```

#### TODO Location:
- File: `app/(tabs)/videos.tsx`
- Lines: Check around data loading functions

---

### 2. Games Tab (`app/(tabs)/games.tsx`)

**Current State**: Uses `MOCK_GAMES` constant directly
**API Service**: `services/api/gameService.ts`
**Estimated Time**: 60 minutes

#### Tasks:
1. Remove `MOCK_GAMES` constant
2. Remove `mockGames` and `mockTeams` imports
3. Implement `loadGames()` function with gameService
4. Create data mapper (API Game → UI Game)
5. Update all references from `MOCK_GAMES` to state variable
6. Remove `usingMockData` logic (no fallback allowed)

#### API Endpoints Needed:
```typescript
// Get all games
GET /games
Response: { games: Game[], pagination: {...} }

// Get game by ID
GET /games/{game_id}
Response: { game_id, home_team_id, away_team_id, video_id, score, date }

// Get season stats
GET /games/team/{team_id}/season-stats
Response: { wins, losses, avg_points, etc. }
```

#### Data Mapping Required:
```typescript
interface APIGame {
  game_id: string;
  home_team_id: string;
  away_team_id: string;
  video_id: string;
  home_score?: number;
  away_score?: number;
  game_date: string;
  created_at: string;
}

interface UIGame {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  score: { home: number; away: number };
  status: 'completed' | 'upcoming';
  thumbnail?: string;
  highlights?: Highlight[];
}

// Note: Will need to fetch teams separately by ID
const mapAPIGameToUIGame = async (apiGame: APIGame): Promise<UIGame> => {
  // Need to fetch team details
  const homeTeam = await teamService.getTeamById(apiGame.home_team_id);
  const awayTeam = await teamService.getTeamById(apiGame.away_team_id);

  return {
    id: apiGame.game_id,
    homeTeam: mapAPITeamToUITeam(homeTeam),
    awayTeam: mapAPITeamToUITeam(awayTeam),
    date: apiGame.game_date,
    score: {
      home: apiGame.home_score || 0,
      away: apiGame.away_score || 0,
    },
    status: 'completed',
  };
};
```

#### TODO Location:
- File: `app/(tabs)/games.tsx`
- Lines: 21 (remove MOCK_GAMES), 44-70 (add loadGames function)

---

### 3. Dashboard (`app/(tabs)/index.tsx`)

**Current State**: Uses `mockTeams` directly in multiple places
**API Services**: Multiple (teams, players, games)
**Estimated Time**: 90 minutes (most complex)

#### Tasks:
1. Remove all `mockTeams` usage (lines 94, 95, 120, 121, 130, 131)
2. Implement `loadDashboardData()` that fetches:
   - Teams from API
   - Recent games from API
   - Player stats from API
   - AI insights (if endpoint exists)
3. Create data mappers for all entities
4. Update Quick Actions navigation
5. Remove `usingMockData` logic

#### API Endpoints Needed:
```typescript
// Get teams
GET /teams
Response: { teams: Team[], pagination: {...} }

// Get recent games (need to add to gameService)
GET /games?limit=5&sort=created_at:desc

// Get player stats for team
GET /player-stats?team_id={team_id}&limit=10

// Get top performers (aggregate)
GET /player-stats?min_points=15&page_size=3
```

#### Data Flow:
```typescript
const loadDashboardData = async () => {
  try {
    setLoading(true);

    // Load teams
    const teamsResponse = await teamService.getTeams();
    if (teamsResponse.teams.length > 0) {
      const uiTeams = teamsResponse.teams.map(mapAPITeamToUITeam);
      setSelectedTeam(uiTeams[0]);

      // Load players for first team
      const playersResponse = await playerService.getPlayers({
        team_id: uiTeams[0].id,
      });
      const uiPlayers = playersResponse.players.map(mapAPIPlayerToUIPlayer);
      setPlayers(uiPlayers.slice(0, 3)); // Top 3

      // Load recent games
      const gamesResponse = await gameService.getGames({
        team_id: uiTeams[0].id,
        page_size: 5,
      });
      setRecentGames(gamesResponse.games);

      // Load stats
      const statsResponse = await playerStatsService.getPlayerStats({
        team_id: uiTeams[0].id,
        page_size: 10,
      });
      // Aggregate team stats from player stats
      calculateTeamStats(statsResponse.player_stats);
    } else {
      // No teams = show empty state
      setSelectedTeam(null);
      setPlayers([]);
      setRecentGames([]);
    }
  } catch (err: any) {
    console.error('❌ Dashboard load failed:', err);
    Sentry.captureException(err);
    // Show empty state, not error (let user create team)
    setSelectedTeam(null);
    setPlayers([]);
    setRecentGames([]);
  } finally {
    setLoading(false);
  }
};
```

#### TODO Location:
- File: `app/(tabs)/index.tsx`
- Lines: 85-135 (loadInitialData function)

---

### 4. Analytics/Explore Tab (`app/(tabs)/explore.tsx`)

**Current State**: Unknown, likely uses mock data
**API Service**: `services/api/playerStatsService.ts`
**Estimated Time**: 60 minutes

#### Tasks:
1. Audit current data sources
2. Implement player stats loading from API
3. Create aggregation functions for analytics
4. Add data mappers
5. Handle empty states (no stats yet)

#### API Endpoints Needed:
```typescript
// Get player stats
GET /player-stats?team_id={team_id}

// Get stats by player
GET /player-stats/by-player/{player_id}

// Get team totals
GET /player-stats/team/{team_id}/totals?video_id={video_id}
```

#### Data Mapping:
```typescript
interface APIPlayerStats {
  player_stat_id: string;
  player_id: string;
  team_id: string;
  video_id: string;
  two_point_att: number;
  two_point_made: number;
  three_point_att: number;
  three_point_made: number;
  free_throw_att: number;
  free_throw_made: number;
  assists: number;
  rebounds: number; // need to calculate from offensive + defensive
  turnovers: number;
  // ... more stats
}

interface UIPlayerStats {
  playerId: string;
  playerName: string;
  points: number; // calculated
  rebounds: number; // calculated
  assists: number;
  fieldGoalPercentage: number; // calculated
  // ... simplified for UI
}

const mapAPIStatsToUIStats = (apiStats: APIPlayerStats): UIPlayerStats => ({
  playerId: apiStats.player_id,
  points: (apiStats.two_point_made * 2) +
          (apiStats.three_point_made * 3) +
          apiStats.free_throw_made,
  rebounds: (apiStats.offensive_rebounds || 0) +
            (apiStats.defensive_rebounds || 0),
  assists: apiStats.assists,
  fieldGoalPercentage: calculateFGPercentage(apiStats),
  // ...
});
```

#### TODO Location:
- File: `app/(tabs)/explore.tsx`
- Check data loading in useEffect

---

### 5. Video Upload Screen (`app/video/upload.tsx`)

**Current State**: Unknown, needs verification
**API Service**: `services/api/videoService.ts`
**Estimated Time**: 30 minutes (if needs work)

#### Verify Implementation:
1. Check if already using `videoService.getUploadUrl()`
2. Check if properly uploads to GCS
3. Check if calls `videoService.saveMetadata()`
4. Verify error handling

#### Expected Flow:
```typescript
const handleUpload = async () => {
  try {
    // Step 1: Get signed upload URL
    const { upload_url, video_id } = await videoService.getUploadUrl({
      file_name: video.filename,
    });

    // Step 2: Upload directly to GCS
    await uploadToGCS(upload_url, videoFile);

    // Step 3: Save metadata
    await videoService.saveMetadata({
      video_id,
      file_name: video.filename,
      gcsPath: `gs://bucket/${video_id}`,
      org_id: user.org_id,
      title: formData.title,
      description: formData.description,
    });

    // Step 4: Navigate to processing view
    router.push(`/video/${video_id}`);
  } catch (err: any) {
    console.error('Upload failed:', err);
    Sentry.captureException(err);
    Alert.alert('Upload Failed', err.message);
  }
};
```

#### TODO Location:
- File: `app/video/upload.tsx`
- Check upload handler function

---

### 6. Video Player Screen (`app/video/[id].tsx`)

**Current State**: Unknown, needs verification
**API Service**: `services/api/videoService.ts`
**Estimated Time**: 30 minutes (if needs work)

#### Verify Implementation:
1. Check if loads video details from API
2. Check if gets streaming URL
3. Check if polls for processing status
4. Verify error handling for failed videos

#### Expected Flow:
```typescript
const loadVideoDetails = async (videoId: string) => {
  try {
    // Get video details
    const video = await videoService.getVideoById(videoId);
    setVideoData(video);

    if (video.status === 'completed') {
      // Get streaming URL
      const { stream_url } = await videoService.getStreamingUrl(videoId);
      setStreamUrl(stream_url);
    } else if (video.status === 'processing') {
      // Poll for status
      startStatusPolling(videoId);
    } else if (video.status === 'failed') {
      Alert.alert('Processing Failed', 'Video could not be processed.');
    }
  } catch (err: any) {
    console.error('Failed to load video:', err);
    Alert.alert('Error', 'Could not load video details.');
  }
};

const startStatusPolling = (videoId: string) => {
  const interval = setInterval(async () => {
    const status = await videoService.getVideoStatus(videoId);
    if (status.status === 'completed') {
      clearInterval(interval);
      loadVideoDetails(videoId);
    }
  }, 5000); // Poll every 5 seconds
};
```

#### TODO Location:
- File: `app/video/[id].tsx`
- Check data loading in useEffect

---

### 7. Auth Screens (`app/(auth)/login.tsx`, `register.tsx`, `org-selection.tsx`)

**Current State**: Unknown, likely already implemented
**API Service**: `services/api/authService.ts`
**Estimated Time**: 15 minutes (verification only)

#### Verify Implementation:
1. Login calls `authService.login()`
2. Register calls `authService.register()`
3. Org selection calls `authService.getOrganizations()`
4. Tokens are stored securely
5. Error handling is user-friendly

#### Expected (Already Done?):
```typescript
// Login
const handleLogin = async () => {
  try {
    const { token } = await authService.login(email, password);
    await AsyncStorage.setItem('auth_token', token);
    router.replace('/(tabs)');
  } catch (err: any) {
    Alert.alert('Login Failed', err.userMessage || 'Invalid credentials');
  }
};

// Register
const handleRegister = async () => {
  try {
    await authService.register({
      full_name: name,
      email,
      password,
      org_id: selectedOrgId,
    });
    // Auto-login or navigate to login
  } catch (err: any) {
    Alert.alert('Registration Failed', err.userMessage || 'Registration failed');
  }
};
```

#### TODO Location:
- Files: `app/(auth)/login.tsx`, `app/(auth)/register.tsx`
- Check form handlers

---

## 🛠️ Implementation Checklist

### For Each Screen:

#### Phase 1: Preparation (10 min)
- [ ] Read through current implementation
- [ ] Identify all mock data imports
- [ ] Identify data loading functions
- [ ] Check if API service exists

#### Phase 2: API Integration (20-30 min)
- [ ] Remove mock data imports (keep types)
- [ ] Import API service
- [ ] Create data mapper functions
- [ ] Implement load functions with API calls
- [ ] Add proper error handling (no mock fallback)

#### Phase 3: Testing (10-15 min)
- [ ] Test with backend DOWN (should show errors, not mock data)
- [ ] Test with backend UP, no data (should show empty states)
- [ ] Test with backend UP, with data (should show real data)
- [ ] Verify no console errors
- [ ] Verify Sentry captures errors

#### Phase 4: Cleanup (5 min)
- [ ] Remove `usingMockData` state variables
- [ ] Remove mock data banner UI
- [ ] Remove unused imports
- [ ] Remove TODO comments once complete
- [ ] Run linter

---

## 📚 Reference Implementations

### Complete Example: Teams Tab
File: `app/(tabs)/teams.tsx`

**Study These Sections:**
1. **Imports** (lines 31-37): How to import API services and types
2. **Data Mappers** (lines 64-102): How to transform API → UI
3. **Load Functions** (lines 149-210): How to call API with error handling
4. **CRUD Operations** (lines 287-437): How to create/update/delete
5. **Error Handling**: See Alert.alert usage throughout

### Helper Function: UUID Generation
```typescript
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
```

### Helper Function: Calculate FG%
```typescript
const calculateFGPercentage = (stats: APIPlayerStats): number => {
  const attempts = stats.two_point_att + stats.three_point_att;
  const made = stats.two_point_made + stats.three_point_made;
  return attempts > 0 ? (made / attempts) * 100 : 0;
};
```

---

## 🚨 Critical Rules

### 1. NEVER Use Mock Data in Production
```typescript
// ❌ ABSOLUTELY WRONG
catch (err) {
  console.log('Using mock data');
  setData(mockData); // NEVER DO THIS
}

// ✅ CORRECT
catch (err: any) {
  console.error('API Error:', err);
  Sentry.captureException(err);
  Alert.alert('Error', 'Failed to load data.');
  setData([]); // Empty state
}
```

### 2. Always Transform API Data
API schemas ≠ UI schemas. Always create mappers.

### 3. Handle Three Scenarios
- API success with data → Show data
- API success, empty array → Show empty state (not error)
- API failure → Show error, set empty array

### 4. Use TypeScript Properly
```typescript
// Import types from both API and UI
import type { Team as APITeam } from '@/services/api/teamService';
import type { Team as UITeam } from '@/data/mockData';

// Type your mappers
const mapper = (api: APITeam): UITeam => { ... };
```

### 5. Log Appropriately
```typescript
console.log('✅ Data loaded:', data.length); // Success
console.log('📭 No data found'); // Empty (not error)
console.error('❌ API Error:', err); // Errors
```

---

## 📝 TODO Comments Added to Code

I've added detailed TODO comments to each file that needs work. Search for:
```typescript
// TODO: API_INTEGRATION - [Screen Name]
```

Each TODO includes:
- What needs to be done
- Which API service to use
- Example code to follow
- Testing requirements

**Files with TODOs:**
1. `app/(tabs)/videos.tsx`
2. `app/(tabs)/games.tsx`
3. `app/(tabs)/index.tsx`
4. `app/(tabs)/explore.tsx`
5. `app/video/upload.tsx`
6. `app/video/[id].tsx`

---

## ⚠️ Common Gotchas

### 1. Empty Arrays Are Success, Not Errors
```typescript
// ✅ CORRECT
if (response.teams.length === 0) {
  console.log('📭 No teams yet');
  setTeams([]); // Show empty state UI
}

// ❌ WRONG
if (response.teams.length === 0) {
  throw new Error('No teams found'); // Don't treat as error!
}
```

### 2. API Uses snake_case, UI Uses camelCase
Always transform in mappers:
```typescript
// ✅ CORRECT - Transform snake_case → camelCase
const mapAPIToUI = (apiData: APITeam): UITeam => ({
  id: apiData.team_id,           // snake_case → camelCase
  teamId: apiData.team_id,
  createdAt: apiData.created_at,
  homeTeam: apiData.home_team_id,
  // ...
});
```

### 3. Don't Retry Mutations
```typescript
// ❌ WRONG - Could create duplicates
await withRetry(() => teamService.createTeam(data));

// ✅ CORRECT - Only retry reads
const teams = await withRetry(() => teamService.getTeams());
await teamService.createTeam(data); // No retry wrapper
```

### 4. Use Pre-Formatted Error Messages
The API client provides `err.userMessage` - use it:
```typescript
catch (err: any) {
  // ✅ Use the pre-formatted user-friendly message
  Alert.alert('Error', err.userMessage || 'Something went wrong');

  // ❌ Don't show technical details to users
  Alert.alert('Error', err.message); // Shows "Network Error"
}
```

### 5. AsyncStorage Is Async
```typescript
// ❌ WRONG
const token = AsyncStorage.getItem('token'); // Returns Promise<string | null>

// ✅ CORRECT
const token = await AsyncStorage.getItem('token');
```

### 6. Check for null/undefined Before Mapping
```typescript
// ❌ WRONG - Will crash if response.teams is undefined
setData(response.teams.map(mapAPIToUI));

// ✅ CORRECT - Safe mapping
setData((response.teams || []).map(mapAPIToUI));
// or
if (response.teams && response.teams.length > 0) {
  setData(response.teams.map(mapAPIToUI));
} else {
  setData([]);
}
```

### 7. Handle Missing Optional Fields
```typescript
const mapAPIToUI = (apiData: APITeam): UITeam => ({
  id: apiData.team_id,
  name: apiData.name || 'Unnamed Team',        // Provide defaults
  description: apiData.description || '',       // Empty string, not undefined
  logo: apiData.logo_url || undefined,          // undefined is OK for optional UI fields
  createdAt: apiData.created_at || new Date().toISOString(), // Fallback date
});
```

### 8. Don't Forget to Update Loading States
```typescript
// ❌ WRONG - Loading stays true forever
const loadData = async () => {
  setIsLoading(true);
  const data = await service.getData();
  setData(data);
  // Forgot to set loading false!
};

// ✅ CORRECT - Always use finally
const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await service.getData();
    setData(data);
  } catch (err: any) {
    handleError(err);
  } finally {
    setIsLoading(false); // Always runs
  }
};
```

---

## 🧪 Testing Strategy

### Test Each Screen:

#### 1. Backend Offline Test
```bash
# Stop backend or use invalid URL in .env
API_BASE_URL=https://invalid.url.com
```

**Expected**:
- Error alerts shown to user
- No mock data displayed
- Empty states shown
- No app crashes

#### 2. Backend Online, No Data
```bash
# Use real API with empty database
```

**Expected**:
- Empty state components shown
- "No teams/games/videos yet" messages
- Create buttons visible
- No errors in console

#### 3. Backend Online, With Data
```bash
# Use real API after backend is fixed
```

**Expected**:
- Real data displays correctly
- All CRUD operations work
- Navigation works
- Stats calculate correctly

#### 4. Test Retry Logic (If Using withRetry)
```bash
# Simulate intermittent failures:
# - Start backend, load data
# - Stop backend mid-request
# - Restart backend
# Should see retry logs in console
```

**Expected Console Output**:
```
📤 GET /teams
🔄 Retry 1: Network Error
🔄 Retry 2: Network Error
✅ Succeeded on retry 2
```

**Expected Behavior**:
- Auto-retry on network errors
- Exponential backoff delays visible in logs (1s, 2s, 4s)
- User only sees error after all retries exhausted
- No duplicate API calls for mutations

---

## ⏱️ Time Estimates

| Screen | Complexity | Est. Time |
|--------|-----------|-----------|
| Videos Tab | Medium | 45 min |
| Games Tab | Medium-High | 60 min |
| Dashboard | High | 90 min |
| Analytics | Medium | 60 min |
| Video Upload | Low | 30 min |
| Video Player | Low | 30 min |
| Auth Screens | Low | 15 min |
| **TOTAL** | | **5.5 hours** |

Add 30-60 min for final testing and cleanup.

---

**Document Prepared By**: Claude Code AI
**Last Updated**: 2025-12-08
**Next Review**: After implementation complete

---

## 📝 Document Changelog

### 2025-12-08 - v2.0 (Complete)
**Added comprehensive implementation guides:**
- ✅ Infrastructure Overview section (existing API client, config, environment)
- ✅ Retry logic pattern and usage examples
- ✅ Loading states best practices with pull-to-refresh
- ✅ Pagination pattern with FlatList integration
- ✅ Common Gotchas section (8 critical pitfalls to avoid)
- ✅ Enhanced testing strategy with retry logic tests
- ✅ Updated all error handling to use `err.userMessage`

**Ready for implementation**: Document now covers 100% of patterns needed for successful API integration.
