# Games API Requirements

## Overview
The frontend games screen is now configured to fetch real data from your backend API. However, the games endpoints need to be implemented on your backend first.

## Required Backend Endpoints

### 1. **GET /api/v1/public/games**
Fetch a list of games with optional filters.

**Query Parameters:**
- `org_id` (optional): Filter by organization ID
- `team_id` (optional): Filter by team ID (home or away)
- `status` (optional): Filter by status (`completed`, `upcoming`, `in_progress`, `cancelled`)
- `start_date` (optional): Filter games from this date onwards
- `end_date` (optional): Filter games up to this date
- `page` (optional): Page number for pagination
- `page_size` (optional): Number of results per page

**Response Format:**
```json
[
  {
    "game_id": "game_123",
    "home_team_id": "team_456",
    "away_team_id": "team_789",
    "home_team_name": "Lincoln Eagles",
    "away_team_name": "Central Warriors",
    "home_score": 87,
    "away_score": 74,
    "game_date": "2024-03-15T19:00:00Z",
    "status": "completed",
    "video_id": "video_123",
    "thumbnail_url": "https://...",
    "venue": "Lincoln High School Gym",
    "notes": "Great team performance",
    "org_id": "org_123",
    "created_at": "2024-03-10T10:00:00Z",
    "updated_at": "2024-03-15T22:00:00Z"
  }
]
```

### 2. **GET /api/v1/public/games/{game_id}**
Fetch detailed information about a specific game.

**Response Format:**
```json
{
  "game_id": "game_123",
  "home_team_id": "team_456",
  "away_team_id": "team_789",
  "home_team_name": "Lincoln Eagles",
  "away_team_name": "Central Warriors",
  "home_score": 87,
  "away_score": 74,
  "game_date": "2024-03-15T19:00:00Z",
  "status": "completed",
  "video_id": "video_123",
  "thumbnail_url": "https://...",
  "venue": "Lincoln High School Gym",
  "notes": "Great team performance",
  "org_id": "org_123",
  "created_at": "2024-03-10T10:00:00Z",
  "updated_at": "2024-03-15T22:00:00Z",
  "home_team": {
    "team_id": "team_456",
    "name": "Lincoln Eagles",
    "level": "Varsity"
  },
  "away_team": {
    "team_id": "team_789",
    "name": "Central Warriors",
    "level": "Varsity"
  },
  "video": {
    "video_id": "video_123",
    "title": "Lincoln vs Central - Full Game",
    "duration": "120:45",
    "status": "completed"
  },
  "box_score": {
    "home_team_stats": {
      "field_goal_percentage": 52.0,
      "three_point_percentage": 38.0,
      "rebounds": 43,
      "turnovers": 11
    },
    "away_team_stats": {
      "field_goal_percentage": 45.0,
      "three_point_percentage": 32.0,
      "rebounds": 38,
      "turnovers": 15
    }
  },
  "highlights": [
    {
      "id": "highlight_1",
      "timestamp": "Q2 4:12",
      "title": "Fast Break Three Pointer",
      "player_id": "player_123",
      "player_name": "Marcus Johnson"
    }
  ]
}
```

### 3. **POST /api/v1/public/games**
Create a new game record.

**Request Body:**
```json
{
  "home_team_id": "team_456",
  "away_team_id": "team_789",
  "game_date": "2024-03-20T19:00:00Z",
  "org_id": "org_123",
  "home_score": 0,
  "away_score": 0,
  "status": "upcoming",
  "venue": "Lincoln High School Gym",
  "notes": "Season championship game"
}
```

**Response:** Returns the created game object (same format as GET).

### 4. **PUT /api/v1/public/games/{game_id}**
Update an existing game.

**Request Body:**
```json
{
  "home_score": 87,
  "away_score": 74,
  "status": "completed",
  "video_id": "video_123",
  "notes": "Updated after game completion"
}
```

**Response:** Returns the updated game object.

### 5. **DELETE /api/v1/public/games/{game_id}**
Delete a game record.

**Response:**
```json
{
  "message": "Game deleted successfully",
  "game_id": "game_123"
}
```

### 6. **GET /api/v1/public/games/team/{team_id}/season-stats**
Get season statistics for a team based on their games.

**Query Parameters:**
- `season` (optional): Filter by season (e.g., "2023-2024")

**Response Format:**
```json
{
  "team_id": "team_456",
  "team_name": "Lincoln Eagles",
  "season": "2023-2024",
  "total_games": 24,
  "wins": 18,
  "losses": 6,
  "win_percentage": 75.0,
  "average_points": 87.3,
  "average_points_allowed": 69.2,
  "field_goal_percentage": 46.8,
  "three_point_percentage": 34.7,
  "average_rebounds": 42.5,
  "average_turnovers": 11.5
}
```

## Database Schema Suggestion

```sql
CREATE TABLE games (
  game_id VARCHAR(255) PRIMARY KEY,
  home_team_id VARCHAR(255) NOT NULL,
  away_team_id VARCHAR(255) NOT NULL,
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  game_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming',
  video_id VARCHAR(255),
  thumbnail_url TEXT,
  venue VARCHAR(255),
  notes TEXT,
  org_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
  FOREIGN KEY (away_team_id) REFERENCES teams(team_id),
  FOREIGN KEY (video_id) REFERENCES videos(video_id),
  FOREIGN KEY (org_id) REFERENCES organizations(org_id),

  INDEX idx_org_id (org_id),
  INDEX idx_home_team (home_team_id),
  INDEX idx_away_team (away_team_id),
  INDEX idx_game_date (game_date),
  INDEX idx_status (status)
);
```

## Frontend Implementation Status

✅ **Completed:**
- Created `services/api/gameService.ts` with all API methods
- Added game endpoints to `config/api.tsx`
- Updated `app/(tabs)/games.tsx` to fetch from API
- Added offline caching support
- Added retry logic with exponential backoff
- Added error handling with fallback to mock data
- Added loading states and mock data banners
- Integrated with AsyncStorage for org/team filtering

🔄 **Next Steps (Backend):**
1. Implement the games endpoints in your backend
2. Add games table to your database
3. Test the endpoints with the frontend
4. Update the frontend once the backend is ready

## Testing the Integration

Once your backend endpoints are ready:

1. **Start your backend server**
2. **Update the API base URL** in `app.config.js` if needed
3. **Test with a real organization ID**:
   ```typescript
   await AsyncStorage.setItem('current_org_id', 'your_org_id');
   await AsyncStorage.setItem('selected_team_id', 'your_team_id');
   ```
4. **Navigate to the Games tab** in the app
5. **Check console logs** for API calls:
   - `🏀 Fetching games from API...`
   - `✅ Games fetched: X`
6. **Pull to refresh** to test the refresh functionality

## Error Handling

The frontend will automatically:
- Show loading state while fetching
- Display error banner if API is unavailable
- Fall back to mock data if API fails
- Cache successful responses for offline use
- Retry failed requests with exponential backoff
- Work in demo mode with mock data

## Authentication

All game endpoints require:
- Valid `auth_token` in AsyncStorage
- Valid `current_org_id` in AsyncStorage
- Proper CORS headers if testing from web

The frontend automatically includes the auth token in all requests via the API client interceptor.
