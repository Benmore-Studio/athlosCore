import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import videoService from '@/services/api/videoService';
import { useVideoStore } from '@/stores';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Typography, Shadows, Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';
import AsyncStorage from '@react-native-async-storage/async-storage';

function VideosScreenContent() {
  const router = useRouter();
  const { currentColors, isDark } = useTheme();
  
  // ✅ Use Zustand store instead of local state
  const {
    videos,
    setVideos,
    isLoading,
    error,
    setLoading,
    setError
  } = useVideoStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // ✅ Get org_id from AsyncStorage
      const orgId = await AsyncStorage.getItem('current_org_id');

      console.log('📹 Fetching videos from API...');
      console.log('   Org ID:', orgId || 'all');

      // ✅ Use real API service
      const data = await videoService.getVideos({
        org_id: orgId || undefined,
        status: 'completed' // Only show completed videos
      });

      console.log('✅ Videos fetched:', data.length);

      if (data.length === 0) {
        console.log('📭 No videos found - showing empty state');
      }

      // ✅ Transform API data to match component format
      const transformedVideos = data.map((video: any) => ({
        id: video.video_id,
        title: video.title || 'Untitled Video',
        thumbnail: video.thumbnail_url,
        duration: video.duration || '--:--',
        views: video.views || '0',
        date: formatDate(video.created_at),
        videoUrl: video.gcsPath,
        uploadedAt: video.created_at,
      }));

      // ✅ Store videos in Zustand
      setVideos(transformedVideos);

    } catch (err) {
      console.error('❌ Failed to load videos:', err);
      Sentry.captureException(err, {
        tags: { screen: 'videos', action: 'load_videos' },
        extra: { isRefresh }
      });

      // Show error to user - DO NOT use mock data
      Alert.alert(
        'Unable to Load Videos',
        'Could not connect to the server. Please check your connection and try again.',
        [{ text: 'OK' }]
      );

      // Set empty state
      setVideos([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Recent';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return 'Recent';
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = () => {
    loadVideos(true);
  };

  const handleVideoPress = (videoId: string) => {
    try {
      router.push(`/video/${videoId}`);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { screen: 'videos', action: 'navigate_to_video' },
        extra: { videoId }
      });
      
      Alert.alert(
        'Navigation Error',
        'Unable to open video. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleUploadPress = () => {
    try {
      router.push('/video/upload');
    } catch (err) {
      Sentry.captureException(err, {
        tags: { screen: 'videos', action: 'navigate_to_upload' }
      });
      
      Alert.alert(
        'Navigation Error',
        'Unable to open upload screen. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderVideoCard = ({ item, index }: { item: any; index: number }) => {
    if (!item) return null;

    return (
      <Animated.View
        entering={FadeInUp.delay(100 + index * 50).duration(400)}
        style={styles.cardWrapper}
      >
        <TouchableOpacity
          onPress={() => handleVideoPress(item.id)}
          activeOpacity={0.9}
        >
          <View style={[styles.card, { backgroundColor: currentColors.cardBackground }, Shadows.large]}>
            {/* Thumbnail Section */}
            <View style={styles.thumbnailContainer}>
              {item.thumbnail ? (
                <Image 
                  source={{ uri: item.thumbnail }} 
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumbnailPlaceholder, { backgroundColor: currentColors.surface }]}>
                  <IconSymbol 
                    name="play.rectangle.fill" 
                    size={64} 
                    color={currentColors.textLight}
                  />
                </View>
              )}
              
              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.thumbnailGradient}
              />
              
              {/* Play button overlay */}
              <View style={styles.playOverlay}>
                <LinearGradient
                  colors={[Colors.primary, '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <IconSymbol name="play.fill" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Duration badge */}
              {item.duration && (
                <View style={styles.durationBadge}>
                  <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.durationBlur}>
                    <IconSymbol name="clock.fill" size={12} color="#FFFFFF" />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </BlurView>
                </View>
              )}

              {/* Corner accent */}
              <View style={[styles.cornerAccent, { backgroundColor: currentColors.primary }]} />
            </View>

            {/* Content Section */}
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <View style={[styles.iconCircle, { backgroundColor: `${currentColors.primary}20` }]}>
                  <IconSymbol name="play.circle.fill" size={20} color={currentColors.primary} />
                </View>
                <Text style={[styles.title, { color: currentColors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              
              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <IconSymbol name="eye.fill" size={14} color={currentColors.textSecondary} />
                  <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
                    {item.views || '0'}
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: currentColors.border }]} />
                <View style={styles.statItem}>
                  <IconSymbol name="calendar" size={14} color={currentColors.textSecondary} />
                  <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
                    {item.date || 'Recent'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.textSecondary }]}>
            Loading videos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && videos.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: Colors.error + '15' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={64} color={Colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>
            Unable to Load Videos
          </Text>
          <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={() => loadVideos()}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header - Matching Dashboard Style */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[Colors.primary, '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoText}>A</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Videos</Text>
            <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: currentColors.surface }]}
            onPress={handleUploadPress}
            accessibilityLabel="Upload video"
          >
            <IconSymbol name="plus" size={20} color={currentColors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Videos List */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !isLoading ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: Colors.primary + '15' }]}>
                <IconSymbol name="film.fill" size={64} color={Colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No Videos Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
                Upload your first match highlight to get started
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
                onPress={handleUploadPress}
                activeOpacity={0.7}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Upload Video</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

export default function VideosScreen() {
  return (
    <ComponentErrorBoundary componentName="VideosScreen">
      <VideosScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header - Matching Dashboard
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },

  // Mock Data Banner
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  mockDataText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },

  // Card
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  durationBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomLeftRadius: BorderRadius.xl,
  },

  // Card Content
  cardContent: {
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    fontSize: Typography.body,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.subhead,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    ...Shadows.small,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.subhead,
  },
});