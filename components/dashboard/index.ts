// Dashboard Components - Barrel Export

// Existing Components
export { default as DashboardHeader } from './DashboardHeader';
export { default as PlayerSpotlight } from './PlayerSpotlight';
export { default as QuickActions } from './QuickActions';
export { default as QuickStats } from './QuickStats';
export { default as RecentGames } from './RecentGames';
export { default as TeamPerformance } from './TeamPerformance';
export { default as WelcomeHero } from './WelcomeHero';

// New Components (Dashboard Redesign)
export { default as StatsRow } from './StatsRow';
export { default as AIInsightsCard } from './AIInsightsCard';
export { default as VideoStatusCard } from './VideoStatusCard';
export { default as TopPerformersCard } from './TopPerformersCard';
export { default as UpcomingGameCard } from './UpcomingGameCard';

// Type exports
export type { AIInsight } from './AIInsightsCard';
export type { VideoStatus } from './VideoStatusCard';
export type { TopPerformer } from './TopPerformersCard';
export type { UpcomingGame } from './UpcomingGameCard';
