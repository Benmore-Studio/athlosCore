/**
 * Store Index
 *
 * Central export for all Zustand stores.
 * Import stores from here for consistency.
 */

export { useTeamStore } from './teamStore';
export { usePlayerStore } from './playerStore';
export { useVideoStore } from './videoStore';
export { useUIStore } from './uiStore';

export type { Team, Player } from '@/data/mockData';
export type {
  Video,
  VideoTag,
  TimelineMarker,
  UploadQueueItem,
  PlaybackState,
} from './videoStore';
export type { ThemeMode, AppSettings } from './uiStore';
