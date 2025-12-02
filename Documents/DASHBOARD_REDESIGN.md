# Dashboard Redesign Plan

**Created**: 2024-12-01
**Status**: In Progress
**Priority**: High

## Overview

Transform the coach dashboard from a basic overview into a professional, data-rich experience that showcases AI-powered insights and leverages all available API data.

## Current State Analysis

### What We Have Now
- Team card with Record, Win Rate, Player count
- 4 Quick Actions (Upload, Analytics, Roster, Highlights)
- 3 Recent Games (opponent, date, score)
- Team Stats & Roster **hidden on phone** (only tablet landscape)

### Problems Identified
1. **Wasted Space**: Large gaps between sections on phone
2. **Hidden Content**: Stats and roster only visible on tablet landscape
3. **No AI Presence**: Dashboard doesn't showcase the app's AI capabilities
4. **Missing Video Status**: No visibility into upload/processing pipeline
5. **No Upcoming Games**: Missing schedule/next game information
6. **No Top Performers**: Player standouts not highlighted
7. **Static Experience**: No dynamic insights or recommendations

---

## Target Design

### Phone Layout (Portrait)
```
┌─────────────────────────────────────────┐
│ [Logo] Welcome back, Coach     [+] [⚙]  │  Header
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Lincoln Eagles           [Switch]  │ │  Team Card
│ │ 18-6  •  75% Win  •  12 Players    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 87.3 │ 47% │ 33  │ 14  │ 24           │  Stats Row
│ PPG  │ FG% │ REB │ TOV │ Films        │  (NEW)
├─────────────────────────────────────────┤
│ 🤖 AI Insights                    [→]  │
│ "Turnover rate ↓15% last 3 games"      │  AI Card
│ "Marcus Johnson 3PT% up to 42%"        │  (NEW)
├─────────────────────────────────────────┤
│ Quick Actions                          │
│ [Upload] [Analytics] [Roster] [Games]  │  Actions
├─────────────────────────────────────────┤
│ 📹 Video Status                   [→]  │
│ vs Central ✅ Complete                 │  Video Status
│ vs North 🔄 45% Processing             │  (NEW)
├─────────────────────────────────────────┤
│ 🏆 Top Performers            [View All] │
│ [👤 M.Johnson] [👤 J.Williams] [→]     │  Top Players
│    23 PPG        8.5 AST               │  (NEW - scroll)
├─────────────────────────────────────────┤
│ 📅 Next Game                           │
│ vs Central Warriors                    │  Upcoming
│ Fri, Dec 5 @ 7:00 PM                   │  (NEW)
├─────────────────────────────────────────┤
│ Recent Games                   [See All]│
│ ├─ 🟢 vs North    W 87-74  Mar 15     │  Recent Games
│ ├─ 🔴 vs Central  L 72-78  Mar 12     │
│ └─ 🟢 vs South    W 91-85  Mar 10     │
└─────────────────────────────────────────┘
```

### Tablet Portrait Layout
```
┌──────────────────────┬──────────────────────┐
│ Team Card            │ Stats Card           │
│ (larger)             │ (vertical list)      │
├──────────────────────┴──────────────────────┤
│ 🤖 AI Insights (full width)                 │
├──────────────────────┬──────────────────────┤
│ Quick Actions        │ Video Status         │
│ (2x2 grid)           │                      │
├──────────────────────┼──────────────────────┤
│ Recent Games         │ Top Performers       │
│                      │ + Upcoming Game      │
└──────────────────────┴──────────────────────┘
```

### Tablet Landscape Layout
```
┌────────────────┬────────────────┬────────────────┐
│ Team Card      │ AI Insights    │ Stats          │
│                │                │                │
├────────────────┼────────────────┼────────────────┤
│ Quick Actions  │ Video Status   │ Top Performers │
│ (2x2)          │                │                │
├────────────────┼────────────────┼────────────────┤
│ Recent Games   │ Upcoming Games │ Roster Preview │
│                │ / Schedule     │                │
└────────────────┴────────────────┴────────────────┘
```

