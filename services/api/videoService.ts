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

// API response interface (camelCase from server)
interface UploadUrlAPIResponse {
  uploadUrl: string;
  videoId: string;
  expiresAt: string;
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

          if (__DEV__) {
            console.log('📥 Videos API Response:', {
              status: response.status,
              dataType: typeof response.data,
              isArray: Array.isArray(response.data),
              data: JSON.stringify(response.data)?.substring(0, 200),
            });
          }

          // Handle different response formats
          const data = response.data;

          // If response is already an array, return it
          if (Array.isArray(data)) {
            return data;
          }

          // If response is wrapped in an object, try common wrapper keys
          if (data && typeof data === 'object') {
            if (Array.isArray(data.videos)) return data.videos;
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.items)) return data.items;
            if (Array.isArray(data.results)) return data.results;
          }

          // If data is null/undefined or we couldn't find an array, return empty array
          console.warn('⚠️ Unexpected videos response format:', data);
          return [];
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
    if (__DEV__) {
      console.log('🔗 Requesting upload URL for file:', fileName);
      console.log('   Endpoint:', API_ENDPOINTS.VIDEO_UPLOAD_URL);

      // Debug: Check if auth token is present
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('auth_token');
      console.log('   Auth token:', token ? `${token.substring(0, 20)}...` : 'MISSING ❌');
    }

    return withRetry(
      async () => {
        const response = await apiClient.post(API_ENDPOINTS.VIDEO_UPLOAD_URL, { file_name: fileName });

        if (__DEV__) {
          console.log('📥 Upload URL Response Status:', response.status);
          console.log('📥 Upload URL Response Data:', JSON.stringify(response.data, null, 2));
        }

        // Validate response
        if (!response.data) {
          throw new Error('Server returned empty response');
        }

        const data = response.data;

        // Handle both camelCase (API) and snake_case (legacy) formats
        const uploadUrl = data.uploadUrl || data.upload_url;
        const videoId = data.videoId || data.video_id;
        const expiresAt = data.expiresAt || data.expires_at;

        if (__DEV__) {
          console.log('📥 Mapped Response:', {
            hasUploadUrl: !!uploadUrl,
            hasVideoId: !!videoId,
            uploadUrlLength: uploadUrl?.length || 0,
            videoId: videoId,
          });
        }

        if (!uploadUrl) {
          console.error('❌ Invalid API response - missing uploadUrl/upload_url:', data);
          throw new Error('Server did not provide uploadUrl in response');
        }

        if (!videoId) {
          console.error('❌ Invalid API response - missing videoId/video_id:', data);
          throw new Error('Server did not provide videoId in response');
        }

        // Return normalized snake_case format
        return {
          upload_url: uploadUrl,
          video_id: videoId,
          expires_at: expiresAt || new Date(Date.now() + 3600000).toISOString(), // Default 1 hour if not provided
        };
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
   * Upload video directly to GCS with retry and progress tracking
   * Note: No caching needed - this is a direct upload
   */
  async uploadToGCS(
    signedUrl: string,
    fileUri: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Validate inputs
    if (!signedUrl || signedUrl.trim() === '') {
      throw new Error('Cannot upload: signed URL is empty');
    }

    if (!fileUri || fileUri.trim() === '') {
      throw new Error('Cannot upload: file URI is empty');
    }

    if (__DEV__) {
      console.log('📤 Starting GCS upload');
      console.log('   File URI:', fileUri.substring(0, 50) + '...');
      console.log('   Signed URL:', signedUrl.substring(0, 80) + '...');
    }

    const response = await fetch(fileUri);
    const blob = await response.blob();

    if (__DEV__) {
      console.log('📦 File loaded as blob:', {
        size: blob.size,
        type: blob.type,
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network request failed during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      // Configure and send request
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', 'video/mp4');
      xhr.timeout = 300000; // 5 minutes timeout for large files
      xhr.send(blob);
    });
  }
}

export default new VideoService();