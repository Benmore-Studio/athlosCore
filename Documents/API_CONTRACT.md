# AthlosCore API Contract

**Base URL**: `https://athloscore.someexamplesof.ai/api/v1/public`
**API Version**: 1.0.0
**Last Updated**: 2025-10-27

## Authentication

All authenticated endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Security Notes
- API uses self-signed SSL certificates (development environment)
- Production deployment should use valid SSL certificates
- JWT tokens expire after a set duration (check with backend team)

---

## Authentication Endpoints

### 1. Login
**Endpoint**: `POST /auth/login`
**Authentication**: None
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized)**:
```json
"Invalid email or password"
```

**Testing Status**: ✅ Verified - Endpoint working, returns proper error messages

---

### 2. Register
**Endpoint**: `POST /auth/register`
**Authentication**: None
**Description**: Create new user account and optionally create/join organization

**Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "johndoe@example.com",
  "password": "secret123",
  "org_name": "My Organization",  // Optional: create new org
  "org_ids": ["org-123", "org-456"]  // Optional: join existing orgs
}
```

**Response (201 Created)**:
```json
{
  "user_id": "usr-789",
  "email": "johndoe@example.com",
  "organizations": ["org-123", "org-456"]
}
```

**Response (409 Conflict)**:
```json
{
  "error": "User with this email already exists"
}
```

**Testing Status**: ⚠️ Tested - Returns 500 error (possible backend issue, needs investigation)

---

### 3. List Organizations
**Endpoint**: `GET /auth/orgs-list`
**Authentication**: None
**Description**: Get all available organizations for user selection during registration

**Response (200 OK)**:
```json
[
  {
    "org_id": "ab031577-3a35-482f-b25b-fa76a7351c86",
    "name": "AthlosCore",
    "created_at": "2025-10-27T01:59:23.168750",
    "last_updated_at": "2025-10-27T01:59:23.168762"
  }
]
```

**Testing Status**: ✅ Verified - Working, returns existing organizations

---

### 4. Check Organization Name
**Endpoint**: `POST /auth/check-org-name?name={org_name}`
**Authentication**: None
**Description**: Check if organization exists by name

**Query Parameters**:
- `name` (string, required): Organization name to check

**Response (200 OK - Organization exists)**:
```json
{
  "exists": true,
  "organization": {
    "org_id": "org-123",
    "name": "My Organization"
  }
}
```

**Response (404 Not Found - Organization does not exist)**:
```json
{
  "exists": false,
  "organization": null
}
```

**Testing Status**: ⚠️ Returns 500 error (needs backend investigation)

---

## Video Endpoints

All video endpoints require authentication (Bearer token).

### 1. Get Videos
**Endpoint**: `GET /videos`
**Authentication**: Required
**Description**: Get list of videos for authenticated user with optional filtering

**Query Parameters**:
- `status` (string, optional): Filter by video status
- `title` (string, optional): Filter by video title (partial match)
- `org_id` (string, optional): Filter by organization ID

**Response (200 OK)**:
```json
[
  {
    "video_id": "video-123",
    "title": "Championship Game",
    "status": "completed",
    "org_id": "org-456",
    "created_at": "2025-10-27T10:00:00Z"
  }
]
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 2. Get Upload URL
**Endpoint**: `POST /videos/get-upload-url`
**Authentication**: Required
**Description**: Generate signed Google Cloud Storage URL for direct video upload

**Request Body**:
```json
{
  "file_name": "game_footage.mp4"
}
```

**Response (200 OK)**:
```json
{
  "upload_url": "https://storage.googleapis.com/...",
  "video_id": "video-123",
  "expires_at": "2025-10-27T12:00:00Z"
}
```

**Upload Flow**:
1. Request signed URL from this endpoint
2. Upload video directly to GCS using returned URL
3. Call POST /videos to save metadata after upload completes

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 3. Save Video Metadata
**Endpoint**: `POST /videos`
**Authentication**: Required
**Description**: Save video metadata after successful GCS upload and trigger AI processing

