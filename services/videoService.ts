import { mockVideos } from '@/data/mockVideos';

export const fetchVideos = async () => {
  return mockVideos;
};

export const fetchVideoById = async (id: string) => {
  return mockVideos.find((v) => v.id === id);
};


export async function uploadVideo(fileUri: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.random().toString(),
          title: 'Uploaded Game Film',
          videoUrl: fileUri,
          uploadedAt: new Date(),
        });
      }, 3000);
    });
  }
  