import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from "expo-blur";
import Slider from '@react-native-community/slider';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DarkColors, Typography, BorderRadius, Spacing, Shadows, Gradients, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TimelineMarker {
  id: string;
  timeMillis: number;
  type: 'score' | 'turnover' | 'foul' | 'timeout' | 'substitution' | 'quarter';
  title: string;
  description?: string;
}

interface VideoTag {
  id: string;
  timeMillis: number;
  x: number;
  y: number;
  playerName?: string;
  playType: string;
  duration?: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  timelineMarkers?: TimelineMarker[];
  tags?: VideoTag[];
  onPlaybackUpdate?: (status: AVPlaybackStatus) => void;
  style?: any;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  rate: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Frame duration at 30 FPS (standard video framerate)
const FRAME_DURATION_MS = 1000 / 30; // ~33.33ms per frame

// AsyncStorage key for video speed preference
const VIDEO_SPEED_KEY = '@video_playback_speed';

export default function VideoPlayer({
  videoUrl,
  title,
  timelineMarkers = [],
  tags = [],
  onPlaybackUpdate,
  style
}: VideoPlayerProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    rate: 1.0,
  });
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const [currentRateIndex, setCurrentRateIndex] = useState(2); // Default to 1.0x
  const [isLoadingSpeed, setIsLoadingSpeed] = useState(true);

  const controlsOpacity = useSharedValue(1);
  const playButtonScale = useSharedValue(1);
  const frameButtonScale = useSharedValue(1);

  // Load saved playback speed on mount
  useEffect(() => {
    loadSavedPlaybackSpeed();
  }, []);

  // Apply saved speed to video when it loads
  useEffect(() => {
    if (status.isLoaded && !isLoadingSpeed && videoRef.current) {
      const savedRate = playbackRates[currentRateIndex];
      if (savedRate !== status.rate) {
        videoRef.current.setRateAsync(savedRate, true);
      }
    }
  }, [status.isLoaded, isLoadingSpeed, currentRateIndex]);

  const loadSavedPlaybackSpeed = async () => {
    try {
      const savedSpeed = await AsyncStorage.getItem(VIDEO_SPEED_KEY);
      
      if (savedSpeed !== null) {
        const savedRate = parseFloat(savedSpeed);
        const savedIndex = playbackRates.indexOf(savedRate);
        
        if (savedIndex !== -1) {
          setCurrentRateIndex(savedIndex);
          console.log(`Loaded saved playback speed: ${savedRate}x`);
        }
      }
    } catch (error) {
      console.error('Error loading playback speed:', error);
    } finally {
      setIsLoadingSpeed(false);
    }
  };

  const savePlaybackSpeed = async (rate: number) => {
    try {
      await AsyncStorage.setItem(VIDEO_SPEED_KEY, rate.toString());
      console.log(`Saved playback speed: ${rate}x`);
    } catch (error) {
      console.error('Error saving playback speed:', error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Only hide controls if: playing AND not interacting AND controls are shown
    if (showControls && status.isPlaying && !isInteracting) {
      timer = setTimeout(() => {
        setShowControls(false);
        controlsOpacity.value = withTiming(0, { duration: 300 });
      }, 5000);
    } else if (showControls) {
      controlsOpacity.value = withTiming(1, { duration: 300 });
    }
    return () => clearTimeout(timer);
  }, [showControls, status.isPlaying, isInteracting]);

  // Keyboard support for frame navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepBackwardOneFrame();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepForwardOneFrame();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    // Add keyboard listener for web
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [status.positionMillis, status.durationMillis]);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setStatus({
        isLoaded: playbackStatus.isLoaded,
        isPlaying: playbackStatus.isPlaying || false,
        positionMillis: playbackStatus.positionMillis || 0,
        durationMillis: playbackStatus.durationMillis || 0,
        rate: playbackStatus.rate || 1.0,
      });
      onPlaybackUpdate?.(playbackStatus);
    }
  };

  const handleInteractionStart = () => {
    setIsInteracting(true);
    setShowControls(true);
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      handleInteractionStart();
      playButtonScale.value = withSpring(0.8, Animation.spring.snappy);
      setTimeout(() => {
        playButtonScale.value = withSpring(1, Animation.spring.bouncy);
        handleInteractionEnd();
      }, 100);

      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const stepForwardOneFrame = async () => {
    if (videoRef.current && status.isLoaded) {
      handleInteractionStart();
      // Pause if playing
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      }

      // Calculate next frame position
      const newPosition = Math.min(
        status.positionMillis + FRAME_DURATION_MS,
        status.durationMillis
      );

      // Seek to next frame
      await videoRef.current.setPositionAsync(newPosition);
      
      // Visual feedback
      frameButtonScale.value = withSpring(0.9, Animation.spring.snappy);
      setTimeout(() => {
        frameButtonScale.value = withSpring(1, Animation.spring.bouncy);
        handleInteractionEnd();
      }, 100);
    }
  };

  const stepBackwardOneFrame = async () => {
    if (videoRef.current && status.isLoaded) {
      handleInteractionStart();
      // Pause if playing
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      }

      // Calculate previous frame position
      const newPosition = Math.max(
        status.positionMillis - FRAME_DURATION_MS,
        0
      );

      // Seek to previous frame
      await videoRef.current.setPositionAsync(newPosition);
      
      // Visual feedback
      frameButtonScale.value = withSpring(0.9, Animation.spring.snappy);
      setTimeout(() => {
        frameButtonScale.value = withSpring(1, Animation.spring.bouncy);
        handleInteractionEnd();
      }, 100);
    }
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      handleInteractionStart();
      await videoRef.current.setPositionAsync(value);
    }
  };

  const handleSeeking = () => {
    handleInteractionStart();
  };

  const handleSeekComplete = () => {
    handleInteractionEnd();
  };

  const changePlaybackRate = async () => {
    handleInteractionStart();
    const nextIndex = (currentRateIndex + 1) % playbackRates.length;
    const nextRate = playbackRates[nextIndex];

    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextRate, true);
      setCurrentRateIndex(nextIndex);
      
      // Save the new speed preference
      await savePlaybackSpeed(nextRate);
    }
    
    setTimeout(() => {
      handleInteractionEnd();
    }, 500);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    handleInteractionStart();
    if (videoRef.current) {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    }
    setTimeout(() => {
      handleInteractionEnd();
    }, 500);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
  };

  const getMarkerPosition = (timeMillis: number): number => {
    if (status.durationMillis === 0) return 0;
    return (timeMillis / status.durationMillis) * 100;
  };

  const jumpToMarker = async (timeMillis: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(timeMillis);
    }
  };

  const getActiveTagsAtCurrentTime = (): VideoTag[] => {
    return tags.filter(tag => {
      const tagDuration = tag.duration || 3000;
      const tagEndTime = tag.timeMillis + tagDuration;
      return status.positionMillis >= tag.timeMillis && status.positionMillis <= tagEndTime;
    });
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const frameButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: frameButtonScale.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      {title && (
        <LinearGradient
          colors={[currentColors.surface, 'transparent']}
          style={styles.titleContainer}
        >
          <Text style={[styles.title, { color: currentColors.text }]}>{title}</Text>
        </LinearGradient>
      )}

      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoTouchable}
          onPress={showControlsTemporarily}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            shouldPlay={false}
            isLooping={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            useNativeControls={false}
          />
        </TouchableOpacity>

        {/* Video Tag Overlays */}
        {getActiveTagsAtCurrentTime().map(tag => (
          <Animated.View
            key={tag.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={[
              styles.tagOverlay,
              {
                left: `${tag.x}%`,
                top: `${tag.y}%`,
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)']}
              style={styles.tagBubble}
            >
              <View style={[styles.tagAccent, { backgroundColor: currentColors.primary }]} />
              <Text style={styles.tagText}>{tag.playType}</Text>
              {tag.playerName && (
                <Text style={[styles.tagPlayerText, { color: currentColors.primary }]}>
                  {tag.playerName}
                </Text>
              )}
            </LinearGradient>
          </Animated.View>
        ))}

        {showControls && (
          <Animated.View 
            style={styles.controlsOverlay}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Main Control Buttons */}
            <View style={styles.centerControls}>
              {/* Step Backward Frame */}
              <AnimatedPressable
                style={[styles.frameButton, frameButtonAnimatedStyle]}
                onPress={stepBackwardOneFrame}
                disabled={!status.isLoaded}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.frameButtonGradient}
                >
                  <IconSymbol
                    name="backward.frame"
                    size={28}
                    color={Colors.textOnPrimary}
                  />
                </LinearGradient>
              </AnimatedPressable>

              {/* Play/Pause Button */}
              <AnimatedPressable
                style={[styles.playButton, playButtonAnimatedStyle]}
                onPress={togglePlayPause}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.playButtonGradient}
                >
                  <IconSymbol
                    name={status.isPlaying ? 'pause.fill' : 'play.fill'}
                    size={40}
                    color={Colors.textOnPrimary}
                  />
                </LinearGradient>
              </AnimatedPressable>

              {/* Step Forward Frame */}
              <AnimatedPressable
                style={[styles.frameButton, frameButtonAnimatedStyle]}
                onPress={stepForwardOneFrame}
                disabled={!status.isLoaded}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.frameButtonGradient}
                >
                  <IconSymbol
                    name="forward.frame"
                    size={28}
                    color={Colors.textOnPrimary}
                  />
                </LinearGradient>
              </AnimatedPressable>
            </View>

            {/* Frame Navigation Hint */}
            {!status.isPlaying && status.isLoaded && (
              <Animated.View 
                entering={FadeIn.delay(500).duration(400)}
                style={styles.hintContainer}
              >
                <Text style={styles.hintText}>
                  Use ← → arrow keys for frame-by-frame
                </Text>
              </Animated.View>
            )}

            {/* Bottom Controls with Blur */}
            <View style={styles.bottomControls}>
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.95)']}
                style={styles.controlsGradient}
              >
                {/* Progress Slider with Timeline Markers */}
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(status.positionMillis)}
                  </Text>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={status.durationMillis}
                      value={status.positionMillis}
                      onValueChange={handleSeek}
                      onSlidingStart={handleSeeking}
                      onSlidingComplete={handleSeekComplete}
                      minimumTrackTintColor={currentColors.primary}
                      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                      thumbTintColor={currentColors.primary}
                    />
                    {/* Timeline Markers */}
                    {timelineMarkers.map(marker => (
                      <TouchableOpacity
                        key={marker.id}
                        style={[
                          styles.timelineMarker,
                          {
                            left: `${getMarkerPosition(marker.timeMillis)}%`,
                          }
                        ]}
                        onPress={() => jumpToMarker(marker.timeMillis)}
                      >
                        <View style={[
                          styles.markerDot,
                          { backgroundColor: getMarkerColor(marker.type) }
                        ]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(status.durationMillis)}
                  </Text>
                </View>

                {/* Control Buttons */}
                <View style={styles.controlButtons}>
                  {/* Playback Speed */}
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={changePlaybackRate}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.controlButtonGradient}
                    >
                      <View style={styles.speedButtonContent}>
                        <IconSymbol
                          name="speedometer"
                          size={16}
                          color={Colors.textOnPrimary}
                        />
                        <Text style={styles.speedText}>
                          {playbackRates[currentRateIndex]}x
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Fullscreen Toggle */}
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleFullscreen}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.controlButtonGradient}
                    >
                      <IconSymbol
                        name="arrow.up.left.and.arrow.down.right"
                        size={18}
                        color={Colors.textOnPrimary}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Loading Indicator */}
        {!status.isLoaded && (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={Gradients.primary.colors}
              style={styles.loadingGradient}
            >
              <Text style={styles.loadingText}>Loading video...</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
}

const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'score': return Colors.success;
    case 'turnover': return Colors.error;
    case 'foul': return Colors.warning;
    case 'timeout': return Colors.info;
    case 'substitution': return Colors.primary;
    case 'quarter': return Colors.textSecondary;
    default: return Colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.large,
  },

  titleContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  title: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },

  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  videoTouchable: {
    flex: 1,
  },

  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: 'auto',
    marginTop: 'auto',
  },

  frameButton: {
    opacity: 0.9,
  },

  frameButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Shadows.medium,
  },

  playButton: {},

  playButtonGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Shadows.large,
  },

  hintContainer: {
    position: 'absolute',
    top: Spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },

  hintText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '600',
  },

  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  controlsGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  slider: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    height: 24,
  },

  timeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'center',
  },

  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },

  controlButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },

  controlButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },

  speedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  speedText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.callout,
    fontWeight: '700',
  },

  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },

  loadingGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },

  loadingText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '600',
  },

  // Timeline and Tag Overlay Styles
  sliderContainer: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    position: 'relative',
    height: 24,
  },

  timelineMarker: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },

  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  tagOverlay: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -100 }],
    zIndex: 10,
  },

  tagBubble: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 100,
    ...Shadows.large,
    overflow: 'hidden',
  },

  tagAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  tagText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.callout,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },

  tagPlayerText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginTop: 2,
    marginLeft: Spacing.sm,
  },
});