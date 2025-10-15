import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VideoPlayer from '@/components/ui/videoPlayer';
import { fetchVideoById } from '@/services/videoService';
import { Colors } from '@/constants/theme';

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchVideoById(id as string);
      setVideo(data);
    })();
  }, [id]);

  if (!video) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <VideoPlayer
        videoUrl={video.videoUrl}
        title={video.title}
        timelineMarkers={video.timelineMarkers}
        tags={video.tags}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
