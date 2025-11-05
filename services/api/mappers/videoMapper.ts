import { Video as APIVideo } from '@/services/api/videoService';
import { Video as MockVideo } from '@/data/mockVideos';

export function mapAPIVideoToMock(apiVideo: APIVideo): MockVideo {
  return {
    id: apiVideo.video_id,
    title: apiVideo.title || 'Untitled Video',
    thumbnail: '', // Can be generated or provided by API
    duration: apiVideo.duration || 0,
    uploadDate: apiVideo.created_at,
    status: apiVideo.status,
    teams: [], // Fetch separately if needed
  };
}

export function mapAPIVideosToMock(apiVideos: APIVideo[]): MockVideo[] {
  return apiVideos.map(mapAPIVideoToMock);
}