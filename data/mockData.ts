/**
 * Mock data for AthlosCore application
 * This data structure matches the mockups and API expectations
 */

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  imageUri?: string;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    fieldGoalPercentage: number;
    freeThrowPercentage: number;
    turnovers: number;
    minutesPlayed: number;
  };
}

export interface Team {
  id: string;
  name: string;
  level: string; // e.g., "VARSITY BOYS BASKETBALL"
  record: {
    wins: number;
    losses: number;
  };
  players: Player[];
  recentGame?: {
    opponent: string;
    result: 'W' | 'L';
    score: {
      team: number;
      opponent: number;
    };
  };
  stats: {
    averagePoints: number;
    pointsAllowed: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    turnovers: number;
  };
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  score: {
    home: number;
    away: number;
  };
  status: 'completed' | 'upcoming' | 'in_progress';
  thumbnail?: string;
  highlights?: Highlight[];
  boxScore?: BoxScore;
}

export interface Highlight {
  id: string;
  playerId: string;
  playerName: string;
  timestamp: string; // e.g., "1st 03:23"
  title: string; // e.g., "Fast Break Three Pointer"
  videoUri: string;
  tags: string[];
  coachingNotes?: string;
}

export interface BoxScore {
  teamStats: {
    fieldGoalPercentage: number;
    threePointPercentage: number;
    rebounds: number;
    turnovers: number;
  };
  topPerformers: {
    scorer: Player;
    rebounder: Player;
    assists: Player;
  };
}

export interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  teams: string[]; // Team IDs
}

// Mock data
export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    jerseyNumber: 5,
    position: 'PG',
    imageUri: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face',
    stats: {
      points: 18.4,
      rebounds: 4.2,
      assists: 7.8,
      fieldGoalPercentage: 44.8,
      freeThrowPercentage: 82.3,
      turnovers: 2.9,
      minutesPlayed: 34.2,
    },
  },
  {
    id: '2',
    name: 'Trevor Washington',
    jerseyNumber: 11,
    position: 'SF',
    imageUri: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&h=100&fit=crop&crop=face',
    stats: {
      points: 14.7,
      rebounds: 6.8,
      assists: 2.4,
      fieldGoalPercentage: 48.2,
      freeThrowPercentage: 73.1,
      turnovers: 1.8,
      minutesPlayed: 29.5,
    },
  },
  {
    id: '3',
    name: 'Damon Clarke',
    jerseyNumber: 23,
    position: 'SF',
    imageUri: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop&crop=face',
    stats: {
      points: 16.2,
      rebounds: 5.9,
      assists: 3.1,
      fieldGoalPercentage: 46.7,
      freeThrowPercentage: 78.4,
      turnovers: 2.2,
      minutesPlayed: 31.8,
    },
  },
  {
    id: '4',
    name: 'Jaylen Davis',
    jerseyNumber: 10,
    position: 'C',
    imageUri: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=100&h=100&fit=crop&crop=face',
    stats: {
      points: 12.8,
      rebounds: 9.6,
      assists: 1.9,
      fieldGoalPercentage: 56.4,
      freeThrowPercentage: 67.8,
      turnovers: 2.4,
      minutesPlayed: 28.3,
    },
  },
  {
    id: '5',
    name: 'Antonio Rodriguez',
    jerseyNumber: 12,
    position: 'SG',
    imageUri: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop&crop=face',
    stats: {
      points: 15.9,
      rebounds: 3.7,
      assists: 4.2,
      fieldGoalPercentage: 41.8,
      freeThrowPercentage: 85.6,
      turnovers: 2.6,
      minutesPlayed: 30.7,
    },
  },
];

