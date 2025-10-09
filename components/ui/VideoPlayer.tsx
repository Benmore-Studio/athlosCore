import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

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
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  playerName?: string;
  playType: string;
  duration?: number; // how long to show the tag in milliseconds
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

export default function VideoPlayer({
  videoUrl,
  title,
  timelineMarkers = [],
  tags = [],
  onPlaybackUpdate,
  style
}: VideoPlayerProps) {
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

  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const [currentRateIndex, setCurrentRateIndex] = useState(2); // 1.0x default

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && status.isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls, status.isPlaying]);

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

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const changePlaybackRate = async () => {
    const nextIndex = (currentRateIndex + 1) % playbackRates.length;
    const nextRate = playbackRates[nextIndex];

    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextRate, true);
      setCurrentRateIndex(nextIndex);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    if (videoRef.current) {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    }
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
      const tagDuration = tag.duration || 3000; // Default 3 seconds
      const tagEndTime = tag.timeMillis + tagDuration;
      return status.positionMillis >= tag.timeMillis && status.positionMillis <= tagEndTime;
    });
  };

  const getMarkerIcon = (type: string): string => {
    switch (type) {
      case 'score': return 'star.fill';
      case 'turnover': return 'x.circle.fill';
      case 'foul': return 'exclamationmark.triangle.fill';
      case 'timeout': return 'pause.circle.fill';
      case 'substitution': return 'arrow.triangle.2.circlepath';
      case 'quarter': return 'flag.fill';
      default: return 'circle.fill';
    }
  };

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

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={styles.title}>{title}</Text>
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
          <View
            key={tag.id}
            style={[
              styles.tagOverlay,
              {
                left: `${tag.x}%`,
                top: `${tag.y}%`,
              }
            ]}
          >
            <View style={styles.tagBubble}>
              <Text style={styles.tagText}>{tag.playType}</Text>
              {tag.playerName && (
                <Text style={styles.tagPlayerText}>{tag.playerName}</Text>
              )}
            </View>
          </View>
        ))}

        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Main Play/Pause Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <IconSymbol
                name={status.isPlaying ? 'pause.fill' : 'play.fill'}
                size={32}
                color={Colors.textOnPrimary}
              />
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
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
                    minimumTrackTintColor={Colors.primary}
                    maximumTrackTintColor={Colors.overlayLight}
                    thumbTintColor={Colors.primary}
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
                      <IconSymbol
                        name={getMarkerIcon(marker.type)}
                        size={12}
                        color={getMarkerColor(marker.type)}
                      />
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
                  <Text style={styles.speedText}>
                    {playbackRates[currentRateIndex]}x
                  </Text>
                </TouchableOpacity>

                {/* Fullscreen Toggle */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFullscreen}
                >
                  <IconSymbol
                    name={isFullscreen ? 'arrow.down.right.and.arrow.up.left' : 'arrow.up.left.and.arrow.down.right'}
                    size={20}
                    color={Colors.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Loading Indicator */}
        {!status.isLoaded && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  title: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
    aspectRatio: 16 / 9, // Standard video aspect ratio
    borderRadius: BorderRadius.md,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BorderRadius.full,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },

  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  slider: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    height: 20,
  },

  timeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },

  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controlButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 50,
    alignItems: 'center',
  },

  speedText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
  },

  // Timeline and Tag Overlay Styles
  sliderContainer: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    position: 'relative',
    height: 20,
  },

  timelineMarker: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    transform: [{ translateX: -12 }], // Center on position
  },

  tagOverlay: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -100 }], // Center horizontally, position above
    zIndex: 10,
  },

  tagBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    minWidth: 80,
  },

  tagText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '600',
    textAlign: 'center',
  },

  tagPlayerText: {
    color: Colors.primary,
    fontSize: Typography.caption,
    textAlign: 'center',
    marginTop: 2,
  },
});