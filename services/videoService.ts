import { mockVideos } from '@/data/mockVideos';
import * as Sentry from '@sentry/react-native';

/**
 * Fetches all videos from the mock data source
 * @throws {Error} If the fetch operation fails
 */
export const fetchVideos = async () => {
  try {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 800));
    
    // Simulate potential network errors (only 1% chance in development - reduced from 5%)
    if (__DEV__ && Math.random() < 0.01) {
      throw new Error('Network request failed. Please check your connection.');
    }
    
    return mockVideos;
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { service: 'video', action: 'fetch_videos' },
      extra: { videosCount: mockVideos.length }
    });
    
    console.error('Error fetching videos:', error);
    throw new Error('Unable to load videos. Please try again later.');
  }
};

/**
 * Fetches a single video by ID
 * @param id - The video ID to fetch
 * @throws {Error} If the video is not found or fetch fails
 */
export const fetchVideoById = async (id: string) => {
  try {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 800));
    
    // Simulate potential network errors (only 1% chance in development - reduced from 5%)
    if (__DEV__ && Math.random() < 0.01) {
      throw new Error('Network request failed. Please check your connection.');
    }
    
    const video = mockVideos.find((v) => v.id === id);
    
    if (!video) {
      throw new Error(`Video with ID "${id}" not found.`);
    }
    
    return video;
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { service: 'video', action: 'fetch_video_by_id' },
      extra: { videoId: id }
    });
    
    console.error(`Error fetching video ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    
    throw new Error('Unable to load video. Please try again later.');
  }
};

/**
 * Uploads a video file
 * @param fileUri - The local URI of the video file to upload
 * @throws {Error} If the upload fails
 */
export async function uploadVideo(fileUri: string) {
  try {
    if (!fileUri) {
      throw new Error('Video file URI is required.');
    }
    
    // Simulate network delay for upload
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Simulate potential upload errors (only 1% chance in development - reduced from 5%)
    if (__DEV__ && Math.random() < 0.01) {
      throw new Error('Upload failed due to network timeout. Please try again.');
    }
    
    // Simulate successful upload response
    const uploadedVideo = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Uploaded Game Film',
      videoUrl: fileUri,
      uploadedAt: new Date(),
      status: 'processing',
    };
    
    return uploadedVideo;
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { service: 'video', action: 'upload_video' },
      extra: { 
        fileUri: fileUri?.substring(0, 50), // First 50 chars only for privacy
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    });
    
    console.error('Error uploading video:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Video upload failed. Please check your connection and try again.');
  }
}