**Request Body (Minimal)**:
```json
{
  "video_id": "video-123e4567-e89b-12d3-a456-426614174000",
  "file_name": "game.mp4",
  "gcsPath": "gs://my-bucket/videos/video-123.mp4",
  "org_id": "org-987f6543-e21c-45d6-b789-123456789abc"
}
```

**Request Body (Complete)**:
```json
{
  "video_id": "video-123e4567-e89b-12d3-a456-426614174000",
  "file_name": "championship_game_2025.mp4",
  "gcsPath": "gs://my-bucket/videos/2025/01/video-123e4567.mp4",
  "org_id": "org-987f6543-e21c-45d6-b789-123456789abc",
  "title": "Championship Game - Team A vs Team B",
  "description": "Final championship game of the 2025 season",
  "duration": 3600,
  "file_size": 524288000,
  "file_type": ".mp4"
}
```

**Supported File Types**: `.mp4`, `.mov`, `.avi`, `.mkv`

**Response (201 Created)**:
```json
{
  "video_id": "video-123",
  "status": "processing",
  "message": "Video metadata saved, processing initiated"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 4. Get Video by ID
**Endpoint**: `GET /videos/{video_id}`
**Authentication**: Required
**Description**: Get single video details by ID

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (200 OK)**:
```json
{
  "video_id": "video-123",
  "title": "Championship Game",
  "description": "Final game of the season",
  "status": "completed",
  "duration": 3600,
  "file_size": 524288000,
  "gcsPath": "gs://bucket/video-123.mp4",
  "org_id": "org-456",
  "created_at": "2025-10-27T10:00:00Z",
  "updated_at": "2025-10-27T11:30:00Z"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 5. Get Streaming URL
**Endpoint**: `GET /videos/{video_id}/stream`
**Authentication**: Required
**Description**: Get signed URL for video streaming with Range request support

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (200 OK)**:
```json
{
  "stream_url": "https://storage.googleapis.com/...",
  "expires_at": "2025-10-27T12:00:00Z"
}
```

**Usage Notes**:
- Supports HTTP Range requests for seeking
- URL expires after set duration
- Ideal for React Native Video player integration

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 6. Get Video Processing Status
**Endpoint**: `GET /videos/{video_id}/status`
**Authentication**: Required
**Description**: Check current AI processing status of video

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (200 OK)**:
```json
{
  "video_id": "video-123",
  "status": "processing",
  "progress_percentage": 45,
  "estimated_completion": "2025-10-27T11:00:00Z"
}
```

**Status Values**:
- `pending`: Awaiting processing
- `processing`: AI analysis in progress (30-60 minutes)
- `completed`: Analysis complete, data available
- `failed`: Processing error occurred

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 7. Update Video Processing Status
**Endpoint**: `PUT /videos/{video_id}/status`
**Authentication**: Required
**Description**: Update video processing status (typically used by backend processor)

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response (200 OK)**:
```json
{
  "video_id": "video-123",
  "status": "completed"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 8. Delete Video
**Endpoint**: `DELETE /videos/{video_id}`
**Authentication**: Required
**Description**: Soft delete video (marks as not viewable)

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (204 No Content)**: Empty response on success

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

## Player Endpoints

All player endpoints require authentication (Bearer token).

### 1. Get Players
**Endpoint**: `GET /players`
**Authentication**: Required
**Description**: Get list of players with optional filtering and pagination

**Query Parameters**:
- `video_id` (string, optional): Filter by video ID
- `team_id` (string, optional): Filter by team ID
- `name` (string, optional): Filter by player name (partial match)
- `player_number` (string, optional): Filter by player number
- `stats` (boolean, optional, default: false): Include player stats
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 50, max: 100): Items per page

**Response (200 OK)**:
```json
{
  "players": [
    {
      "player_id": "player-123",
      "team_id": "team-456",
      "video_id": "video-789",
      "model_player_identifier": "5",
      "name": "John Doe",
      "player_number": 23,
      "stats": {
        "two_point_made": 7,
        "three_point_made": 2,
        "assists": 4
      }
    }
  ],
  "pagination": {
    "total_count": 150,
    "page": 1,
    "page_size": 50,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 2. Get Player by ID
**Endpoint**: `GET /players/{player_id}`
**Authentication**: Required
**Description**: Get single player by ID with optional stats

**Path Parameters**:
- `player_id` (string, required): Unique player identifier

**Query Parameters**:
- `stats` (boolean, optional, default: false): Include player stats

**Response (200 OK)**:
```json
{
  "player_id": "player-123",
  "team_id": "team-456",
  "video_id": "video-789",
  "model_player_identifier": "5",
  "name": "John Doe",
  "player_number": 23,
  "created_at": "2025-10-27T10:00:00Z"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 3. Create Player
**Endpoint**: `POST /players`
**Authentication**: Required
**Description**: Create new player record

**Request Body**:
```json
{
  "player_id": "player-123",
  "team_id": "team-456",
  "video_id": "video-789",
  "model_player_identifier": "5",
  "name": "John Doe",
  "player_number": 23
}
```

**Response (201 Created)**:
```json
{
  "player_id": "player-123",
  "message": "Player created successfully"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 4. Update Player
**Endpoint**: `PUT /players/{player_id}`
**Authentication**: Required
**Description**: Update player attributes

**Path Parameters**:
- `player_id` (string, required): Unique player identifier

**Request Body**:
```json
{
  "name": "John Smith",
  "player_number": 24
}
```

**Response (204 No Content)**: Empty response on success

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 5. Delete Player
**Endpoint**: `DELETE /players/{player_id}`
**Authentication**: Required
**Description**: Delete player record

**Path Parameters**:
- `player_id` (string, required): Unique player identifier

**Response (204 No Content)**: Empty response on success

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

## Player Stats Endpoints

All player stats endpoints require authentication (Bearer token).

### 1. Get Player Stats
**Endpoint**: `GET /player-stats`
**Authentication**: Required
**Description**: Get list of player statistics with filtering and pagination

**Query Parameters**:
- `video_id` (string, optional): Filter by video ID
- `player_id` (string, optional): Filter by player ID
- `team_id` (string, optional): Filter by team ID
- `min_points` (integer, optional): Filter by minimum total points
- `max_points` (integer, optional): Filter by maximum total points
- `min_assists` (integer, optional): Filter by minimum assists
- `min_possessions` (integer, optional): Filter by minimum possessions
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 50, max: 100): Items per page

**Response (200 OK)**:
```json
{
  "player_stats": [
    {
      "player_stat_id": "stat-123",
      "video_id": "video-789",
      "player_id": "player-456",
      "team_id": "team-101",
      "two_point_att": 10,
      "two_point_made": 7,
      "three_point_att": 5,
      "three_point_made": 2,
      "free_throw_att": 4,
      "free_throw_made": 3,
      "offensive_rebounds": 2,
      "defensive_rebounds": 5,
      "assists": 4,
      "steals": 2,
      "blocks": 1,
      "turnovers": 3,
      "fouls": 2,
      "possessions_count": 15,
      "passes_made": 20,
      "passes_received": 18,
      "interceptions_made": 1
    }
  ],
  "pagination": {
    "total_count": 200,
    "page": 1,
    "page_size": 50,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  }
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 2. Create Player Stat
**Endpoint**: `POST /player-stats`
**Authentication**: Required
**Description**: Create single player stat record

**Request Body**:
```json
{
  "video_id": "video-789",
  "player_id": "player-456",
  "team_id": "team-101",
  "two_point_att": 10,
  "two_point_made": 7,
  "three_point_att": 5,
  "three_point_made": 2,
  "free_throw_att": 4,
  "free_throw_made": 3,
  "offensive_rebounds": 2,
  "defensive_rebounds": 5,
  "assists": 4,
  "steals": 2,
  "blocks": 1,
  "turnovers": 3,
  "fouls": 2,
  "possessions_count": 15,
  "passes_made": 20,
  "passes_received": 18,
  "interceptions_made": 1
}
```

**Response (201 Created)**:
```json
{
  "player_stat_id": "stat-123",
  "message": "Player stat created successfully"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 3. Create Bulk Player Stats
**Endpoint**: `POST /player-stats/bulk`
**Authentication**: Required
**Description**: Create multiple player stat records at once

**Request Body**:
```json
[
  {
    "video_id": "video-789",
    "player_id": "player-456",
    "two_point_made": 7,
    "assists": 4
  },
  {
    "video_id": "video-789",
    "player_id": "player-457",
    "two_point_made": 5,
    "assists": 6
  }
]
```

**Response (201 Created)**:
```json
{
  "created_count": 2,
  "message": "Player stats created successfully"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 4. Get Player Stats by Video ID
**Endpoint**: `GET /player-stats/by-video/{video_id}`
**Authentication**: Required
**Description**: Get all player stats for specific video/game

**Path Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (200 OK)**: Array of player stat objects

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 5. Get Player Stats by Player ID
**Endpoint**: `GET /player-stats/by-player/{player_id}`
**Authentication**: Required
**Description**: Get all stats for specific player across all games

**Path Parameters**:
- `player_id` (string, required): Unique player identifier

**Response (200 OK)**: Array of player stat objects

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 6. Get Player Stats by Team ID
**Endpoint**: `GET /player-stats/by-team/{team_id}`
**Authentication**: Required
**Description**: Get all player stats for specific team

**Path Parameters**:
- `team_id` (string, required): Unique team identifier

**Response (200 OK)**: Array of player stat objects

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 7. Get Team Totals
**Endpoint**: `GET /player-stats/team/{team_id}/totals`
**Authentication**: Required
**Description**: Get aggregated team statistics for specific video/game

**Path Parameters**:
- `team_id` (string, required): Unique team identifier

**Query Parameters**:
- `video_id` (string, required): Unique video identifier

**Response (200 OK)**:
```json
{
  "team_id": "team-101",
  "video_id": "video-789",
  "totals": {
    "two_point_att": 50,
    "two_point_made": 35,
    "three_point_att": 25,
    "three_point_made": 10,
    "total_points": 100,
    "assists": 20,
    "rebounds": 45,
    "turnovers": 12
  }
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

## Team Endpoints

All team endpoints require authentication (Bearer token).

### 1. Get Teams
**Endpoint**: `GET /teams`
**Authentication**: Required
**Description**: Get list of teams with optional filtering and pagination

**Query Parameters**:
- `video_id` (string, optional): Filter by video ID
- `name` (string, optional): Filter by team name (partial match)
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 50, max: 100): Items per page

**Response (200 OK)**:
```json
{
  "teams": [
    {
      "team_id": "team-123",
      "video_id": "video-789",
      "model_team_identifier": "1",
      "name": "Lakers",
      "created_at": "2025-10-27T10:00:00Z"
    }
  ],
  "pagination": {
    "total_count": 50,
    "page": 1,
    "page_size": 50,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 2. Get Team by ID
**Endpoint**: `GET /teams/{team_id}`
**Authentication**: Required
**Description**: Get single team by ID

**Path Parameters**:
- `team_id` (string, required): Unique team identifier

**Response (200 OK)**:
```json
{
  "team_id": "team-123",
  "video_id": "video-789",
  "model_team_identifier": "1",
  "name": "Lakers",
  "created_at": "2025-10-27T10:00:00Z",
  "updated_at": "2025-10-27T10:00:00Z"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 3. Create Team
**Endpoint**: `POST /teams`
**Authentication**: Required
**Description**: Create new team record

**Request Body**:
```json
{
  "team_id": "team-123",
  "video_id": "video-789",
  "model_team_identifier": "1",
  "name": "Lakers"
}
```

**Response (201 Created)**:
```json
{
  "team_id": "team-123",
  "message": "Team created successfully"
}
```

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 4. Update Team
**Endpoint**: `PUT /teams/{team_id}`
**Authentication**: Required
**Description**: Update team attributes

**Path Parameters**:
- `team_id` (string, required): Unique team identifier

**Request Body**:
```json
{
  "name": "Los Angeles Lakers"
}
```

**Response (204 No Content)**: Empty response on success

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

### 5. Delete Team
**Endpoint**: `DELETE /teams/{team_id}`
**Authentication**: Required
**Description**: Delete team record

**Path Parameters**:
- `team_id` (string, required): Unique team identifier

**Response (204 No Content)**: Empty response on success

**Testing Status**: 🔄 Pending - Requires valid authentication token

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request creating resource
- `204 No Content`: Successful PUT/DELETE request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server-side error

---

## Development Notes

### SSL Certificates
- Development API uses self-signed SSL certificates
- Use `-k` flag with curl to bypass SSL verification
- React Native requires special handling for self-signed certificates in development

### Authentication Flow
1. User logs in via POST /auth/login
2. Store JWT token securely (React Native Secure Storage recommended)
3. Include token in Authorization header for all authenticated requests
4. Implement token refresh mechanism (check with backend team for refresh endpoint)

### Video Upload Flow
1. Request signed upload URL: POST /videos/get-upload-url
2. Upload video directly to GCS using signed URL
3. Save metadata and trigger processing: POST /videos
4. Poll status periodically: GET /videos/{video_id}/status
5. When status is "completed", fetch player stats and team data

### Pagination Best Practices
- Default page_size is 50, maximum is 100
- Always check `has_next` and `has_prev` for navigation
- Use `total_pages` to display pagination UI

### Data Relationships
- Video → Teams → Players → Player Stats
- One video can have multiple teams
- One team can have multiple players
- One player can have stats across multiple videos
- Player stats are one-to-one with player per video

---

## Testing Checklist

### Authentication Tests
- [x] GET /auth/orgs-list - Working
- [x] POST /auth/login - Working (tested with invalid credentials)
- [ ] POST /auth/register - Needs investigation (500 error)
- [ ] POST /auth/check-org-name - Needs investigation (500 error)

### Video Tests (Requires Auth Token)
- [ ] POST /videos/get-upload-url
- [ ] POST /videos
- [ ] GET /videos
- [ ] GET /videos/{video_id}
- [ ] GET /videos/{video_id}/stream
- [ ] GET /videos/{video_id}/status
- [ ] PUT /videos/{video_id}/status
- [ ] DELETE /videos/{video_id}

### Player Tests (Requires Auth Token)
- [ ] GET /players
- [ ] GET /players/{player_id}
- [ ] POST /players
- [ ] PUT /players/{player_id}
- [ ] DELETE /players/{player_id}

### Player Stats Tests (Requires Auth Token)
- [ ] GET /player-stats
- [ ] GET /player-stats/{player_stat_id}
- [ ] POST /player-stats
- [ ] POST /player-stats/bulk
- [ ] GET /player-stats/by-video/{video_id}
- [ ] GET /player-stats/by-player/{player_id}
- [ ] GET /player-stats/by-team/{team_id}
- [ ] GET /player-stats/team/{team_id}/totals

### Team Tests (Requires Auth Token)
- [ ] GET /teams
- [ ] GET /teams/{team_id}
- [ ] POST /teams
- [ ] PUT /teams/{team_id}
- [ ] DELETE /teams/{team_id}

---

## Next Steps

1. **Obtain Test Credentials**: Get valid email/password for testing authenticated endpoints
2. **Backend Investigation**: Report 500 errors on /auth/register and /auth/check-org-name
3. **Complete Authentication Tests**: Verify full registration and login flow
4. **Test Authenticated Endpoints**: Systematically test all video, player, and team endpoints
5. **Document Response Schemas**: Add detailed response examples for all endpoints
6. **Error Handling**: Document all possible error scenarios
7. **Performance Testing**: Test pagination, filtering, and bulk operations
8. **Integration Testing**: Test full user flows (registration → login → upload → analysis)