---

## Implementation Tasks

### Phase 1: Foundation Components
- [ ] **1.1** Create `StatsRow` component - horizontal scrollable stats
- [ ] **1.2** Create `AIInsightsCard` component - coach vision insights
- [ ] **1.3** Create `VideoStatusCard` component - upload/processing status
- [ ] **1.4** Create `TopPerformersCard` component - horizontal player scroll
- [ ] **1.5** Create `UpcomingGameCard` component - next scheduled game

### Phase 2: Data Integration
- [ ] **2.1** Add video status fetching (use existing `videoService`)
- [ ] **2.2** Add top performers calculation from player stats
- [ ] **2.3** Add upcoming games filter from games list
- [ ] **2.4** Create mock AI insights (placeholder for real AI)
- [ ] **2.5** Enhance season stats loading

### Phase 3: Layout Restructure
- [ ] **3.1** Implement phone portrait layout
- [ ] **3.2** Implement tablet portrait layout (2-column)
- [ ] **3.3** Implement tablet landscape layout (3-column)
- [ ] **3.4** Add smooth animations between layouts
- [ ] **3.5** Test responsive breakpoints

### Phase 4: Polish & Testing
- [ ] **4.1** Add loading skeletons for each section
- [ ] **4.2** Add empty states for each section
- [ ] **4.3** Add pull-to-refresh for all data
- [ ] **4.4** Test on iPhone SE (small), iPhone 15 Pro Max (large)
- [ ] **4.5** Test on iPad Mini, iPad Pro
- [ ] **4.6** Accessibility audit (VoiceOver, labels)

---

## New Components Specifications

### 1. StatsRow Component
**File**: `components/dashboard/StatsRow.tsx`
```typescript
interface StatsRowProps {
  stats: {
    avgPoints: number;
    fieldGoalPct: number;
    rebounds: number;
    turnovers: number;
    totalFilms: number;
  };
  layout?: 'horizontal' | 'grid';
}
```

### 2. AIInsightsCard Component
**File**: `components/dashboard/AIInsightsCard.tsx`
```typescript
interface AIInsight {
  id: string;
  type: 'improvement' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  metric?: { value: number; change: number; unit: string };
  relatedPlayerId?: string;
  timestamp: Date;
}

interface AIInsightsCardProps {
  insights: AIInsight[];
  onViewAll?: () => void;
  maxDisplay?: number;
}
```

### 3. VideoStatusCard Component
**File**: `components/dashboard/VideoStatusCard.tsx`
```typescript
interface VideoStatus {
  videoId: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100 for processing
  thumbnailUrl?: string;
  createdAt: Date;
}

interface VideoStatusCardProps {
  videos: VideoStatus[];
  onVideoPress?: (videoId: string) => void;
  onUploadPress?: () => void;
  maxDisplay?: number;
}
```

### 4. TopPerformersCard Component
**File**: `components/dashboard/TopPerformersCard.tsx`
```typescript
interface TopPerformer {
  playerId: string;
  name: string;
  jerseyNumber: number;
  avatarUrl?: string;
  statLabel: string; // "PPG", "AST", "REB"
  statValue: number;
  trend?: 'up' | 'down' | 'stable';
}

interface TopPerformersCardProps {
  performers: TopPerformer[];
  onPlayerPress?: (playerId: string) => void;
  onViewAll?: () => void;
}
```

### 5. UpcomingGameCard Component
**File**: `components/dashboard/UpcomingGameCard.tsx`
```typescript
interface UpcomingGame {
  gameId: string;
  opponent: string;
  opponentTeamId: string;
  dateTime: Date;
  venue: string;
  isHome: boolean;
}

interface UpcomingGameCardProps {
  game: UpcomingGame | null;
  onPress?: () => void;
  onScoutReport?: () => void;
}
```

