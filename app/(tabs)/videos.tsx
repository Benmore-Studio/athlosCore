import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchVideos } from '@/services/videoService';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '@/components/ui/EmptyState';

export default function VideosScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchVideos();
      setVideos(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderVideoCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/video/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="play-circle-outline" size={22} color={Colors.primary} />
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>🎬 Match Highlights</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/video/upload')}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.uploadText}>Upload Video</Text>
        </TouchableOpacity>
      </View>

      {videos.length === 0 ? (
        <EmptyState
          icon="video.fill"
          title="No Videos Yet"
          description="Upload your first game film to get started with AI-powered analysis and insights"
          actionLabel="Upload Video"
          onAction={() => router.push('/video/upload')}
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderVideoCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, backgroundColor: Colors.background },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop:20,
  },
  header: { 
    fontSize: Typography.headline, 
    fontWeight: '700', 
    color: Colors.text 
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  card: {
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnailContainer: { position: 'relative' },
  thumbnail: { width: '100%', height: 200 },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm },
  title: { flex: 1, marginLeft: 8, color: Colors.text, fontWeight: '500', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
