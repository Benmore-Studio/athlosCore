// File: services/api/videoService.ts
import apiClient from './client';
import { API_ENDPOINTS, withRetry } from '@/config/api';
import offlineApiService from './offlineApiService';

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
  /**
   * Get videos with offline support and retry
   */
  async getVideos(filters?: {
    status?: string;
    title?: string;
    org_id?: string;
  }): Promise<Video[]> {
    const cacheKey = `videos_${filters?.org_id || 'all'}_${filters?.status || 'all'}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.VIDEOS, { params: filters });
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 30 * 60 * 1000 // 30 minutes cache
      }
    );
  }

  /**
   * Get video by ID with offline support and retry
   */
  async getVideoById(videoId: string): Promise<Video> {
    const cacheKey = `video_${videoId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.VIDEO_BY_ID(videoId));
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 60 * 60 * 1000 // 1 hour cache
      }
    );
  }

  /**
   * Get upload URL with retry
   * Note: No caching - always needs fresh signed URL
   */
  async getUploadUrl(fileName: string): Promise<UploadUrlResponse> {
    return withRetry(
      async () => {
        const response = await apiClient.post(API_ENDPOINTS.VIDEO_UPLOAD_URL, { file_name: fileName });
        return response.data;
      },
      {
        onRetry: (attemptNumber) => {
          console.log(`🔄 Retrying upload URL request... Attempt ${attemptNumber}`);
        }
      }
    );
  }

  /**
   * Save video metadata with retry
   * Note: Clears video list caches after saving
   */
  async saveVideoMetadata(metadata: VideoMetadata): Promise<void> {
    await withRetry(async () => {
      await apiClient.post(API_ENDPOINTS.VIDEOS, metadata);
    });
    
    // Clear video list caches
    await offlineApiService.clearCache(`videos_${metadata.org_id}_all`);
    await offlineApiService.clearCache(`videos_all_all`);
  }

  /**
   * Get streaming URL with retry
   * Note: Short cache since URLs expire quickly
   */
  async getStreamingUrl(videoId: string): Promise<{ stream_url: string; expires_at: string }> {
    const cacheKey = `video_stream_${videoId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.VIDEO_STREAM(videoId));
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 5 * 60 * 1000 // 5 minutes cache
      }
    );
  }

  /**
   * Get video status with offline support and retry
   * Note: Short cache since status updates frequently
   */
  async getVideoStatus(videoId: string): Promise<{
    video_id: string;
    status: string;
    progress_percentage?: number;
    estimated_completion?: string;
  }> {
    const cacheKey = `video_status_${videoId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        return withRetry(async () => {
          const response = await apiClient.get(API_ENDPOINTS.VIDEO_STATUS(videoId));
          return response.data;
        });
      },
      { 
        key: cacheKey,
        expiryMs: 2 * 60 * 1000 // 2 minutes cache
      }
    );
  }

  /**
   * Update video status with retry
   * Note: Clears status and video caches after update
   */
  async updateVideoStatus(videoId: string, status: string): Promise<void> {
    await withRetry(async () => {
      await apiClient.put(API_ENDPOINTS.VIDEO_STATUS(videoId), { status });
    });
    
    // Clear related caches
    await offlineApiService.clearCache(`video_status_${videoId}`);
    await offlineApiService.clearCache(`video_${videoId}`);
    
    // Clear video lists
    const cachedKeys = await offlineApiService.getCachedKeys();
    const videoListKeys = cachedKeys.filter(key => key.startsWith('videos_'));
    for (const key of videoListKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Delete video with retry
   * Note: Clears all related caches after deletion
   */
  async deleteVideo(videoId: string): Promise<void> {
    await withRetry(async () => {
      await apiClient.delete(API_ENDPOINTS.VIDEO_BY_ID(videoId));
    });
    
    // Clear video-specific caches
    await offlineApiService.clearCache(`video_${videoId}`);
    await offlineApiService.clearCache(`video_status_${videoId}`);
    await offlineApiService.clearCache(`video_stream_${videoId}`);
    
    // Clear all video list caches
    const cachedKeys = await offlineApiService.getCachedKeys();
    const videoListKeys = cachedKeys.filter(key => key.startsWith('videos_'));
    for (const key of videoListKeys) {
      await offlineApiService.clearCache(key);
    }
  }

  /**
   * Upload video directly to GCS with retry
   * Note: No caching needed - this is a direct upload
   */
  async uploadToGCS(signedUrl: string, fileUri: string): Promise<void> {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    await withRetry(
      async () => {
        await fetch(signedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'video/mp4',
          },
        });
      },
      {
        maxRetries: 5, // More retries for large file uploads
        onRetry: (attemptNumber) => {
          console.log(`🔄 Retrying video upload... Attempt ${attemptNumber}`);
        }
      }
    );
  }
}

export default new VideoService();