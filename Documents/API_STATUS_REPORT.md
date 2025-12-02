# AthlosCore API Endpoint Status Report

**Base URL**: `https://athloscore.someexamplesof.ai/api/v1/public`
**Report Date**: 2025-11-26
**Report Purpose**: Document working vs failing endpoints for backend team

---

## Summary

| Category | Working | Failing (500 Error) | Total |
|----------|---------|---------------------|-------|
| Authentication | 3 | 1 | 4 |
| Videos | 2 | 6 | 8 |
| Players | 0 | 5 | 5 |
| Player Stats | 0 | 8 | 8 |
| Teams | 0 | 5 | 5 |
| Games | 0 | 4 | 4 |
| **TOTAL** | **5** | **29** | **34** |

---

## Working Endpoints (5)

### Authentication
| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/auth/login` | POST | ✅ Working | Returns JWT token |
| `/auth/register` | POST | ✅ Working | Creates user account |
| `/auth/orgs-list` | GET | ✅ Working | Returns organization list |

### Videos
| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/videos/get-upload-url` | POST | ✅ Working | Returns signed GCS URL |
| `/videos` | POST | ✅ Working | Saves video metadata |

---

## Failing Endpoints - 500 Internal Server Error (29)

### Authentication (1 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/auth/check-org-name` | POST | ❌ 500 | Internal Server Error |

### Videos (6 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/videos` | GET | ❌ 500 | Internal Server Error |
| `/videos/{video_id}` | GET | ❌ 500 | Internal Server Error |
| `/videos/{video_id}/stream` | GET | ❌ 500 | Internal Server Error |
| `/videos/{video_id}/status` | GET | ❌ 500 | Internal Server Error |
| `/videos/{video_id}/status` | PUT | ❌ 500 | Internal Server Error |
| `/videos/{video_id}` | DELETE | ❌ 500 | Internal Server Error |

### Players (5 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/players` | GET | ❌ 500 | Internal Server Error |
| `/players/{player_id}` | GET | ❌ 500 | Internal Server Error |
| `/players` | POST | ❌ 500 | Internal Server Error |
| `/players/{player_id}` | PUT | ❌ 500 | Internal Server Error |
| `/players/{player_id}` | DELETE | ❌ 500 | Internal Server Error |

### Player Stats (8 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/player-stats` | GET | ❌ 500 | Internal Server Error |
| `/player-stats` | POST | ❌ 500 | Internal Server Error |
| `/player-stats/bulk` | POST | ❌ 500 | Internal Server Error |
| `/player-stats/by-video/{video_id}` | GET | ❌ 500 | Internal Server Error |
| `/player-stats/by-player/{player_id}` | GET | ❌ 500 | Internal Server Error |
| `/player-stats/by-team/{team_id}` | GET | ❌ 500 | Internal Server Error |
| `/player-stats/team/{team_id}/totals` | GET | ❌ 500 | Internal Server Error |
| `/player-stats/{player_stat_id}` | GET | ❌ 500 | Internal Server Error |

### Teams (5 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/teams` | GET | ❌ 500 | Internal Server Error |
| `/teams/{team_id}` | GET | ❌ 500 | Internal Server Error |
| `/teams` | POST | ❌ 500 | Internal Server Error |
| `/teams/{team_id}` | PUT | ❌ 500 | Internal Server Error |
| `/teams/{team_id}` | DELETE | ❌ 500 | Internal Server Error |

### Games (4 failing)
| Endpoint | Method | Status | Error |
|----------|--------|--------|-------|
| `/games` | GET | ❌ 500 | Internal Server Error |
| `/games/{game_id}` | GET | ❌ 500 | Internal Server Error |
| `/games` | POST | ❌ 500 | Internal Server Error |
| `/games/team/{team_id}/season-stats` | GET | ❌ 500 | Internal Server Error |

---

## Impact on Mobile App

### Currently Working Features
1. **User Registration** - Users can create accounts
2. **User Login** - Users can authenticate and receive tokens
3. **Organization Selection** - Users can see available organizations
4. **Video Upload** - Users can upload videos to GCS

### Blocked Features (Due to 500 Errors)
1. **Video Library** - Cannot fetch list of uploaded videos
2. **Video Playback** - Cannot get streaming URLs
3. **Video Status** - Cannot check processing status
4. **Player Management** - All player CRUD operations fail
5. **Team Management** - All team CRUD operations fail
6. **Player Statistics** - Cannot view or create stats
7. **Game Management** - Cannot create or view games
8. **Analytics Dashboard** - No data available

---

## Recommended Actions for Backend Team

### Priority 1 - Critical (Blocks Core Functionality)
1. **GET /videos** - Users cannot see their uploaded videos
2. **GET /videos/{video_id}** - Cannot view video details
3. **GET /videos/{video_id}/stream** - Cannot play videos

### Priority 2 - High (Blocks Analytics)
4. **GET /players** - Cannot display player roster
5. **GET /player-stats** - Cannot show statistics
6. **GET /teams** - Cannot display teams

### Priority 3 - Medium (Blocks Management)
7. **POST /players** - Cannot add players
8. **POST /teams** - Cannot create teams
9. **GET /games** - Cannot view games

### Priority 4 - Lower (Can Work Around)
10. **POST /auth/check-org-name** - Can skip org name validation

---

## Testing Notes

- All tests performed with valid JWT authentication token
- 500 errors indicate server-side issues (not client-side)
- Errors are consistent and reproducible
- No additional error messages returned in response body

---

## Contact

**Frontend Team**: Please investigate server logs for the failing endpoints.
**Expected Timeline**: These endpoints are critical for MVP launch.
