import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  SlideInRight,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import videoService from "@/services/api/videoService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ComponentErrorBoundary } from "@/components/component-error-boundary";
import * as Sentry from "@sentry/react-native";
import { router } from "expo-router";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ✅ Debug helper to check AsyncStorage
const debugAsyncStorage = async () => {
  console.log('🔍 Debugging AsyncStorage:');
  const authToken = await AsyncStorage.getItem('auth_token');
  const orgId = await AsyncStorage.getItem('current_org_id');
  console.log('   auth_token:', authToken ? 'Present ✅' : 'Missing ❌');
  console.log('   current_org_id:', orgId || 'Missing ❌');
  return { authToken, orgId };
};

function UploadScreenContent() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoAsset, setVideoAsset] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const successScale = useSharedValue(0);
  const videoOpacity = useSharedValue(0);

  // ✅ Debug on mount
  useEffect(() => {
    debugAsyncStorage();
  }, []);

  const pickVideo = async () => {
    try {
      setError(null);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        const errorMsg = "Camera roll permission is required to select videos.";
        setError(errorMsg);
        Alert.alert(
          "Permission Required", 
          errorMsg,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => {
              console.log("Open app settings");
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        
        // Validate video file size (max 500MB)
        if (asset.fileSize && asset.fileSize > 500 * 1024 * 1024) {
          const errorMsg = "Video file size must be less than 500MB.";
          setError(errorMsg);
          Alert.alert("File Too Large", errorMsg);
          return;
        }

        // Validate video URI
        if (!asset.uri || asset.uri.trim() === '') {
          const errorMsg = "Invalid video file. Please try selecting another video.";
          setError(errorMsg);
          Alert.alert("Invalid Video", errorMsg);
          return;
        }

        console.log('✅ Video selected:', {
          uri: asset.uri.substring(0, 50) + '...',
          fileName: asset.fileName,
          fileSize: asset.fileSize,
        });

        setVideoUri(asset.uri);
        setVideoAsset(asset);
        videoOpacity.value = withTiming(1, { duration: 300 });
        setError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to select video. Please try again.";
      setError(errorMsg);
      
      Sentry.captureException(err, {
        tags: { screen: 'upload', action: 'pick_video' },
        extra: { errorMessage: errorMsg }
      });
      
      Alert.alert(
        "Selection Error", 
        errorMsg,
        [{ text: "OK" }]
      );
      
      console.error("Video selection error:", err);
    }
  };

  const handleUpload = async () => {
    try {
      if (!videoUri || !videoAsset) {
        Alert.alert("Select a Video", "Please select a video to upload.");
        return;
      }

      if (!title.trim()) {
        Alert.alert("Title Required", "Please enter a title for the video.");
        return;
      }

      // ✅ Check authentication token
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        Alert.alert(
          "Authentication Required",
          "You must be logged in to upload videos. Please log in and try again.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.replace('/(auth)/login') }
          ]
        );
        return;
      }

      // ✅ Check org_id
      const orgId = await AsyncStorage.getItem('current_org_id');
      if (!orgId) {
        Alert.alert(
          "Organization Required",
          "Please select an organization before uploading videos.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Select Org", onPress: () => router.push('/(auth)/org-selection') }
          ]
        );
        return;
      }

      setUploading(true);
      setProgress(0);
      setError(null);
      progressValue.value = 0;

      // Extract file name from URI
      const fileName = videoAsset.fileName || videoUri.split('/').pop() || `video_${Date.now()}.mp4`;

      console.log('📋 Upload prerequisites:');
      console.log('   Auth token:', authToken ? 'Present' : 'Missing');
      console.log('   Org ID:', orgId);
      console.log('   File name:', fileName);

      // Stage 1: Getting upload URL (10% progress)
      setUploadStage("Getting upload URL...");
      setProgress(10);
      progressValue.value = withTiming(0.1, { duration: 300 });

      console.log('📤 Requesting upload URL for:', fileName);
      const { upload_url, video_id } = await videoService.getUploadUrl(fileName);
      console.log('✅ Received upload URL:', upload_url ? 'Valid' : 'EMPTY', '| video_id:', video_id);

      // Validate upload URL
      if (!upload_url || upload_url.trim() === '') {
        throw new Error('Server did not provide a valid upload URL. Please try again.');
      }

      if (!video_id || video_id.trim() === '') {
        throw new Error('Server did not provide a valid video ID. Please try again.');
      }

      // Stage 2: Uploading to GCS (10% - 80% progress)
      setUploadStage("Uploading video to cloud...");
      setProgress(20);
      progressValue.value = withTiming(0.2, { duration: 300 });

      // Upload with progress tracking
      await videoService.uploadToGCS(upload_url, videoUri, (progressPercent) => {
        // Map upload progress from 20% to 80% of total progress
        const mappedProgress = 20 + (progressPercent * 0.6);
        setProgress(Math.round(mappedProgress));
        progressValue.value = withTiming(mappedProgress / 100, { duration: 200 });
      });

      // Stage 3: Saving metadata (80% - 95% progress)
      setUploadStage("Saving video details...");
      setProgress(85);
      progressValue.value = withTiming(0.85, { duration: 300 });

      // Extract GCS path without query params
      const gcsPath = upload_url.split('?')[0];

      console.log('💾 Saving video metadata:');
      console.log('   video_id:', video_id);
      console.log('   org_id:', orgId);
      console.log('   gcsPath:', gcsPath.substring(0, 60) + '...');

      await videoService.saveVideoMetadata({
        video_id,
        file_name: fileName,
        gcsPath,
        org_id: orgId,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Stage 4: Complete (100% progress)
      setUploadStage("Upload complete!");
      setProgress(100);
      progressValue.value = withTiming(1, { duration: 300 });

      setTimeout(() => {
        setUploading(false);
        successScale.value = withSequence(
          withSpring(1.2, Animation.spring.bouncy),
          withSpring(1, Animation.spring.smooth)
        );
        
        Alert.alert(
          "Upload Complete! 🎉", 
          "Your video has been uploaded successfully and will be processed shortly.",
          [
            { 
              text: "OK", 
              onPress: () => {
                // Navigate back or to videos list
                router.back();
              }
            }
          ]
        );
        
        // Reset form
        setVideoUri(null);
        setVideoAsset(null);
        setTitle("");
        setDescription("");
        setProgress(0);
        setUploadStage("");
        progressValue.value = 0;
        videoOpacity.value = 0;
        setError(null);
      }, 500);

    } catch (err) {
      setUploading(false);
      setProgress(0);
      setUploadStage("");
      progressValue.value = 0;

      // Enhanced error logging
      console.error("❌ Video upload error:", err);
      console.error("   Error type:", err instanceof Error ? err.constructor.name : typeof err);
      console.error("   Upload stage:", uploadStage);

      const errorMsg = err instanceof Error ? err.message : "Failed to upload video. Please check your connection and try again.";
      setError(errorMsg);

      Sentry.captureException(err, {
        tags: {
          screen: 'upload',
          action: 'upload_video',
          hasTitle: !!title,
          hasDescription: !!description,
          stage: uploadStage
        },
        extra: {
          errorMessage: errorMsg,
          videoUri: videoUri?.substring(0, 50),
          titleLength: title.length,
          descriptionLength: description.length,
          fileName: videoAsset?.fileName
        }
      });

      Alert.alert(
        "Upload Failed",
        errorMsg,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: handleUpload }
        ]
      );
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
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

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: currentColors.background }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header with gradient */}
        <Animated.View entering={FadeIn.duration(400)}>
          <LinearGradient
            colors={[
              isDark ? 'rgba(233, 122, 66, 0.15)' : 'rgba(233, 122, 66, 0.08)',
              'transparent'
            ]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: currentColors.surface }]}
                accessibilityLabel="Go back"
              >
                <IconSymbol name="chevron.left" size={20} color={currentColors.text} />
              </TouchableOpacity>
              <View style={[styles.headerIconContainer, { backgroundColor: currentColors.primary }]}>
                <IconSymbol
                  name="video.fill"
                  size={28}
                  color={Colors.textOnPrimary}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.heading, { color: currentColors.text }]}>
                  Upload Video
                </Text>
                <Text style={[styles.subheading, { color: currentColors.textSecondary }]}>
                  Share your amazing content
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={[styles.errorContainer, { backgroundColor: currentColors.error + '15' }]}
          >
            <IconSymbol 
              name="exclamationmark.triangle.fill" 
              size={20} 
              color={currentColors.error}
            />
            <Text style={[styles.errorText, { color: currentColors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}

        {/* Video Selection */}
        <Animated.View entering={SlideInRight.delay(100).springify()}>
          <AnimatedPressable
            style={[buttonAnimatedStyle]}
            onPress={pickVideo}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={uploading}
          >
            <LinearGradient
              colors={Gradients.primary.colors}
              start={Gradients.primary.start}
              end={Gradients.primary.end}
              style={[styles.pickButton, Shadows.primaryGlow, uploading && { opacity: 0.5 }]}
            >
              <IconSymbol 
                name={videoUri ? "arrow.clockwise" : "video.fill"}
                size={22} 
                color={Colors.textOnPrimary}
              />
              <Text style={styles.pickButtonText}>
                {videoUri ? "Change Video" : "Select Video"}
              </Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Video Preview */}
        {videoUri && videoUri.trim() !== '' && (
          <Animated.View
            style={[styles.videoPreviewContainer, videoAnimatedStyle]}
            entering={FadeIn.duration(400)}
          >
            <View style={styles.videoWrapper}>
              <Video
                source={{ uri: videoUri }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                onError={(error) => {
                  console.error('❌ Video preview error:', error);
                  setError('Cannot preview this video. You can still try uploading it.');
                }}
              />
              
              {/* Video badge */}
              <View style={[styles.videoBadge, { backgroundColor: currentColors.primary }]}>
                <IconSymbol 
                  name="checkmark.circle.fill" 
                  size={16} 
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.videoBadgeText}>Video Selected</Text>
              </View>

              {/* Video info */}
              {videoAsset && (
                <View style={[styles.videoInfo, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                  <Text style={styles.videoInfoText}>
                    {videoAsset.fileName || 'Video File'}
                  </Text>
                  {videoAsset.fileSize && (
                    <Text style={styles.videoInfoText}>
                      {(videoAsset.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  )}
                </View>
              )}

              {/* Corner accent */}
              <View style={[styles.cornerAccent, { backgroundColor: currentColors.primary }]} />
            </View>
          </Animated.View>
        )}

        {/* Form Section */}
        <Animated.View 
          style={styles.formSection}
          entering={SlideInRight.delay(200).springify()}
        >
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <IconSymbol 
                name="pencil" 
                size={18} 
                color={currentColors.primary}
              />
              <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                Title *
              </Text>
            </View>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: currentColors.surface,
                borderColor: title ? currentColors.primary : currentColors.border,
              }
            ]}>
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                placeholder="Give your video a catchy title"
                placeholderTextColor={currentColors.textLight}
                value={title}
                onChangeText={setTitle}
                editable={!uploading}
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <IconSymbol 
                name="doc.on.doc" 
                size={18} 
                color={currentColors.primary}
              />
              <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                Description
              </Text>
            </View>
            <View style={[
              styles.inputWrapper,
              styles.textAreaWrapper,
              { 
                backgroundColor: currentColors.surface,
                borderColor: description ? currentColors.primary : currentColors.border,
              }
            ]}>
              <TextInput
                style={[styles.input, styles.textArea, { color: currentColors.text }]}
                placeholder="Tell viewers about your video (optional)"
                placeholderTextColor={currentColors.textLight}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                editable={!uploading}
              />
            </View>
          </View>
        </Animated.View>

        {/* Upload Progress */}
        {uploading ? (
          <Animated.View 
            style={styles.progressSection}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.progressBlur}>
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelContainer}>
                  <IconSymbol 
                    name="arrow.clockwise" 
                    size={20} 
                    color={currentColors.primary}
                  />
                  <Text style={[styles.progressTitle, { color: currentColors.text }]}>
                    {uploadStage || "Uploading Your Video"}
                  </Text>
                </View>
                <Text style={[styles.progressPercentage, { color: currentColors.primary }]}>
                  {progress}%
                </Text>
              </View>

              {/* Progress bar */}
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
                Please wait while we process your video...
              </Text>
            </BlurView>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <AnimatedPressable
              style={[buttonAnimatedStyle]}
              onPress={handleUpload}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!videoUri || !title.trim()}
            >
              <LinearGradient
                colors={Gradients.success.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.uploadButton, 
                  Shadows.successGlow,
                  (!videoUri || !title.trim()) && { opacity: 0.5 }
                ]}
              >
                <IconSymbol 
                  name="paperplane.fill" 
                  size={22} 
                  color={Colors.textOnPrimary}
                />
                <Text style={styles.uploadButtonText}>Upload Video</Text>
              </LinearGradient>
            </AnimatedPressable>

            {/* Upload tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipRow}>
                <IconSymbol 
                  name="info.circle.fill" 
                  size={16} 
                  color={currentColors.textLight}
                />
                <Text style={[styles.tipText, { color: currentColors.textLight }]}>
                  Max file size: 500MB
                </Text>
              </View>
              <View style={styles.tipRow}>
                <IconSymbol 
                  name="checkmark.circle.fill" 
                  size={16} 
                  color={currentColors.textLight}
                />
                <Text style={[styles.tipText, { color: currentColors.textLight }]}>
                  Formats: MP4, MOV, AVI
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function UploadScreen() {
  return (
    <ComponentErrorBoundary componentName="UploadScreen">
      <UploadScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
  },
  navSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerGradient: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  headerTextContainer: {
    flex: 1,
  },
  heading: {
    fontSize: Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: Typography.callout,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  pickButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  videoPreviewContainer: {
    marginBottom: Spacing.xl,
  },
  videoWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.large,
  },
  video: {
    width: "100%",
    height: 240,
    backgroundColor: '#000',
  },
  videoBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  videoBadgeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInfoText: {
    color: '#fff',
    fontSize: Typography.caption,
    fontWeight: '500',
  },
  cornerAccent: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderTopLeftRadius: BorderRadius.xl,
  },
  formSection: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  inputLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  inputWrapper: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
    ...Shadows.small,
  },
  textAreaWrapper: {
    minHeight: 120,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  progressSection: {
    marginBottom: Spacing.xl,
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
    height: 10,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
  },
  uploadButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  tipsContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
});

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Alert,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
// } from "react-native";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming,
//   withSequence,
//   interpolate,
//   Extrapolation,
//   FadeIn,
//   FadeOut,
//   SlideInRight,
//   SlideOutLeft,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { BlurView } from "expo-blur";
// import * as ImagePicker from "expo-image-picker";
// import { Video } from "expo-av";
// import { uploadVideo } from "@/services/videoService";
// import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from "@/constants/theme";
// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { ComponentErrorBoundary } from "@/components/component-error-boundary";
// import * as Sentry from "@sentry/react-native";

// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// function UploadScreenContent() {
//   const theme = useColorScheme() ?? 'light';
//   const isDark = theme === 'dark';
//   const currentColors = isDark ? DarkColors : Colors;

//   const [videoUri, setVideoUri] = useState<string | null>(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);

//   const scale = useSharedValue(1);
//   const progressValue = useSharedValue(0);
//   const successScale = useSharedValue(0);
//   const videoOpacity = useSharedValue(0);

//   const pickVideo = async () => {
//     try {
//       setError(null);
      
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
//       if (status !== "granted") {
//         const errorMsg = "Camera roll permission is required to select videos.";
//         setError(errorMsg);
//         Alert.alert(
//           "Permission Required", 
//           errorMsg,
//           [
//             { text: "Cancel", style: "cancel" },
//             { text: "Open Settings", onPress: () => {
//               // In a real app, you'd open settings here
//               console.log("Open app settings");
//             }}
//           ]
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//         allowsEditing: false,
//         quality: 1,
//       });

//       if (!result.canceled) {
//         const videoAsset = result.assets[0];
        
//         // Validate video file size (max 500MB)
//         if (videoAsset.fileSize && videoAsset.fileSize > 500 * 1024 * 1024) {
//           const errorMsg = "Video file size must be less than 500MB.";
//           setError(errorMsg);
//           Alert.alert("File Too Large", errorMsg);
//           return;
//         }

//         setVideoUri(videoAsset.uri);
//         videoOpacity.value = withTiming(1, { duration: 300 });
//         setError(null);
//       }
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : "Failed to select video. Please try again.";
//       setError(errorMsg);
      
//       // Log error to Sentry
//       Sentry.captureException(err, {
//         tags: { screen: 'upload', action: 'pick_video' },
//         extra: { errorMessage: errorMsg }
//       });
      
//       Alert.alert(
//         "Selection Error", 
//         errorMsg,
//         [{ text: "OK" }]
//       );
      
//       console.error("Video selection error:", err);
//     }
//   };

//   const handleUpload = async () => {
//     try {
//       if (!videoUri) {
//         Alert.alert("Select a Video", "Please select a video to upload.");
//         return;
//       }

//       if (!title.trim()) {
//         Alert.alert("Title Required", "Please enter a title for the video.");
//         return;
//       }

//       setUploading(true);
//       setProgress(0);
//       setError(null);
//       progressValue.value = 0;

//       // Simulate upload with progress tracking
//       let current = 0;
//       const interval = setInterval(() => {
//         current += 10;
//         setProgress(current);
//         progressValue.value = withTiming(current / 100, { duration: 300 });

//         if (current >= 90) {
//           clearInterval(interval);
//         }
//       }, 300);

//       try {
//         // Call the actual upload service
//         const result = await uploadVideo(videoUri);
        
//         // Complete the progress
//         clearInterval(interval);
//         setProgress(100);
//         progressValue.value = withTiming(1, { duration: 300 });

//         setTimeout(() => {
//           setUploading(false);
//           successScale.value = withSequence(
//             withSpring(1.2, Animation.spring.bouncy),
//             withSpring(1, Animation.spring.smooth)
//           );
          
//           Alert.alert(
//             "Upload Complete! 🎉", 
//             "Your video has been uploaded successfully!",
//             [{ text: "OK" }]
//           );
          
//           // Reset after showing success
//           setTimeout(() => {
//             setVideoUri(null);
//             setTitle("");
//             setDescription("");
//             setProgress(0);
//             progressValue.value = 0;
//             videoOpacity.value = 0;
//             setError(null);
//           }, 2000);
//         }, 300);

//       } catch (uploadError) {
//         clearInterval(interval);
//         throw uploadError;
//       }

//     } catch (err) {
//       setUploading(false);
//       setProgress(0);
//       progressValue.value = 0;
      
//       const errorMsg = err instanceof Error ? err.message : "Failed to upload video. Please check your connection and try again.";
//       setError(errorMsg);
      
//       // Log error to Sentry with context
//       Sentry.captureException(err, {
//         tags: { 
//           screen: 'upload', 
//           action: 'upload_video',
//           hasTitle: !!title,
//           hasDescription: !!description
//         },
//         extra: { 
//           errorMessage: errorMsg,
//           videoUri: videoUri?.substring(0, 50), // First 50 chars only for privacy
//           titleLength: title.length,
//           descriptionLength: description.length
//         }
//       });
      
//       Alert.alert(
//         "Upload Failed", 
//         errorMsg,
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Retry", onPress: handleUpload }
//         ]
//       );
      
//       console.error("Video upload error:", err);
//     }
//   };

//   const handlePressIn = () => {
//     scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
//   };

//   const handlePressOut = () => {
//     scale.value = withSpring(1, Animation.spring.bouncy);
//   };

//   const buttonAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const progressAnimatedStyle = useAnimatedStyle(() => {
//     const width = interpolate(
//       progressValue.value,
//       [0, 1],
//       [0, 100],
//       Extrapolation.CLAMP
//     );
//     return {
//       width: `${width}%`,
//     };
//   });

//   const videoAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: videoOpacity.value,
//   }));

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView 
//         contentContainerStyle={[styles.container, { backgroundColor: currentColors.background }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header with gradient */}
//         <Animated.View entering={FadeIn.duration(400)}>
//           <LinearGradient
//             colors={[
//               isDark ? 'rgba(233, 122, 66, 0.15)' : 'rgba(233, 122, 66, 0.08)',
//               'transparent'
//             ]}
//             style={styles.headerGradient}
//           >
//             <View style={styles.headerContent}>
//               <View style={[styles.headerIconContainer, { backgroundColor: currentColors.primary }]}>
//                 <IconSymbol 
//                   name="video.fill" 
//                   size={28} 
//                   color={Colors.textOnPrimary}
//                 />
//               </View>
//               <View style={styles.headerTextContainer}>
//                 <Text style={[styles.heading, { color: currentColors.text }]}>
//                   Upload Video
//                 </Text>
//                 <Text style={[styles.subheading, { color: currentColors.textSecondary }]}>
//                   Share your amazing content
//                 </Text>
//               </View>
//             </View>
//           </LinearGradient>
//         </Animated.View>

