import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export interface VideoStatus {
  videoId: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  thumbnailUrl?: string;
  createdAt: Date;
}

interface VideoStatusCardProps {
  videos: VideoStatus[];
  onVideoPress?: (videoId: string) => void;
  onViewAll?: () => void;
  onUploadPress?: () => void;
  maxDisplay?: number;
  animationDelay?: number;
}

export default function VideoStatusCard({
  videos,
  onVideoPress,
  onViewAll,
  onUploadPress,
  maxDisplay = 3,
  animationDelay = 300,
}: VideoStatusCardProps) {
  const { currentColors } = useTheme();

  const getStatusIcon = (status: VideoStatus['status']) => {
    switch (status) {
      case 'completed': return 'checkmark.circle.fill';
      case 'processing': return 'arrow.trianglehead.2.clockwise.rotate.90';
      case 'pending': return 'clock.fill';
      case 'failed': return 'exclamationmark.circle.fill';
      default: return 'circle';
    }
  };

  const getStatusColor = (status: VideoStatus['status']) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'processing': return Colors.info;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      default: return currentColors.textSecondary;
    }
  };

  const getStatusText = (video: VideoStatus) => {
    switch (video.status) {
      case 'completed': return 'Analysis Complete';
      case 'processing': return `Processing ${video.progress || 0}%`;
      case 'pending': return 'Queued';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const displayedVideos = videos.slice(0, maxDisplay);

  if (videos.length === 0) {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol name="video.fill" size={18} color={currentColors.primary} />
            <Text style={[styles.title, { color: currentColors.text }]}>
              Video Status
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.emptyCard, { backgroundColor: currentColors.cardBackground }]}
          onPress={onUploadPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Upload your first game film"
        >
          <View style={[styles.uploadIcon, { backgroundColor: Colors.primary + '15' }]}>
            <IconSymbol name="arrow.up.circle.fill" size={28} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
            No videos yet
          </Text>
          <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
            Upload game film to get AI-powered insights
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(400)}
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Video processing status"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="video.fill" size={18} color={currentColors.primary} />
          <Text style={[styles.title, { color: currentColors.text }]}>
            Video Status
          </Text>
        </View>
        {onViewAll && videos.length > maxDisplay && (
          <TouchableOpacity
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel="View all videos"
          >
            <Text style={[styles.viewAll, { color: Colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Video List */}
      <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
        {displayedVideos.map((video, index) => (
          <TouchableOpacity
            key={video.videoId}
            style={[
              styles.videoItem,
              index < displayedVideos.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: currentColors.border,
              },
            ]}
            onPress={() => onVideoPress?.(video.videoId)}
            activeOpacity={onVideoPress ? 0.7 : 1}
            accessibilityRole="button"
            accessibilityLabel={`${video.title}, ${getStatusText(video)}`}
          >
            {/* Status Icon */}
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(video.status) + '15' },
              ]}
            >
              <IconSymbol
                name={getStatusIcon(video.status)}
                size={18}
                color={getStatusColor(video.status)}
              />
            </View>

            {/* Video Info */}
            <View style={styles.videoInfo}>
              <Text
                style={[styles.videoTitle, { color: currentColors.text }]}
                numberOfLines={1}
              >
                {video.title}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor(video.status) }]}>
                {getStatusText(video)}
              </Text>
            </View>

            {/* Progress Bar (for processing) */}
            {video.status === 'processing' && video.progress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: currentColors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: Colors.info,
                        width: `${video.progress}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Chevron for completed */}
            {video.status === 'completed' && (
              <IconSymbol
                name="chevron.right"
                size={14}
                color={currentColors.textLight}
              />
            )}
          </TouchableOpacity>
        ))}

        {/* Upload More Button */}
        {onUploadPress && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={onUploadPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Upload new video"
          >
            <IconSymbol name="plus.circle.fill" size={18} color={Colors.primary} />
            <Text style={[styles.uploadText, { color: Colors.primary }]}>
              Upload New Film
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.small,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
  progressContainer: {
    width: 50,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: Spacing.xs,
  },
  uploadText: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },
});
