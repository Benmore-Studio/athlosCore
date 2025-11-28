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
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import videoService from '@/services/api/videoService'; // ✅ Use real API service
import { useVideoStore } from '@/stores'; // ✅ Import video store
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import auth context
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Sentry from '@sentry/react-native';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Mock videos for demo/fallback
const MOCK_VIDEOS = [
  {
    id: 'mock-1',
    title: 'Warriors vs Lakers - Full Game Highlights',
    thumbnail: 'https://picsum.photos/400/300?random=1',
    duration: '12:45',
    views: '1.2K',
    date: '2 days ago',
    videoUrl: 'https://example.com/video1.mp4',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Amazing Buzzer Beater - Game Winner',
    thumbnail: 'https://picsum.photos/400/300?random=2',
    duration: '8:30',
    views: '856',
    date: '5 days ago',
    videoUrl: 'https://example.com/video2.mp4',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Top 10 Plays of the Week',
    thumbnail: 'https://picsum.photos/400/300?random=3',
    duration: '15:20',
    views: '2.5K',
    date: '1 week ago',
    videoUrl: 'https://example.com/video3.mp4',
    uploadedAt: new Date().toISOString(),
  },
];

function VideosScreenContent() {
  const router = useRouter();
  const { currentColors, isDark } = useTheme();
  const { isDemoMode } = useAuth();
  
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
  const [usingMockData, setUsingMockData] = React.useState(false);

  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // ✅ Use mock data in demo mode
      if (isDemoMode) {
        console.log('📦 Using mock videos (Demo Mode)');
        setVideos(MOCK_VIDEOS);
        setUsingMockData(true);
        return;
      }

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
      setUsingMockData(false);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load videos';

      // ✅ Fallback to mock data on error
      console.error('❌ API fetch failed, using mock data:', err);
      console.log('📦 Using mock videos (API Fallback)');
      setVideos(MOCK_VIDEOS);
      setUsingMockData(true);
      setError('Unable to connect to server. Using sample data.');

      Sentry.captureException(err, {
        tags: { screen: 'videos', action: 'load_videos' },
        extra: {
          isRefresh,
          errorMessage: errorMsg
        }
      });

      console.error('Error loading videos:', err);

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
        entering={SlideInRight.delay(index * 100).springify()}
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
                  colors={Gradients.primary.colors}
                  start={Gradients.primary.start}
                  end={Gradients.primary.end}
                  style={[styles.playButton, Shadows.primaryGlow]}
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

  // ✅ Loading state from store
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={Gradients.primary.colors}
            start={Gradients.primary.start}
            end={Gradients.primary.end}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Loading highlights...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Error state from store (only show if no videos and not using mock data)
  if (error && videos.length === 0 && !usingMockData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: `${currentColors.error}20` }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={64} color={currentColors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>
            Unable to Load Videos
          </Text>
          <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => loadVideos()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.primary.colors}
              start={Gradients.primary.start}
              end={Gradients.primary.end}
              style={[styles.retryButton, Shadows.primaryGlow]}
            >
              <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={isDark 
            ? [currentColors.headerBackground, currentColors.background]
            : [currentColors.headerBackground, currentColors.background]
          }
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.headerLeft}>
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.logoBox, Shadows.primaryGlow]}
              >
                <IconSymbol name="video.fill" size={24} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: currentColors.text }]}>
                  Match Highlights
                </Text>
                <Text style={[styles.headerSubtitle, { color: currentColors.primary }]}>
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400).duration(600)}>
              <TouchableOpacity 
                onPress={handleUploadPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Gradients.primary.colors}
                  start={Gradients.primary.start}
                  end={Gradients.primary.end}
                  style={[styles.uploadButton, Shadows.primaryGlow]}
                >
                  <IconSymbol name="arrow.up.circle.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.uploadText}>Upload</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ✅ Mock Data Banner */}
      {usingMockData && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[styles.mockDataBanner, { backgroundColor: currentColors.warning + '15' }]}
        >
          <IconSymbol 
            name="info.circle.fill" 
            size={20} 
            color={currentColors.warning}
          />
          <Text style={[styles.mockDataText, { color: currentColors.warning }]}>
            {isDemoMode ? 'Demo Mode - Sample Videos' : 'Using sample data - API unavailable'}
          </Text>
        </Animated.View>
      )}

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
              <View style={[styles.emptyIconContainer, { backgroundColor: `${currentColors.primary}20` }]}>
                <IconSymbol name="film.fill" size={64} color={currentColors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No Videos Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: currentColors.textSecondary }]}>
                Upload your first match highlight to get started
              </Text>
              <TouchableOpacity onPress={handleUploadPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={Gradients.primary.colors}
                  start={Gradients.primary.start}
                  end={Gradients.primary.end}
                  style={[styles.emptyButton, Shadows.primaryGlow]}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Upload Video</Text>
                </LinearGradient>
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

  // Header
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: Typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  uploadText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.callout,
  },

  // ✅ Mock Data Banner
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
  },

  mockDataText: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
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
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.body,
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.body,
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.body,
  },
});