//         {/* Error Message */}
//         {error && (
//           <Animated.View 
//             entering={FadeIn.duration(300)}
//             exiting={FadeOut.duration(300)}
//             style={[styles.errorContainer, { backgroundColor: currentColors.error + '15' }]}
//           >
//             <IconSymbol 
//               name="exclamationmark.triangle.fill" 
//               size={20} 
//               color={currentColors.error}
//             />
//             <Text style={[styles.errorText, { color: currentColors.error }]}>
//               {error}
//             </Text>
//           </Animated.View>
//         )}

//         {/* Video Selection */}
//         <Animated.View entering={SlideInRight.delay(100).springify()}>
//           <AnimatedPressable
//             style={[buttonAnimatedStyle]}
//             onPress={pickVideo}
//             onPressIn={handlePressIn}
//             onPressOut={handlePressOut}
//           >
//             <LinearGradient
//               colors={Gradients.primary.colors}
//               start={Gradients.primary.start}
//               end={Gradients.primary.end}
//               style={[styles.pickButton, Shadows.primaryGlow]}
//             >
//               <IconSymbol 
//                 name={videoUri ? "arrow.clockwise" : "video.fill"}
//                 size={22} 
//                 color={Colors.textOnPrimary}
//               />
//               <Text style={styles.pickButtonText}>
//                 {videoUri ? "Change Video" : "Select Video"}
//               </Text>
//             </LinearGradient>
//           </AnimatedPressable>
//         </Animated.View>