export const mockTeams: Team[] = [
  {
    id: 'varsity-boys',
    name: 'Lincoln High Eagles',
    level: 'Varsity Boys',
    record: {
      wins: 18,
      losses: 6,
    },
    players: mockPlayers,
    recentGame: {
      opponent: 'Central Warriors',
      result: 'W',
      score: {
        team: 87,
        opponent: 74,
      },
    },
    stats: {
      averagePoints: 78.4,
      pointsAllowed: 69.2,
      fieldGoalPercentage: 46.8,
      threePointPercentage: 34.7,
      turnovers: 11.5,
    },
  },
  {
    id: 'jv-boys',
    name: 'Lincoln High JV Eagles',
    level: 'Junior Varsity',
    record: {
      wins: 14,
      losses: 8,
    },
    players: mockPlayers.slice(0, 3),
    recentGame: {
      opponent: 'Westside',
      result: 'W',
      score: {
        team: 68,
        opponent: 62,
      },
    },
    stats: {
      averagePoints: 65.2,
      pointsAllowed: 61.4,
      fieldGoalPercentage: 44.1,
      threePointPercentage: 29.3,
      turnovers: 14.2,
    },
  },
  {
    id: 'freshman',
    name: 'Lincoln High Freshman',
    level: 'Freshman Team',
    record: {
      wins: 11,
      losses: 9,
    },
    players: mockPlayers.slice(2, 5),
    recentGame: {
      opponent: 'North',
      result: 'L',
      score: {
        team: 42,
        opponent: 46,
      },
    },
    stats: {
      averagePoints: 58.7,
      pointsAllowed: 62.1,
      fieldGoalPercentage: 41.8,
      threePointPercentage: 27.6,
      turnovers: 16.5,
    },
  },
];

export const mockHighlights: Highlight[] = [
  {
    id: 'h1',
    playerId: '1',
    playerName: 'Marcus Johnson',
    timestamp: '2Q 4:12',
    title: 'Pick and Roll to Score',
    videoUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225',
    tags: ['ball-handling', 'court-vision', 'execution'],
    coachingNotes: 'Perfect timing on the screen, excellent court awareness and finish.',
  },
  {
    id: 'h2',
    playerId: '3',
    playerName: 'Damon Clarke',
    timestamp: '3Q 7:45',
    title: 'Defensive Stop to Fast Break',
    videoUri: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=225',
    tags: ['defense', 'transition', 'hustle'],
    coachingNotes: 'Great help defense, quick outlet pass, good transition spacing.',
  },
  {
    id: 'h3',
    playerId: '4',
    playerName: 'Jaylen Davis',
    timestamp: '4Q 2:18',
    title: 'Post Move and Score',
    videoUri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=225',
    tags: ['post-play', 'footwork', 'finishing'],
    coachingNotes: 'Excellent footwork, kept ball high, strong finish through contact.',
  },
];

export const mockGames: Game[] = [
  {
    id: 'game1',
    homeTeam: mockTeams[0],
    awayTeam: {
      ...mockTeams[0],
      id: 'central-warriors',
      name: 'Central Warriors',
    },
    date: 'March 15, 2024',
    score: {
      home: 87,
      away: 74,
    },
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop',
    highlights: mockHighlights,
    boxScore: {
      teamStats: {
        fieldGoalPercentage: 52,
        threePointPercentage: 38,
        rebounds: 43,
        turnovers: 11,
      },
      topPerformers: {
        scorer: mockPlayers[0],
        rebounder: mockPlayers[3],
        assists: mockPlayers[0],
      },
    },
  },
  {
    id: 'game2',
    homeTeam: mockTeams[0],
    awayTeam: {
      ...mockTeams[0],
      id: 'riverside-eagles',
      name: 'Riverside Eagles',
    },
    date: 'March 8, 2024',
    score: {
      home: 69,
      away: 72,
    },
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=225&fit=crop',
  },
];

export const mockCoach: Coach = {
  id: 'coach1',
  name: 'Coach Williams',
  imageUri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  teams: ['varsity-boys', 'jv-boys'],
};

// Quick Actions for dashboard
export const quickActions = [
  {
    id: 'team-selection',
    title: 'Team Selection',
    icon: '👥',
    route: '/team-selection',
  },
  {
    id: 'team-stats',
    title: 'Team & Player Stats',
    icon: '📊',
    route: '/team-stats',
  },
  {
    id: 'upload-film',
    title: 'Upload Film',
    icon: '⬆️',
    route: '/upload',
  },
  {
    id: 'analyze-game',
    title: 'Analyze Game',
    icon: '🔍',
    route: '/analyze',
  },
];