---

## Data Sources

| Component | API Endpoint | Service |
|-----------|--------------|---------|
| StatsRow | `/games/team/{id}/season-stats` | `gameService.getTeamSeasonStats()` |
| VideoStatus | `/videos?status=*` | `videoService.getVideos()` |
| TopPerformers | `/player-stats/by-team/{id}` | `playerStatsService` (new) |
| UpcomingGame | `/games?status=upcoming` | `gameService.getGames()` |
| AIInsights | Mock data (future: dedicated endpoint) | Local generation |

---

## AI Insights Logic (Mock Implementation)

Generate insights based on available data:

```typescript
function generateInsights(teamStats, playerStats, recentGames): AIInsight[] {
  const insights = [];

  // Trend detection
  if (teamStats.winRate > 60) {
    insights.push({
      type: 'trend',
      title: 'Winning Streak',
      description: `Team is performing at ${teamStats.winRate}% win rate`
    });
  }

  // Player highlights
  const topScorer = playerStats.sort((a, b) => b.points - a.points)[0];
  if (topScorer) {
    insights.push({
      type: 'improvement',
      title: `${topScorer.name} Leading Scorer`,
      description: `Averaging ${topScorer.ppg} PPG this season`
    });
  }

  // Turnover analysis
  if (teamStats.turnovers < 12) {
    insights.push({
      type: 'improvement',
      title: 'Ball Security Improving',
      description: `Only ${teamStats.turnovers} turnovers per game`
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}
```

---

## File Changes Summary

### New Files
- `components/dashboard/StatsRow.tsx`
- `components/dashboard/AIInsightsCard.tsx`
- `components/dashboard/VideoStatusCard.tsx`
- `components/dashboard/TopPerformersCard.tsx`
- `components/dashboard/UpcomingGameCard.tsx`
- `components/dashboard/index.ts` (barrel export)
- `utils/insightGenerator.ts`

### Modified Files
- `app/(tabs)/index.tsx` - Complete restructure
- `services/api/playerService.ts` - Add stats aggregation
- `data/mockData.ts` - Add mock insights, video status

---

## Success Metrics

1. **Space Utilization**: No large empty gaps on any screen size
2. **Data Visibility**: All key stats visible without scrolling on phone
3. **AI Presence**: AI insights card always visible above the fold
4. **Video Pipeline**: Upload status visible on dashboard
5. **Player Highlights**: Top performers showcased prominently
6. **Responsive**: Smooth transitions between all breakpoints

---

## Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Foundation Components | 2-3 hours |
| Phase 2 | Data Integration | 1-2 hours |
| Phase 3 | Layout Restructure | 2-3 hours |
| Phase 4 | Polish & Testing | 1-2 hours |
| **Total** | | **6-10 hours** |

---

## Progress Log

### 2024-12-01
- [x] Created redesign plan document
- [x] **Phase 1 Complete**: All 5 components created
  - `StatsRow.tsx` - Compact horizontal stats display
  - `AIInsightsCard.tsx` - Coach Vision AI insights with gradient background
  - `VideoStatusCard.tsx` - Video processing pipeline status
  - `TopPerformersCard.tsx` - Horizontal scrollable player cards with rank badges
  - `UpcomingGameCard.tsx` - Next game with countdown timer
- [x] Created barrel export at `components/dashboard/index.ts`
- [x] Added mock data to `data/mockData.ts` for all new components
- [x] **Phase 2 Complete**: Data integration done
  - Mock data flows correctly in demo mode
  - Real video status data transforms from API when available
- [x] **Phase 3 Complete**: Dashboard restructured (`app/(tabs)/index.tsx`)
  - Phone: All content visible in single column, stats row always shown
  - Tablet landscape: 2-column layout with sidebar
  - AI Insights prominently displayed below team card
- [ ] **Phase 4**: Testing and polish remaining