//         {/* Video Preview */}
//         {videoUri && (
//           <Animated.View 
//             style={[styles.videoPreviewContainer, videoAnimatedStyle]}
//             entering={FadeIn.duration(400)}
//           >
//             <View style={styles.videoWrapper}>
//               <Video
//                 source={{ uri: videoUri }}
//                 style={styles.video}
//                 useNativeControls
//                 resizeMode="contain"
//               />
              
//               {/* Video badge */}
//               <View style={[styles.videoBadge, { backgroundColor: currentColors.primary }]}>
//                 <IconSymbol 
//                   name="checkmark.circle.fill" 
//                   size={16} 
//                   color={Colors.textOnPrimary}
//                 />
//                 <Text style={styles.videoBadgeText}>Video Selected</Text>
//               </View>

//               {/* Corner accent */}
//               <View style={[styles.cornerAccent, { backgroundColor: currentColors.primary }]} />
//             </View>
//           </Animated.View>
//         )}

//         {/* Form Section */}
//         <Animated.View 
//           style={styles.formSection}
//           entering={SlideInRight.delay(200).springify()}
//         >
//           {/* Title Input */}
//           <View style={styles.inputContainer}>
//             <View style={styles.inputLabelContainer}>
//               <IconSymbol 
//                 name="pencil" 
//                 size={18} 
//                 color={currentColors.primary}
//               />
//               <Text style={[styles.inputLabel, { color: currentColors.text }]}>
//                 Title *
//               </Text>
//             </View>
//             <View style={[
//               styles.inputWrapper, 
//               { 
//                 backgroundColor: currentColors.surface,
//                 borderColor: title ? currentColors.primary : currentColors.border,
//               }
//             ]}>
//               <TextInput
//                 style={[styles.input, { color: currentColors.text }]}
//                 placeholder="Give your video a catchy title"
//                 placeholderTextColor={currentColors.textLight}
//                 value={title}
//                 onChangeText={setTitle}
//               />
//             </View>
//           </View>