// Onboarding steps
export const onboardingSteps = [
  {
    id: 'step1',
    title: 'Select Your Team',
    description: 'Choose which team roster you want to analyze and manage',
  },
  {
    id: 'step2',
    title: 'Upload Game Film',
    description: 'Import game footage for comprehensive AI-powered analysis',
  },
  {
    id: 'step3',
    title: 'Review AI Analysis',
    description: 'Get detailed breakdowns of plays, player performance, and team patterns',
  },
  {
    id: 'step4',
    title: 'Develop Your Players',
    description: 'Use data-driven insights to create targeted training plans and improve team execution',
  },
];

// ============================================
// NEW: Dashboard Redesign Mock Data
// ============================================

import type { AIInsight } from '@/components/dashboard/AIInsightsCard';
import type { VideoStatus } from '@/components/dashboard/VideoStatusCard';
import type { TopPerformer } from '@/components/dashboard/TopPerformersCard';
import type { UpcomingGame } from '@/components/dashboard/UpcomingGameCard';

// AI Insights - Coach Vision AI suggestions
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'improvement',
    title: 'Ball Security Improving',
    description: 'Turnover rate decreased 15% in the last 3 games. Keep emphasizing the outlet passes.',
    metric: {
      value: 11.5,
      change: -15,
      unit: '%',
    },
  },
  {
    id: 'insight-2',
    type: 'trend',
    title: 'Marcus Johnson Trending Up',
    description: '3-point percentage improved to 42% this month. Consider more plays utilizing his shooting.',
    metric: {
      value: 42,
      change: 8,
      unit: '%',
    },
    relatedPlayerId: '1',
  },
  {
    id: 'insight-3',
    type: 'recommendation',
    title: 'Zone Defense Opportunity',
    description: 'Opponents struggling against 2-3 zone. Success rate 73% when deployed in 4th quarter.',
  },
  {
    id: 'insight-4',
    type: 'alert',
    title: 'Foul Trouble Pattern',
    description: 'Jaylen Davis averaging 3.2 fouls in first half. Consider rotation adjustments.',
    relatedPlayerId: '4',
  },
];

// Video Processing Status
export const mockVideoStatuses: VideoStatus[] = [
  {
    videoId: 'vid-001',
    title: 'vs Central Warriors',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    videoId: 'vid-002',
    title: 'vs North Panthers',
    status: 'processing',
    progress: 45,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    videoId: 'vid-003',
    title: 'vs East Tigers',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  },
];

// Top Performers
export const mockTopPerformers: TopPerformer[] = [
  {
    playerId: '1',
    name: 'Marcus Johnson',
    jerseyNumber: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face',
    statLabel: 'PPG',
    statValue: 18.4,
    trend: 'up',
    position: 'PG',
  },
  {
    playerId: '4',
    name: 'Jaylen Davis',
    jerseyNumber: 10,
    avatarUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=100&h=100&fit=crop&crop=face',
    statLabel: 'REB',
    statValue: 9.6,
    trend: 'stable',
    position: 'C',
  },
  {
    playerId: '5',
    name: 'Antonio Rodriguez',
    jerseyNumber: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop&crop=face',
    statLabel: 'AST',
    statValue: 4.2,
    trend: 'up',
    position: 'SG',
  },
  {
    playerId: '3',
    name: 'Damon Clarke',
    jerseyNumber: 23,
    avatarUrl: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop&crop=face',
    statLabel: 'STL',
    statValue: 2.1,
    trend: 'up',
    position: 'SF',
  },
];

// Upcoming Game
export const mockUpcomingGame: UpcomingGame = {
  gameId: 'upcoming-001',
  opponent: 'Central Warriors',
  opponentTeamId: 'central-warriors',
  dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  venue: 'Lincoln High School Gymnasium',
  isHome: true,
};

// Alternative: No upcoming game scenario
export const mockNoUpcomingGame: UpcomingGame | null = null;