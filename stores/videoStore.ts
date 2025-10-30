/**
 * Video Store
 *
 * Global state management for videos with AsyncStorage persistence.
 * Manages video list, upload queue, playback state, and preferences.
 */

import { create } from 'zustand';
import { storage, StorageKeys } from '@/utils/storage';

// Video types based on mockVideos structure
export interface TimelineMarker {
  id: string;
  timeMillis: number;
  type: string; // 'goal', 'foul', 'score', 'timeout', 'quarter', 'save'
  title: string;
  description?: string;
}

export interface VideoTag {
  id: string;
  timeMillis: number;
  x: number; // position on court/field (percentage)
  y: number; // position on court/field (percentage)
  playType: string;
  playerName: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  duration: string;
  videoUrl: string;
  timelineMarkers?: TimelineMarker[];
  tags?: VideoTag[];
  teamA?: string;
  teamB?: string;
  views?: number;
  likes?: number;
  uploadedAt: string;
}

export interface UploadQueueItem {
  id: string;
  fileUri: string;
  title: string;
  description?: string;
  teamId?: string;
  gameDate?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
}

export interface PlaybackState {
  videoId: string;
  position: number; // milliseconds
  isPlaying: boolean;
  speed: number;
}

interface VideoStore {
  // State
  videos: Video[];
  uploadQueue: UploadQueueItem[];
  currentPlayback: PlaybackState | null;
  playbackSpeed: number;
  isLoading: boolean;
  error: string | null;

  // Actions - Videos
  setVideos: (videos: Video[]) => void;
  addVideo: (video: Video) => void;
  updateVideo: (videoId: string, updates: Partial<Video>) => void;
  removeVideo: (videoId: string) => void;
  getVideoById: (videoId: string) => Video | undefined;

  // Actions - Upload Queue
  addToUploadQueue: (item: Omit<UploadQueueItem, 'id' | 'createdAt'>) => void;
  updateUploadProgress: (itemId: string, progress: number, status?: UploadQueueItem['status']) => void;
  removeFromUploadQueue: (itemId: string) => void;
  clearCompletedUploads: () => void;
  retryFailedUpload: (itemId: string) => void;

  // Actions - Playback
  setCurrentPlayback: (playback: PlaybackState | null) => void;
  updatePlaybackPosition: (videoId: string, position: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlayPause: () => void;

  // Actions - General
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Persistence
  loadPlaybackSpeed: () => Promise<void>;
  persistPlaybackSpeed: () => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  videos: [],
  uploadQueue: [],
  currentPlayback: null,
  playbackSpeed: 1.0,
  isLoading: false,
  error: null,
};

export const useVideoStore = create<VideoStore>((set, get) => ({
  ...initialState,

  // Videos
  setVideos: (videos) => {
    set({ videos, error: null });
  },

  addVideo: (video) => {
    set((state) => ({
      videos: [video, ...state.videos],
      error: null,
    }));
  },

  updateVideo: (videoId, updates) => {
    set((state) => ({
      videos: state.videos.map((video) =>
        video.id === videoId ? { ...video, ...updates } : video
      ),
      error: null,
    }));
  },

  removeVideo: (videoId) => {
    set((state) => ({
      videos: state.videos.filter((video) => video.id !== videoId),
      error: null,
    }));
  },

  getVideoById: (videoId) => {
    return get().videos.find((v) => v.id === videoId);
  },

  // Upload Queue
  addToUploadQueue: (item) => {
    const newItem: UploadQueueItem = {
      ...item,
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      uploadQueue: [...state.uploadQueue, newItem],
      error: null,
    }));

    return newItem.id;
  },

  updateUploadProgress: (itemId, progress, status) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              progress,
              ...(status && { status }),
            }
          : item
      ),
    }));
  },

  removeFromUploadQueue: (itemId) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((item) => item.id !== itemId),
    }));
  },

  clearCompletedUploads: () => {
    set((state) => ({
      uploadQueue: state.uploadQueue.filter(
        (item) => item.status !== 'completed'
      ),
    }));
  },

  retryFailedUpload: (itemId) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) =>
        item.id === itemId
          ? { ...item, status: 'pending', progress: 0, error: undefined }
          : item
      ),
    }));
  },

  // Playback
  setCurrentPlayback: (playback) => {
    set({ currentPlayback: playback });
  },

  updatePlaybackPosition: (videoId, position) => {
    set((state) => {
      if (state.currentPlayback?.videoId === videoId) {
        return {
          currentPlayback: {
            ...state.currentPlayback,
            position,
          },
        };
      }
      return state;
    });
  },

  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed });
    storage.setItem(StorageKeys.PLAYBACK_SPEED, speed).catch(console.error);
  },

  togglePlayPause: () => {
    set((state) => {
      if (state.currentPlayback) {
        return {
          currentPlayback: {
            ...state.currentPlayback,
            isPlaying: !state.currentPlayback.isPlaying,
          },
        };
      }
      return state;
    });
  },

  // General
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // Persistence
  loadPlaybackSpeed: async () => {
    try {
      const speed = await storage.getItem<number>(StorageKeys.PLAYBACK_SPEED);
      if (speed !== null) {
        set({ playbackSpeed: speed });
      }
    } catch (error) {
      console.error('Error loading playback speed:', error);
    }
  },

  persistPlaybackSpeed: async () => {
    try {
      const { playbackSpeed } = get();
      await storage.setItem(StorageKeys.PLAYBACK_SPEED, playbackSpeed);
    } catch (error) {
      console.error('Error persisting playback speed:', error);
    }
  },

  reset: () => {
    set(initialState);
    storage.removeItem(StorageKeys.PLAYBACK_SPEED).catch(console.error);
  },
}));