//           {/* Description Input */}
//           <View style={styles.inputContainer}>
//             <View style={styles.inputLabelContainer}>
//               <IconSymbol 
//                 name="doc.on.doc" 
//                 size={18} 
//                 color={currentColors.primary}
//               />
//               <Text style={[styles.inputLabel, { color: currentColors.text }]}>
//                 Description
//               </Text>
//             </View>
//             <View style={[
//               styles.inputWrapper,
//               styles.textAreaWrapper,
//               { 
//                 backgroundColor: currentColors.surface,
//                 borderColor: description ? currentColors.primary : currentColors.border,
//               }
//             ]}>
//               <TextInput
//                 style={[styles.input, styles.textArea, { color: currentColors.text }]}
//                 placeholder="Tell viewers about your video (optional)"
//                 placeholderTextColor={currentColors.textLight}
//                 multiline
//                 numberOfLines={4}
//                 value={description}
//                 onChangeText={setDescription}
//               />
//             </View>
//           </View>
//         </Animated.View>

//         {/* Upload Progress */}
//         {uploading ? (
//           <Animated.View 
//             style={styles.progressSection}
//             entering={FadeIn.duration(300)}
//             exiting={FadeOut.duration(300)}
//           >
//             <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.progressBlur}>
//               <View style={styles.progressHeader}>
//                 <View style={styles.progressLabelContainer}>
//                   <IconSymbol 
//                     name="arrow.clockwise" 
//                     size={20} 
//                     color={currentColors.primary}
//                   />
//                   <Text style={[styles.progressTitle, { color: currentColors.text }]}>
//                     Uploading Your Video
//                   </Text>
//                 </View>
//                 <Text style={[styles.progressPercentage, { color: currentColors.primary }]}>
//                   {progress}%
//                 </Text>
//               </View>

