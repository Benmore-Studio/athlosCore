import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { BlurView } from 'expo-blur';
import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from '@/constants/theme';
import { uploadVideo } from '@/services/videoService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ThumbnailOption {
  uri: string;
  timeSeconds: number;
}

// Validation constants
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
const MAX_DURATION = 3600; // 1 hour in seconds
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo']; // MP4, MOV, AVI

export default function VideoUpload({ onUploadComplete }: { onUploadComplete?: (video: any) => void }) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoSize, setVideoSize] = useState<number>(0);
  const [thumbnailOptions, setThumbnailOptions] = useState<ThumbnailOption[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'thumbnails' | 'uploading' | 'done'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const scale = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const successScale = useSharedValue(0);
  const thumbnailOpacity = useSharedValue(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateVideo = (uri: string, duration: number, fileSize?: number): boolean => {
    const errors: string[] = [];

    // Check duration
    if (duration > MAX_DURATION) {
      errors.push(`Video is too long. Maximum duration is ${MAX_DURATION / 60} minutes.`);
    }

    if (duration < 1) {
      errors.push('Video duration is invalid.');
    }

    // Check file size if available
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      errors.push(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateTitle = (title: string): boolean => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return false;
    }
    if (trimmedTitle.length < 3) {
      Alert.alert('Invalid Title', 'Title must be at least 3 characters long.');
      return false;
    }
    if (trimmedTitle.length > 100) {
      Alert.alert('Invalid Title', 'Title must be less than 100 characters.');
      return false;
    }
    return true;
  };

  const pickVideo = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select a video.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const duration = (asset.duration || 0) / 1000; // Convert to seconds
        const fileSize = asset.fileSize;

        // Validate video
        if (!validateVideo(uri, duration, fileSize)) {
          Alert.alert(
            'Invalid Video',
            validationErrors.join('\n'),
            [{ text: 'OK' }]
          );
          return;
        }

        setVideoUri(uri);
        setVideoDuration(duration);
        setVideoSize(fileSize || 0);
        setStatus('thumbnails');
        setThumbnailError(null);
        setValidationErrors([]);
        
        // Entrance animation
        scale.value = withSequence(
          withSpring(1.1, Animation.spring.bouncy),
          withSpring(1, Animation.spring.smooth)
        );

        // Generate thumbnails
        await generateThumbnails(uri, duration * 1000); // Convert back to ms
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const generateThumbnails = async (uri: string, durationMs: number) => {
    setGeneratingThumbnails(true);
    setThumbnailError(null);
    
    try {
      const timePoints = [
        Math.floor(durationMs * 0.1),
        Math.floor(durationMs * 0.5),
        Math.floor(durationMs * 0.8),
      ];

      console.log('Generating thumbnails at times (ms):', timePoints);

      const thumbnails: ThumbnailOption[] = [];

      for (let i = 0; i < timePoints.length; i++) {
        const timeMs = timePoints[i];
        
        try {
          console.log(`Generating thumbnail ${i + 1} at ${timeMs}ms`);
          
          const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, {
            time: timeMs,
            quality: 0.8,
          });

          console.log(`Thumbnail ${i + 1} generated:`, thumbUri);

          thumbnails.push({
            uri: thumbUri,
            timeSeconds: Math.floor(timeMs / 1000),
          });
        } catch (thumbError) {
          console.error(`Failed to generate thumbnail ${i + 1}:`, thumbError);
        }
      }

      if (thumbnails.length === 0) {
        throw new Error('Failed to generate any thumbnails');
      }

      setThumbnailOptions(thumbnails);
      setSelectedThumbnail(thumbnails[1]?.uri || thumbnails[0]?.uri);
      thumbnailOpacity.value = withTiming(1, { duration: 300 });

      console.log(`Successfully generated ${thumbnails.length} thumbnails`);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      setThumbnailError('Unable to generate video thumbnails. You can still upload the video.');
      setThumbnailOptions([]);
      setSelectedThumbnail(null);
      
      Alert.alert(
        'Thumbnail Generation Failed',
        'Could not create video previews, but you can still upload your video.',
        [{ text: 'OK' }]
      );
    } finally {
      setGeneratingThumbnails(false);
    }
  };

  const handleThumbnailSelect = (uri: string) => {
    setSelectedThumbnail(uri);
    scale.value = withSequence(
      withSpring(0.95, Animation.spring.snappy),
      withSpring(1, Animation.spring.bouncy)
    );
  };

  const handleUpload = async () => {
    if (!videoUri) return;

    // Validate title
    if (!validateTitle(videoTitle)) {
      return;
    }

    // Final validation check
    if (validationErrors.length > 0) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }
    
    setUploading(true);
    setStatus('uploading');
    setProgress(0);
    progressValue.value = 0;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const newProgress = p + 10;
        progressValue.value = withTiming(newProgress / 100, { duration: 300 });
        return newProgress;
      });
    }, 300);

    try {
      const uploaded = await uploadVideo(videoUri, selectedThumbnail, videoTitle.trim());
      clearInterval(interval);
      setProgress(100);
      progressValue.value = withTiming(1, { duration: 300 });
      
      setTimeout(() => {
        setStatus('done');
        setUploading(false);
        successScale.value = withSequence(
          withSpring(1.2, Animation.spring.bouncy),
          withSpring(1, Animation.spring.smooth)
        );
      }, 500);
      
      onUploadComplete?.(uploaded);
    } catch (error) {
      console.error('Upload failed', error);
      clearInterval(interval);
      setUploading(false);
      setStatus('thumbnails');
      progressValue.value = 0;
      
      Alert.alert(
        'Upload Failed',
        'Failed to upload video. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const resetUpload = () => {
    setVideoUri(null);
    setVideoTitle('');
    setThumbnailOptions([]);
    setSelectedThumbnail(null);
    setStatus('idle');
    setThumbnailError(null);
    setProgress(0);
    setValidationErrors([]);
    progressValue.value = 0;
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );
    return {
      width: `${width}%`,
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const thumbnailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
  }));

  const canUpload = videoTitle.trim().length >= 3 && (selectedThumbnail || thumbnailOptions.length === 0);

  return (
    <View style={[styles.container]}>
      {!videoUri ? (
        // Initial upload area
        <AnimatedPressable
          onPress={pickVideo}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[buttonAnimatedStyle]}
        >
          <View style={[styles.uploadArea, { borderColor: currentColors.border }]}>
            <LinearGradient
              colors={[
                isDark ? 'rgba(233, 122, 66, 0.1)' : 'rgba(233, 122, 66, 0.05)',
                isDark ? 'rgba(233, 122, 66, 0.05)' : 'rgba(233, 122, 66, 0.02)',
              ]}
              style={styles.uploadAreaGradient}
            >
              <View style={[styles.uploadIconContainer, { backgroundColor: currentColors.primary }]}>
                <IconSymbol 
                  name="video.fill" 
                  size={40} 
                  color={Colors.textOnPrimary}
                />
              </View>
              
              <Text style={[styles.uploadTitle, { color: currentColors.text }]}>
                Upload Your Video
              </Text>
              
              <Text style={[styles.uploadSubtitle, { color: currentColors.textSecondary }]}>
                Tap to select from your library
              </Text>

              <View style={styles.supportedFormats}>
                <Text style={[styles.formatText, { color: currentColors.textLight }]}>
                  MP4, MOV, AVI • Max 2GB • Max 1 hour
                </Text>
              </View>
            </LinearGradient>
          </View>
        </AnimatedPressable>
      ) : (
        // Video preview and upload form
        <Animated.View 
          style={[styles.previewSection, thumbnailAnimatedStyle]}
          entering={FadeIn.duration(300)}
        >
          {/* Video Info Card */}
          <View style={[styles.infoCard, { backgroundColor: currentColors.cardBackground }, Shadows.medium]}>
            <View style={styles.infoRow}>
              <IconSymbol name="film.fill" size={20} color={currentColors.primary} />
              <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>Duration:</Text>
              <Text style={[styles.infoValue, { color: currentColors.text }]}>
                {formatDuration(videoDuration)}
              </Text>
            </View>
            {videoSize > 0 && (
              <View style={styles.infoRow}>
                <IconSymbol name="doc.fill" size={20} color={currentColors.primary} />
                <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>Size:</Text>
                <Text style={[styles.infoValue, { color: currentColors.text }]}>
                  {formatFileSize(videoSize)}
                </Text>
              </View>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: currentColors.text }]}>
              Video Title <Text style={{ color: currentColors.error }}>*</Text>
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <IconSymbol name="text.alignleft" size={20} color={currentColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                placeholder="Enter video title (e.g. 'Championship Game Highlights')"
                placeholderTextColor={currentColors.textLight}
                value={videoTitle}
                onChangeText={setVideoTitle}
                maxLength={100}
                autoCapitalize="words"
              />
            </View>
            <Text style={[styles.inputHint, { color: currentColors.textSecondary }]}>
              {videoTitle.length}/100 characters (minimum 3)
            </Text>
          </View>

          {/* Thumbnail generation loading */}
          {generatingThumbnails && (
            <Animated.View 
              style={styles.loadingContainer}
              entering={FadeIn.duration(300)}
            >
              <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.loadingBlur}>
                <ActivityIndicator size="large" color={currentColors.primary} />
                <Text style={[styles.loadingText, { color: currentColors.text }]}>
                  Generating thumbnail options...
                </Text>
                <Text style={[styles.loadingSubtext, { color: currentColors.textSecondary }]}>
                  This may take a few moments
                </Text>
              </BlurView>
            </Animated.View>
          )}

          {/* Thumbnail selection */}
          {!generatingThumbnails && status === 'thumbnails' && (
            <>
              {thumbnailOptions.length > 0 ? (
                <Animated.View entering={FadeIn.duration(400)}>
                  <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                    Choose a Thumbnail
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
                    Select the best preview for your video
                  </Text>

                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailScroll}
                  >
                    {thumbnailOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleThumbnailSelect(option.uri)}
                        activeOpacity={0.8}
                      >
                        <View style={[
                          styles.thumbnailOption,
                          selectedThumbnail === option.uri && styles.thumbnailSelected,
                          selectedThumbnail === option.uri && { borderColor: currentColors.primary }
                        ]}>
                          <Image 
                            source={{ uri: option.uri }} 
                            style={styles.thumbnailImage}
                          />
                          
                          {selectedThumbnail === option.uri && (
                            <View style={[styles.selectedBadge, { backgroundColor: currentColors.primary }]}>
                              <IconSymbol 
                                name="checkmark.circle.fill" 
                                size={24} 
                                color={Colors.textOnPrimary}
                              />
                            </View>
                          )}

                          <LinearGradient
                            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
                            style={styles.thumbnailTimeOverlay}
                          >
                            <Text style={styles.thumbnailTimeText}>
                              {option.timeSeconds}s
                            </Text>
                          </LinearGradient>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeIn.duration(400)} style={styles.noThumbnailContainer}>
                  <View style={[styles.warningIcon, { backgroundColor: currentColors.warning }]}>
                    <IconSymbol 
                      name="exclamationmark.triangle.fill" 
                      size={32} 
                      color={Colors.textOnPrimary}
                    />
                  </View>
                  <Text style={[styles.noThumbnailText, { color: currentColors.text }]}>
                    No Thumbnails Available
                  </Text>
                  <Text style={[styles.noThumbnailSubtext, { color: currentColors.textSecondary }]}>
                    You can still upload your video without a preview
                  </Text>
                </Animated.View>
              )}

              {/* Selected thumbnail preview */}
              {selectedThumbnail && (
                <Animated.View 
                  entering={SlideInDown.delay(200).springify()}
                  style={styles.selectedPreview}
                >
                  <Text style={[styles.previewLabel, { color: currentColors.textSecondary }]}>
                    Selected Preview
                  </Text>
                  <View style={styles.selectedThumbnailContainer}>
                    <Image 
                      source={{ uri: selectedThumbnail }} 
                      style={styles.selectedThumbnailImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                      style={styles.selectedThumbnailGradient}
                    >
                      <View style={styles.videoInfo}>
                        <View style={[styles.videoIconBadge, { backgroundColor: currentColors.primary }]}>
                          <IconSymbol 
                            name="play.fill" 
                            size={16} 
                            color={Colors.textOnPrimary}
                          />
                        </View>
                        <Text style={styles.videoLabel}>Ready to Upload</Text>
                      </View>
                    </LinearGradient>
                    <View style={[styles.cornerAccent, { backgroundColor: currentColors.primary }]} />
                  </View>
                </Animated.View>
              )}

              {/* Upload button */}
              {!uploading && (
                <Animated.View entering={SlideInDown.delay(300).springify()}>
                  <AnimatedPressable
                    onPress={handleUpload}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={!canUpload}
                    style={[buttonAnimatedStyle, styles.uploadButton]}
                  >
                    <LinearGradient
                      colors={canUpload ? Gradients.primary.colors : [currentColors.border, currentColors.border]}
                      start={Gradients.primary.start}
                      end={Gradients.primary.end}
                      style={[styles.actionButton, canUpload && Shadows.primaryGlow]}
                    >
                      <IconSymbol 
                        name="paperplane.fill" 
                        size={20} 
                        color={canUpload ? Colors.textOnPrimary : currentColors.textLight}
                      />
                      <Text style={[styles.actionButtonText, { color: canUpload ? Colors.textOnPrimary : currentColors.textLight }]}>
                        Upload Video
                      </Text>
                    </LinearGradient>
                  </AnimatedPressable>
                  {!canUpload && videoTitle.trim().length < 3 && (
                    <Text style={[styles.validationText, { color: currentColors.error }]}>
                      Please enter a title to continue
                    </Text>
                  )}
                </Animated.View>
              )}
            </>
          )}

          {/* Progress section */}
          {uploading && status === 'uploading' && (
            <Animated.View 
              style={styles.progressSection}
              entering={FadeIn.duration(300)}
            >
              <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.progressBlur}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressLabelContainer}>
                    <ActivityIndicator size="small" color={currentColors.primary} />
                    <Text style={[styles.progressTitle, { color: currentColors.text }]}>
                      Uploading...
                    </Text>
                  </View>
                  <Text style={[styles.progressPercentage, { color: currentColors.primary }]}>
                    {progress}%
                  </Text>
                </View>

                <View style={[styles.progressBarBackground, { backgroundColor: currentColors.border }]}>
                  <Animated.View style={[progressAnimatedStyle]}>
                    <LinearGradient
                      colors={Gradients.primary.colors}
                      start={Gradients.primary.start}
                      end={Gradients.primary.end}
                      style={styles.progressBarFill}
                    />
                  </Animated.View>
                </View>

                <Text style={[styles.progressSubtext, { color: currentColors.textSecondary }]}>
                  Processing your video...
                </Text>
              </BlurView>
            </Animated.View>
          )}

          {/* Success state */}
          {status === 'done' && (
            <Animated.View 
              style={[styles.successContainer, successAnimatedStyle]}
              entering={FadeIn.duration(400)}
            >
              <LinearGradient
                colors={Gradients.success.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.successContent, Shadows.successGlow]}
              >
                <View style={styles.successIconContainer}>
                  <IconSymbol 
                    name="checkmark.circle.fill" 
                    size={56} 
                    color={Colors.textOnPrimary}
                  />
                </View>
                
                <Text style={styles.successTitle}>Upload Complete!</Text>
                <Text style={styles.successSubtext}>"{videoTitle}" is ready to share</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Change video button */}
          {!uploading && status !== 'done' && (
            <TouchableOpacity 
              onPress={resetUpload}
              style={styles.changeButton}
            >
              <IconSymbol 
                name="arrow.clockwise" 
                size={16} 
                color={currentColors.textSecondary}
              />
              <Text style={[styles.changeText, { color: currentColors.textSecondary }]}>
                Choose Different Video
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  uploadAreaGradient: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },

  uploadTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  uploadSubtitle: {
    fontSize: Typography.body,
    marginBottom: Spacing.lg,
  },

  supportedFormats: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: BorderRadius.md,
  },

  formatText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },

  previewSection: {
    width: '100%',
  },

  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  infoLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  infoValue: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },

  inputSection: {
    marginBottom: Spacing.lg,
  },

  inputLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: Typography.body,
    paddingVertical: Spacing.xs,
  },

  inputHint: {
    fontSize: Typography.footnote,
    marginTop: Spacing.xs,
  },

  loadingContainer: {
    width: '100%',
    paddingVertical: Spacing.xxxl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },

  loadingBlur: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: Typography.body,
    fontWeight: '600',
    marginTop: Spacing.md,
  },

  loadingSubtext: {
    fontSize: Typography.callout,
    marginTop: Spacing.xs,
  },

  sectionTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  sectionSubtitle: {
    fontSize: Typography.body,
    marginBottom: Spacing.lg,
  },

  thumbnailScroll: {
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },

  thumbnailOption: {
    width: 160,
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    ...Shadows.medium,
  },

  thumbnailSelected: {
    borderWidth: 3,
    ...Shadows.large,
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  selectedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: 12,
    ...Shadows.small,
  },

  thumbnailTimeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  thumbnailTimeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '600',
  },

  noThumbnailContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },

  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },

  noThumbnailText: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },

  noThumbnailSubtext: {
    fontSize: Typography.body,
    textAlign: 'center',
  },

  selectedPreview: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  previewLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  selectedThumbnailContainer: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.large,
  },

  selectedThumbnailImage: {
    width: '100%',
    height: '100%',
  },

  selectedThumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  videoIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },

  videoLabel: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '600',
  },

  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomLeftRadius: BorderRadius.xl,
  },

  uploadButton: {
    marginTop: Spacing.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
  },

  actionButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },

  validationText: {
    fontSize: Typography.callout,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontWeight: '600',
  },

  progressSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  progressBlur: {
    padding: Spacing.lg,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  progressTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
  },

  progressPercentage: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },

  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },

  progressSubtext: {
    fontSize: Typography.callout,
    textAlign: 'center',
  },

  successContainer: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  successContent: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },

  successIconContainer: {
    marginBottom: Spacing.md,
  },

  successTitle: {
    color: Colors.textOnPrimary,
    fontSize: Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  successSubtext: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    opacity: 0.9,
    textAlign: 'center',
  },

  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  changeText: {
    fontSize: Typography.callout,
    fontWeight: '500',
  },
});