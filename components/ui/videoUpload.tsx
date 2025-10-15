import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { uploadVideo } from '@/services/videoService';

export default function VideoUpload({ onUploadComplete }: { onUploadComplete?: (video: any) => void }) {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setVideoUri(uri);
      generateThumbnail(uri);
    }
  };

  const generateThumbnail = async (uri: string) => {
    try {
      const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: 1000 });
      setThumbnail(thumbUri);
    } catch (e) {
      console.warn('Failed to generate thumbnail', e);
    }
  };

  const handleUpload = async () => {
    if (!videoUri) return;
    setUploading(true);
    setStatus('uploading');
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + 10;
      });
    }, 300);

    try {
      const uploaded = await uploadVideo(videoUri);
      clearInterval(interval);
      setProgress(100);
      setStatus('done');
      setUploading(false);
      onUploadComplete?.(uploaded);
    } catch (error) {
      console.error('Upload failed', error);
      clearInterval(interval);
      setUploading(false);
      setStatus('idle');
    }
  };

  return (
    <View style={styles.container}>
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      ) : (
        <TouchableOpacity style={styles.pickButton} onPress={pickVideo}>
          <Text style={styles.pickText}>🎥 Select Video</Text>
        </TouchableOpacity>
      )}

      {videoUri && !uploading && status === 'idle' && (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadText}>Upload Video</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.progressText}>Uploading... {progress}%</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneText}>✅ Upload Complete!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pickButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  pickText: {
    color: Colors.onPrimary,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  thumbnail: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  uploadButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  uploadText: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  progressText: {
    color: Colors.text,
    marginTop: 6,
  },
  doneContainer: {
    marginTop: Spacing.md,
  },
  doneText: {
    color: Colors.success,
    fontWeight: '600',
  },
});