//               {/* Progress bar */}
//               <View style={[styles.progressBarBackground, { backgroundColor: currentColors.border }]}>
//                 <Animated.View style={[progressAnimatedStyle]}>
//                   <LinearGradient
//                     colors={Gradients.primary.colors}
//                     start={Gradients.primary.start}
//                     end={Gradients.primary.end}
//                     style={styles.progressBarFill}
//                   />
//                 </Animated.View>
//               </View>

//               <Text style={[styles.progressSubtext, { color: currentColors.textSecondary }]}>
//                 Please wait while we process your video...
//               </Text>
//             </BlurView>
//           </Animated.View>
//         ) : (
//           <Animated.View entering={FadeIn.delay(300).duration(400)}>
//             <AnimatedPressable
//               style={[buttonAnimatedStyle]}
//               onPress={handleUpload}
//               onPressIn={handlePressIn}
//               onPressOut={handlePressOut}
//             >
//               <LinearGradient
//                 colors={Gradients.success.colors}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={[styles.uploadButton, Shadows.successGlow]}
//               >
//                 <IconSymbol 
//                   name="paperplane.fill" 
//                   size={22} 
//                   color={Colors.textOnPrimary}
//                 />
//                 <Text style={styles.uploadButtonText}>Upload Video</Text>
//               </LinearGradient>
//             </AnimatedPressable>

