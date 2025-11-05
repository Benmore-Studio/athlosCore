import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VideoPlayer from '@/components/ui/videoPlayer';
import Card from '@/components/ui/card';
import PlayerAvatar from '@/components/ui/playerAvatar';
import videoService from '@/services/api/videoService';
import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';
import * as Sentry from '@sentry/react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface VideoData {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: number;
  likes?: number;
  shares?: number;
  rating?: number;
  uploadDate?: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
    subscribers?: number;
  };
  timelineMarkers?: any[];
  tags?: string[];
  metadata?: any;
}

function VideoDetailScreenContent() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeScale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);

  useEffect(() => {
    if (id) {
      loadVideoData();
    }
  }, [id]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch streaming URL
      const { stream_url, video_metadata } = await videoService.getStreamingUrl(id);

      // Optionally fetch additional video details if you have an endpoint
      // const videoDetails = await videoService.getVideoDetails(id);

      // Construct video object from API response
      const videoData: VideoData = {
        id: id,
        title: video_metadata?.title || 'Untitled Video',
        description: video_metadata?.description,
        streamUrl: stream_url,
        thumbnailUrl: video_metadata?.thumbnail_url,
        duration: video_metadata?.duration,
        views: video_metadata?.views || 0,
        likes: video_metadata?.likes || 0,
        shares: video_metadata?.shares || 0,
        rating: video_metadata?.rating,
        uploadDate: video_metadata?.upload_date || video_metadata?.created_at,
        uploader: video_metadata?.uploader ? {
          id: video_metadata.uploader.id,
          name: video_metadata.uploader.name,
          avatar: video_metadata.uploader.avatar_url,
          subscribers: video_metadata.uploader.subscribers,
        } : undefined,
        timelineMarkers: video_metadata?.timeline_markers || [],
        tags: video_metadata?.tags || [],
        metadata: video_metadata,
      };

      setVideo(videoData);
      
      // Track video view
      await trackVideoView(id);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load video. Please try again.';
      setError(errorMsg);
      
      Sentry.captureException(err, {
        tags: { screen: 'video_detail', action: 'load_video' },
        extra: { videoId: id, errorMessage: errorMsg }
      });
      
      console.error('Video load error:', err);
      
      Alert.alert(
        'Failed to Load Video',
        errorMsg,
        [
          { text: 'Go Back', onPress: () => router.back() },
          { text: 'Retry', onPress: loadVideoData }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const trackVideoView = async (videoId: string) => {
    try {
      // If you have an analytics endpoint
      // await videoService.trackView(videoId);
      console.log('Video view tracked:', videoId);
    } catch (err) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to track view:', err);
    }
  };

  const handleLike = async () => {
    try {
      const newLikedState = !liked;
      setLiked(newLikedState);
      
      likeScale.value = withSequence(
        withSpring(1.3, Animation.spring.bouncy),
        withSpring(1, Animation.spring.smooth)
      );

      // If you have a like endpoint
      // if (newLikedState) {
      //   await videoService.likeVideo(id);
      //   setVideo(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      // } else {
      //   await videoService.unlikeVideo(id);
      //   setVideo(prev => prev ? { ...prev, likes: Math.max((prev.likes || 0) - 1, 0) } : null);
      // }

    } catch (err) {
      setLiked(!liked); // Revert on error
      console.error('Failed to like video:', err);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleBookmark = async () => {
    try {
      const newBookmarkedState = !bookmarked;
      setBookmarked(newBookmarkedState);
      
      bookmarkScale.value = withSequence(
        withSpring(1.3, Animation.spring.bouncy),
        withSpring(1, Animation.spring.smooth)
      );

      // If you have a bookmark endpoint
      // if (newBookmarkedState) {
      //   await videoService.bookmarkVideo(id);
      // } else {
      //   await videoService.unbookmarkVideo(id);
      // }

    } catch (err) {
      setBookmarked(!bookmarked); // Revert on error
      console.error('Failed to bookmark video:', err);
      Alert.alert('Error', 'Failed to update bookmark status');
    }
  };

  const handleShare = async () => {
    try {
      // Implement share functionality
      // You can use expo-sharing or react-native-share
      Alert.alert('Share', 'Share functionality coming soon!');
    } catch (err) {
      console.error('Failed to share video:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!video?.uploader) return;
      
      // If you have a subscribe endpoint
      // await videoService.subscribeToUser(video.uploader.id);
      Alert.alert('Subscribed!', `You're now subscribed to ${video.uploader.name}`);
      
    } catch (err) {
      console.error('Failed to subscribe:', err);
      Alert.alert('Error', 'Failed to subscribe');
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    
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
      return 'Recently';
    }
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  // Loading State
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
        <Animated.View entering={FadeIn.duration(300)}>
          <LinearGradient
            colors={Gradients.primary.colors}
            start={Gradients.primary.start}
            end={Gradients.primary.end}
            style={styles.loadingGradient}
          >
            <IconSymbol 
              name="arrow.clockwise" 
              size={32} 
              color={Colors.textOnPrimary}
            />
            <Text style={styles.loadingText}>Loading video...</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  // Error State
  if (error || !video) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
          <IconSymbol 
            name="exclamationmark.triangle.fill" 
            size={48} 
            color={currentColors.error}
          />
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>
            Failed to Load Video
          </Text>
          <Text style={[styles.errorMessage, { color: currentColors.textSecondary }]}>
            {error || 'Video not found'}
          </Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity onPress={() => router.back()}>
              <View style={[styles.errorButton, { backgroundColor: currentColors.surface }]}>
                <Text style={[styles.errorButtonText, { color: currentColors.text }]}>
                  Go Back
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={loadVideoData}>
              <LinearGradient
                colors={Gradients.primary.colors}
                style={styles.errorButton}
              >
                <Text style={[styles.errorButtonText, { color: Colors.textOnPrimary }]}>
                  Retry
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <Animated.View 
          style={styles.backButton}
          entering={FadeIn.delay(100).duration(300)}
        >
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.backButtonBlur}>
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol 
                name="chevron.left" 
                size={24} 
                color={currentColors.text}
              />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Video Player */}
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <VideoPlayer
            videoUrl={video.streamUrl}
            title={video.title}
            timelineMarkers={video.timelineMarkers}
            tags={video.tags}
          />
        </Animated.View>

        {/* Video Info Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card variant="elevated" padding="large" style={styles.infoCard}>
            {/* Title */}
            <Text style={[styles.title, { color: currentColors.text }]}>
              {video.title}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <IconSymbol 
                  name="eye.fill" 
                  size={16} 
                  color={currentColors.textSecondary}
                />
                <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
                  {formatViews(video.views || 0)} views
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <IconSymbol 
                  name="clock.fill" 
                  size={16} 
                  color={currentColors.textSecondary}
                />
                <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
                  {video.duration || '--:--'}
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <IconSymbol 
                  name="calendar" 
                  size={16} 
                  color={currentColors.textSecondary}
                />
                <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
                  {formatDate(video.uploadDate)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <AnimatedPressable 
                onPress={handleLike}
                style={[likeAnimatedStyle]}
              >
                <LinearGradient
                  colors={liked ? Gradients.primary.colors : [currentColors.surface, currentColors.surface]}
                  style={[styles.actionButton, liked && Shadows.primaryGlow]}
                >
                  <IconSymbol 
                    name="heart.fill" 
                    size={20} 
                    color={liked ? Colors.textOnPrimary : currentColors.textSecondary}
                  />
                  <Text style={[
                    styles.actionButtonText, 
                    { color: liked ? Colors.textOnPrimary : currentColors.textSecondary }
                  ]}>
                    {liked ? 'Liked' : 'Like'}
                  </Text>
                </LinearGradient>
              </AnimatedPressable>

              <AnimatedPressable 
                onPress={handleBookmark}
                style={[bookmarkAnimatedStyle]}
              >
                <View style={[
                  styles.actionButton,
                  { backgroundColor: currentColors.surface },
                  bookmarked && { borderWidth: 2, borderColor: currentColors.primary }
                ]}>
                  <IconSymbol 
                    name="bookmark.fill" 
                    size={20} 
                    color={bookmarked ? currentColors.primary : currentColors.textSecondary}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    { color: bookmarked ? currentColors.primary : currentColors.textSecondary }
                  ]}>
                    {bookmarked ? 'Saved' : 'Save'}
                  </Text>
                </View>
              </AnimatedPressable>

              <TouchableOpacity onPress={handleShare}>
                <View style={[styles.actionButton, { backgroundColor: currentColors.surface }]}>
                  <IconSymbol 
                    name="square.and.arrow.up" 
                    size={20} 
                    color={currentColors.textSecondary}
                  />
                  <Text style={[styles.actionButtonText, { color: currentColors.textSecondary }]}>
                    Share
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {/* Uploader Info */}
        {video.uploader && (
          <Animated.View entering={SlideInRight.delay(400).springify()}>
            <Card variant="elevated" padding="medium" style={styles.uploaderCard}>
              <View style={styles.uploaderRow}>
                <PlayerAvatar 
                  name={video.uploader.name}
                  imageUri={video.uploader.avatar}
                  size="medium"
                  variant="gradient"
                />
                
                <View style={styles.uploaderInfo}>
                  <Text style={[styles.uploaderName, { color: currentColors.text }]}>
                    {video.uploader.name}
                  </Text>
                  <Text style={[styles.uploaderSubs, { color: currentColors.textSecondary }]}>
                    {video.uploader.subscribers 
                      ? `${formatViews(video.uploader.subscribers)} subscribers`
                      : 'No subscribers yet'
                    }
                  </Text>
                </View>

                <TouchableOpacity onPress={handleSubscribe}>
                  <LinearGradient
                    colors={Gradients.primary.colors}
                    style={styles.subscribeButton}
                  >
                    <Text style={styles.subscribeText}>Subscribe</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Description */}
        {video.description && (
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Card variant="outlined" padding="large" style={styles.descriptionCard}>
              <View style={styles.descriptionHeader}>
                <IconSymbol 
                  name="doc.text" 
                  size={20} 
                  color={currentColors.primary}
                />
                <Text style={[styles.descriptionTitle, { color: currentColors.text }]}>
                  Description
                </Text>
              </View>
              <Text style={[styles.descriptionText, { color: currentColors.textSecondary }]}>
                {video.description}
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Video Stats Card */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card variant="gradient" padding="large" style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Video Performance</Text>
            
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <IconSymbol 
                  name="heart.fill" 
                  size={24} 
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.performanceValue}>
                  {formatViews(video.likes || 0)}
                </Text>
                <Text style={styles.performanceLabel}>Likes</Text>
              </View>

              <View style={styles.performanceDivider} />

              <View style={styles.performanceItem}>
                <IconSymbol 
                  name="star.fill" 
                  size={24} 
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.performanceValue}>
                  {video.rating?.toFixed(1) || 'N/A'}
                </Text>
                <Text style={styles.performanceLabel}>Rating</Text>
              </View>

              <View style={styles.performanceDivider} />

              <View style={styles.performanceItem}>
                <IconSymbol 
                  name="square.and.arrow.up" 
                  size={24} 
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.performanceValue}>
                  {formatViews(video.shares || 0)}
                </Text>
                <Text style={styles.performanceLabel}>Shares</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default function VideoDetailScreen() {
  return (
    <ComponentErrorBoundary componentName="VideoDetailScreen">
      <VideoDetailScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingGradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.large,
  },
  loadingText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  errorButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl + 10,
    left: Spacing.lg,
    zIndex: 100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.md,
    lineHeight: Typography.title3 * 1.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  uploaderCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  uploaderInfo: {
    flex: 1,
  },
  uploaderName: {
    fontSize: Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  uploaderSubs: {
    fontSize: Typography.footnote,
  },
  subscribeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  subscribeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  descriptionCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  descriptionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.5,
  },
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  statsCardTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    marginBottom: Spacing.lg,
  },
  performanceGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  performanceValue: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  performanceLabel: {
    fontSize: Typography.footnote,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
  performanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import Animated, {
//   FadeIn,
//   FadeInDown,
//   SlideInRight,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withSequence,
//   withTiming,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
// import VideoPlayer from '@/components/ui/videoPlayer';
// import Card from '@/components/ui/card';
// import PlayerAvatar from '@/components/ui/playerAvatar';
// import { fetchVideoById } from '@/services/videoService';
// import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from '@/constants/theme';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// export default function VideoDetailScreen() {
//   const theme = useColorScheme() ?? 'light';
//   const isDark = theme === 'dark';
//   const currentColors = isDark ? DarkColors : Colors;
//   const router = useRouter();

//   const { id } = useLocalSearchParams();
//   const [video, setVideo] = useState<any>(null);
//   const [liked, setLiked] = useState(false);
//   const [bookmarked, setBookmarked] = useState(false);

//   const likeScale = useSharedValue(1);
//   const bookmarkScale = useSharedValue(1);

//   useEffect(() => {
//     (async () => {
//       const data = await fetchVideoById(id as string);
//       setVideo(data);
//     })();
//   }, [id]);

//   const handleLike = () => {
//     setLiked(!liked);
//     likeScale.value = withSequence(
//       withSpring(1.3, Animation.spring.bouncy),
//       withSpring(1, Animation.spring.smooth)
//     );
//   };

//   const handleBookmark = () => {
//     setBookmarked(!bookmarked);
//     bookmarkScale.value = withSequence(
//       withSpring(1.3, Animation.spring.bouncy),
//       withSpring(1, Animation.spring.smooth)
//     );
//   };

//   const likeAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: likeScale.value }],
//   }));

//   const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: bookmarkScale.value }],
//   }));

//   if (!video) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
//         <Animated.View entering={FadeIn.duration(300)}>
//           <LinearGradient
//             colors={Gradients.primary.colors}
//             start={Gradients.primary.start}
//             end={Gradients.primary.end}
//             style={styles.loadingGradient}
//           >
//             <IconSymbol 
//               name="arrow.clockwise" 
//               size={32} 
//               color={'dark'}
//               animated
//               animationType="rotate"
//             />
//             <Text style={styles.loadingText}>Loading video...</Text>
//           </LinearGradient>
//         </Animated.View>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: currentColors.background }]}>
//       <ScrollView 
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* Back Button */}
//         <Animated.View 
//           style={styles.backButton}
//           entering={FadeIn.delay(100).duration(300)}
//         >
//           <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.backButtonBlur}>
//             <TouchableOpacity onPress={() => router.back()}>
//               <IconSymbol 
//                 name="chevron.left" 
//                 size={24} 
//                 color={currentColors.text}
//               />
//             </TouchableOpacity>
//           </BlurView>
//         </Animated.View>

//         {/* Video Player */}
//         <Animated.View entering={FadeIn.delay(200).duration(400)}>
//           <VideoPlayer
//             videoUrl={video.videoUrl}
//             title={video.title}
//             timelineMarkers={video.timelineMarkers}
//             tags={video.tags}
//           />
//         </Animated.View>

//         {/* Video Info Section */}
//         <Animated.View entering={FadeInDown.delay(300).springify()}>
//           <Card variant="elevated" padding="large" style={styles.infoCard}>
//             {/* Title */}
//             <Text style={[styles.title, { color: currentColors.text }]}>
//               {video.title}
//             </Text>

//             {/* Stats Row */}
//             <View style={styles.statsRow}>
//               <View style={styles.statItem}>
//                 <IconSymbol 
//                   name="eye.fill" 
//                   size={16} 
//                   color={currentColors.textSecondary}
//                 />
//                 <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
//                   {video.views || '1.2K'} views
//                 </Text>
//               </View>
              
//               <View style={styles.statDivider} />
              
//               <View style={styles.statItem}>
//                 <IconSymbol 
//                   name="clock.fill" 
//                   size={16} 
//                   color={currentColors.textSecondary}
//                 />
//                 <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
//                   {video.duration || '5:24'}
//                 </Text>
//               </View>
              
//               <View style={styles.statDivider} />
              
//               <View style={styles.statItem}>
//                 <IconSymbol 
//                   name="calendar" 
//                   size={16} 
//                   color={currentColors.textSecondary}
//                 />
//                 <Text style={[styles.statText, { color: currentColors.textSecondary }]}>
//                   {video.uploadDate || '2 days ago'}
//                 </Text>
//               </View>
//             </View>

//             {/* Action Buttons */}
//             <View style={styles.actionRow}>
//               <AnimatedPressable 
//                 onPress={handleLike}
//                 style={[likeAnimatedStyle]}
//               >
//                 <LinearGradient
//                   colors={liked ? Gradients.primary.colors : [currentColors.surface, currentColors.surface]}
//                   style={[styles.actionButton, liked && Shadows.primaryGlow]}
//                 >
//                   <IconSymbol 
//                     name="heart.fill" 
//                     size={20} 
//                     color={liked ? 'dark' : currentColors.textSecondary}
//                   />
//                   <Text style={[
//                     styles.actionButtonText, 
//                     { color: liked ? 'dark' : currentColors.textSecondary }
//                   ]}>
//                     {liked ? 'Liked' : 'Like'}
//                   </Text>
//                 </LinearGradient>
//               </AnimatedPressable>

//               <AnimatedPressable 
//                 onPress={handleBookmark}
//                 style={[bookmarkAnimatedStyle]}
//               >
//                 <View style={[
//                   styles.actionButton,
//                   { backgroundColor: currentColors.surface },
//                   bookmarked && { borderWidth: 2, borderColor: currentColors.primary }
//                 ]}>
//                   <IconSymbol 
//                     name="bookmark.fill" 
//                     size={20} 
//                     color={bookmarked ? currentColors.primary : currentColors.textSecondary}
//                   />
//                   <Text style={[
//                     styles.actionButtonText,
//                     { color: bookmarked ? currentColors.primary : currentColors.textSecondary }
//                   ]}>
//                     {bookmarked ? 'Saved' : 'Save'}
//                   </Text>
//                 </View>
//               </AnimatedPressable>

//               <TouchableOpacity>
//                 <View style={[styles.actionButton, { backgroundColor: currentColors.surface }]}>
//                   <IconSymbol 
//                     name="square.and.arrow.up" 
//                     size={20} 
//                     color={currentColors.textSecondary}
//                   />
//                   <Text style={[styles.actionButtonText, { color: currentColors.textSecondary }]}>
//                     Share
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Uploader Info */}
//         {video.uploader && (
//           <Animated.View entering={SlideInRight.delay(400).springify()}>
//             <Card variant="elevated" padding="medium" style={styles.uploaderCard}>
//               <View style={styles.uploaderRow}>
//                 <PlayerAvatar 
//                   name={video.uploader.name}
//                   imageUri={video.uploader.avatar}
//                   size="medium"
//                   variant="gradient"
//                 />
                
//                 <View style={styles.uploaderInfo}>
//                   <Text style={[styles.uploaderName, { color: currentColors.text }]}>
//                     {video.uploader.name}
//                   </Text>
//                   <Text style={[styles.uploaderSubs, { color: currentColors.textSecondary }]}>
//                     {video.uploader.subscribers || '1.5K'} subscribers
//                   </Text>
//                 </View>

//                 <TouchableOpacity>
//                   <LinearGradient
//                     colors={Gradients.primary.colors}
//                     style={styles.subscribeButton}
//                   >
//                     <Text style={styles.subscribeText}>Subscribe</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </Card>
//           </Animated.View>
//         )}

//         {/* Description */}
//         {video.description && (
//           <Animated.View entering={FadeInDown.delay(500).springify()}>
//             <Card variant="outlined" padding="large" style={styles.descriptionCard}>
//               <View style={styles.descriptionHeader}>
//                 <IconSymbol 
//                   name="doc.on.doc" 
//                   size={20} 
//                   color={currentColors.primary}
//                 />
//                 <Text style={[styles.descriptionTitle, { color: currentColors.text }]}>
//                   Description
//                 </Text>
//               </View>
//               <Text style={[styles.descriptionText, { color: currentColors.textSecondary }]}>
//                 {video.description}
//               </Text>
//             </Card>
//           </Animated.View>
//         )}

//         {/* Video Stats Card */}
//         <Animated.View entering={FadeInDown.delay(600).springify()}>
//           <Card variant="gradient" padding="large" style={styles.statsCard}>
//             <Text style={styles.statsCardTitle}>Video Performance</Text>
            
//             <View style={styles.performanceGrid}>
//               <View style={styles.performanceItem}>
//                 <IconSymbol 
//                   name="heart.fill" 
//                   size={24} 
//                   color={'dark'}
//                 />
//                 <Text style={styles.performanceValue}>{video.likes || '342'}</Text>
//                 <Text style={styles.performanceLabel}>Likes</Text>
//               </View>

//               <View style={styles.performanceDivider} />

//               <View style={styles.performanceItem}>
//                 <IconSymbol 
//                   name="star.fill" 
//                   size={24} 
//                   color={'dark'}
//                 />
//                 <Text style={styles.performanceValue}>{video.rating || '4.8'}</Text>
//                 <Text style={styles.performanceLabel}>Rating</Text>
//               </View>

//               <View style={styles.performanceDivider} />

//               <View style={styles.performanceItem}>
//                 <IconSymbol 
//                   name="square.and.arrow.up" 
//                   size={24} 
//                   color={'dark'}
//                 />
//                 <Text style={styles.performanceValue}>{video.shares || '89'}</Text>
//                 <Text style={styles.performanceLabel}>Shares</Text>
//               </View>
//             </View>
//           </Card>
//         </Animated.View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   scrollContent: {
//     paddingBottom: Spacing.xxxl,
//   },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loadingGradient: {
//     paddingVertical: Spacing.xl,
//     paddingHorizontal: Spacing.xxl,
//     borderRadius: BorderRadius.xl,
//     alignItems: 'center',
//     gap: Spacing.md,
//     ...Shadows.large,
//   },

//   loadingText: {
//     color: 'dark',
//     fontSize: Typography.body,
//     fontWeight: '600',
//   },

//   // Back Button
//   backButton: {
//     position: 'absolute',
//     top: Spacing.xl + 10,
//     left: Spacing.lg,
//     zIndex: 100,
//     borderRadius: BorderRadius.full,
//     overflow: 'hidden',
//     ...Shadows.medium,
//   },

//   backButtonBlur: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   // Info Card
//   infoCard: {
//     marginHorizontal: Spacing.lg,
//     marginTop: Spacing.lg,
//   },

//   title: {
//     fontSize: Typography.title3,
//     fontWeight: '700',
//     marginBottom: Spacing.md,
//     lineHeight: Typography.title3 * 1.3,
//   },

//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: Spacing.lg,
//   },

//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//   },

//   statText: {
//     fontSize: Typography.footnote,
//     fontWeight: '500',
//   },

//   statDivider: {
//     width: 1,
//     height: 12,
//     backgroundColor: Colors.border,
//     marginHorizontal: Spacing.sm,
//   },

//   actionRow: {
//     flexDirection: 'row',
//     gap: Spacing.sm,
//   },

//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     paddingVertical: Spacing.sm,
//     paddingHorizontal: Spacing.md,
//     borderRadius: BorderRadius.full,
//     flex: 1,
//     justifyContent: 'center',
//   },

//   actionButtonText: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   // Uploader Card
//   uploaderCard: {
//     marginHorizontal: Spacing.lg,
//     marginTop: Spacing.lg,
//   },

//   uploaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.md,
//   },

//   uploaderInfo: {
//     flex: 1,
//   },

//   uploaderName: {
//     fontSize: Typography.body,
//     fontWeight: '600',
//     marginBottom: Spacing.xs / 2,
//   },

//   uploaderSubs: {
//     fontSize: Typography.footnote,
//   },

//   subscribeButton: {
//     paddingVertical: Spacing.sm,
//     paddingHorizontal: Spacing.lg,
//     borderRadius: BorderRadius.full,
//     ...Shadows.small,
//   },

//   subscribeText: {
//     color: 'dark',
//     fontSize: Typography.callout,
//     fontWeight: '700',
//   },

//   // Description Card
//   descriptionCard: {
//     marginHorizontal: Spacing.lg,
//     marginTop: Spacing.lg,
//   },

//   descriptionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     marginBottom: Spacing.md,
//   },

//   descriptionTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//   },

//   descriptionText: {
//     fontSize: Typography.callout,
//     lineHeight: Typography.callout * 1.5,
//   },

//   // Stats Card
//   statsCard: {
//     marginHorizontal: Spacing.lg,
//     marginTop: Spacing.lg,
//   },

//   statsCardTitle: {
//     fontSize: Typography.headline,
//     fontWeight: '700',
//     color: 'dark',
//     marginBottom: Spacing.lg,
//   },

//   performanceGrid: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   performanceItem: {
//     flex: 1,
//     alignItems: 'center',
//     gap: Spacing.xs,
//   },

//   performanceValue: {
//     fontSize: Typography.title3,
//     fontWeight: '700',
//     color: 'dark',
//   },

//   performanceLabel: {
//     fontSize: Typography.footnote,
//     color: 'dark',
//     opacity: 0.8,
//   },

//   performanceDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
// });