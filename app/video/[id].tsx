import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { fetchVideoById } from '@/services/videoService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const data = await fetchVideoById(id as string);
      setVideo(data);
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Error', 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality will be implemented with backend integration');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete with backend API
            Alert.alert('Success', 'Video deleted');
            router.back();
          },
        },
      ]
    );
  };

  const handleTagPress = (timeMillis: number) => {
    // TODO: Implement seek to timestamp when VideoPlayer supports it
    console.log('Seek to:', timeMillis);
  };

  const handleRelatedVideoPress = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading video..." fullScreen />
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol size={64} name="exclamationmark.triangle" color={Colors.error} />
          <Text style={styles.errorText}>Video not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  // Mock related videos (in production, this would come from the API)
  const relatedVideos = [
    { id: '2', title: video.teamA + ' Highlights', thumbnail: video.thumbnail },
    { id: '3', title: 'Recent Game Analysis', thumbnail: video.thumbnail },
  ].filter((v) => v.id !== video.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color={Colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <IconSymbol size={24} name="square.and.arrow.up" color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <IconSymbol size={24} name="trash" color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Player */}
        <View style={styles.playerContainer}>
          <VideoPlayer
            videoUrl={video.videoUrl}
            title={video.title}
            timelineMarkers={video.timelineMarkers}
            tags={video.tags}
          />
        </View>

        {/* Video Metadata */}
        <View style={styles.metadataSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <IconSymbol size={16} name="calendar" color={Colors.textSecondary} />
              <Text style={styles.metadataText}>{formatDate(video.uploadedAt)}</Text>
            </View>

            <View style={styles.metadataItem}>
              <IconSymbol size={16} name="clock" color={Colors.textSecondary} />
              <Text style={styles.metadataText}>{formatDuration(video.duration)}</Text>
            </View>

            <View style={styles.metadataItem}>
              <IconSymbol size={16} name="eye" color={Colors.textSecondary} />
              <Text style={styles.metadataText}>{video.views} views</Text>
            </View>
          </View>

          {/* Teams */}
          <View style={styles.teamsContainer}>
            <View style={styles.teamBadge}>
              <Text style={styles.teamText}>{video.teamA}</Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.teamBadge}>
              <Text style={styles.teamText}>{video.teamB}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Markers / Tags */}
        {video.tags && video.tags.length > 0 && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol size={20} name="tag.fill" color={Colors.primary} />
              <Text style={styles.sectionTitle}>Key Moments</Text>
            </View>

            <View style={styles.tagsList}>
              {video.tags.map((tag: any) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.tagItem}
                  onPress={() => handleTagPress(tag.timeMillis)}
                >
                  <View style={styles.tagIcon}>
                    <IconSymbol size={20} name="play.circle.fill" color={Colors.primary} />
                  </View>
                  <View style={styles.tagContent}>
                    <Text style={styles.tagTime}>
                      {Math.floor(tag.timeMillis / 60000)}:
                      {String(Math.floor((tag.timeMillis % 60000) / 1000)).padStart(2, '0')}
                    </Text>
                    <Text style={styles.tagTitle}>{tag.playType}</Text>
                    <Text style={styles.tagPlayer}>{tag.playerName}</Text>
                  </View>
                  <IconSymbol size={16} name="chevron.right" color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol size={20} name="video.fill" color={Colors.primary} />
              <Text style={styles.sectionTitle}>Related Videos</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
            >
              {relatedVideos.map((relatedVideo: any) => (
                <TouchableOpacity
                  key={relatedVideo.id}
                  style={styles.relatedVideoCard}
                  onPress={() => handleRelatedVideoPress(relatedVideo.id)}
                >
                  <Image
                    source={{ uri: relatedVideo.thumbnail }}
                    style={styles.relatedThumbnail}
                  />
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {relatedVideo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },

  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  iconButton: {
    padding: Spacing.xs,
  },

  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surface,
  },

  metadataSection: {
    padding: Spacing.md,
  },

  videoTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  metadataText: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },

  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },

  teamBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },

  teamText: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },

  vsText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
  },

  tagsList: {
    gap: Spacing.sm,
  },

  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  tagIcon: {
    marginRight: Spacing.sm,
  },

  tagContent: {
    flex: 1,
  },

  tagTime: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },

  tagTitle: {
    fontSize: Typography.body,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },

  tagPlayer: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },

  relatedScroll: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },

  relatedVideoCard: {
    width: 160,
    marginRight: Spacing.md,
  },

  relatedThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },

  relatedTitle: {
    fontSize: Typography.footnote,
    color: Colors.text,
    lineHeight: Typography.lineHeights.normal * Typography.footnote,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },

  errorText: {
    fontSize: Typography.title3,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: Spacing.xl * 2,
  },
});