//             {/* Upload tips */}
//             <View style={styles.tipsContainer}>
//               <View style={styles.tipRow}>
//                 <IconSymbol 
//                   name="info.circle.fill" 
//                   size={16} 
//                   color={currentColors.textLight}
//                 />
//                 <Text style={[styles.tipText, { color: currentColors.textLight }]}>
//                   Max file size: 500MB
//                 </Text>
//               </View>
//               <View style={styles.tipRow}>
//                 <IconSymbol 
//                   name="checkmark.circle.fill" 
//                   size={16} 
//                   color={currentColors.textLight}
//                 />
//                 <Text style={[styles.tipText, { color: currentColors.textLight }]}>
//                   Formats: MP4, MOV, AVI
//                 </Text>
//               </View>
//             </View>
//           </Animated.View>
//         )}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// // Wrap with ComponentErrorBoundary
// export default function UploadScreen() {
//   return (
//     <ComponentErrorBoundary componentName="UploadScreen">
//       <UploadScreenContent />
//     </ComponentErrorBoundary>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: Spacing.xl,
//     paddingTop: Spacing.xxl,
//     flexGrow: 1,
//   },

//   // Header
//   headerGradient: {
//     borderRadius: BorderRadius.xl,
//     marginBottom: Spacing.xl,
//     overflow: 'hidden',
//   },

//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: Spacing.lg,
//     gap: Spacing.md,
//   },

//   headerIconContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     ...Shadows.medium,
//   },

//   headerTextContainer: {
//     flex: 1,
//   },

//   heading: {
//     fontSize: Typography.title2,
//     fontWeight: '700',
//     marginBottom: Spacing.xs,
//   },

//   subheading: {
//     fontSize: Typography.callout,
//     fontWeight: '500',
//   },

//   // Error Container
//   errorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     padding: Spacing.md,
//     borderRadius: BorderRadius.lg,
//     marginBottom: Spacing.lg,
//   },

//   errorText: {
//     flex: 1,
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   // Pick Button
//   pickButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: Spacing.sm,
//     paddingVertical: Spacing.md,
//     borderRadius: BorderRadius.lg,
//     marginBottom: Spacing.xl,
//   },

//   pickButtonText: {
//     color: Colors.textOnPrimary,
//     fontSize: Typography.body,
//     fontWeight: '700',
//   },

//   // Video Preview
//   videoPreviewContainer: {
//     marginBottom: Spacing.xl,
//   },

//   videoWrapper: {
//     borderRadius: BorderRadius.xl,
//     overflow: 'hidden',
//     position: 'relative',
//     ...Shadows.large,
//   },

//   video: {
//     width: "100%",
//     height: 240,
//     backgroundColor: '#000',
//   },

//   videoBadge: {
//     position: 'absolute',
//     top: Spacing.md,
//     left: Spacing.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.sm,
//     borderRadius: BorderRadius.full,
//     ...Shadows.small,
//   },

//   videoBadgeText: {
//     color: Colors.textOnPrimary,
//     fontSize: Typography.footnote,
//     fontWeight: '600',
//   },

//   cornerAccent: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 60,
//     height: 60,
//     borderTopLeftRadius: BorderRadius.xl,
//   },

//   // Form Section
//   formSection: {
//     gap: Spacing.lg,
//     marginBottom: Spacing.xl,
//   },

//   inputContainer: {
//     gap: Spacing.sm,
//   },

//   inputLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     paddingLeft: Spacing.xs,
//   },

//   inputLabel: {
//     fontSize: Typography.callout,
//     fontWeight: '600',
//   },

//   inputWrapper: {
//     borderRadius: BorderRadius.lg,
//     borderWidth: 2,
//     overflow: 'hidden',
//     ...Shadows.small,
//   },

//   textAreaWrapper: {
//     minHeight: 120,
//   },

//   input: {
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.md,
//     fontSize: Typography.body,
//   },

//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//     paddingTop: Spacing.md,
//   },

//   // Progress Section
//   progressSection: {
//     marginBottom: Spacing.xl,
//     borderRadius: BorderRadius.lg,
//     overflow: 'hidden',
//   },

//   progressBlur: {
//     padding: Spacing.lg,
//   },

//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: Spacing.md,
//   },

//   progressLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   progressTitle: {
//     fontSize: Typography.body,
//     fontWeight: '600',
//   },

//   progressPercentage: {
//     fontSize: Typography.title3,
//     fontWeight: '700',
//   },

//   progressBarBackground: {
//     width: '100%',
//     height: 10,
//     borderRadius: BorderRadius.sm,
//     overflow: 'hidden',
//     marginBottom: Spacing.sm,
//   },

//   progressBarFill: {
//     height: '100%',
//     borderRadius: BorderRadius.sm,
//   },

//   progressSubtext: {
//     fontSize: Typography.callout,
//     textAlign: 'center',
//   },

//   // Upload Button
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: Spacing.sm,
//     paddingVertical: Spacing.md,
//     borderRadius: BorderRadius.lg,
//     minHeight: 56,
//   },

//   uploadButtonText: {
//     color: Colors.textOnPrimary,
//     fontSize: Typography.body,
//     fontWeight: '700',
//   },

//   // Tips
//   tipsContainer: {
//     marginTop: Spacing.lg,
//     gap: Spacing.sm,
//     paddingHorizontal: Spacing.md,
//   },

//   tipRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },

//   tipText: {
//     fontSize: Typography.footnote,
//     fontWeight: '500',
//   },
// });