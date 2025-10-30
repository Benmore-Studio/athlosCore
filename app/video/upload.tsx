import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function UploadScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = new Animated.Value(0);
  const navigation = useNavigation();

  // Prevent back navigation during upload
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!uploading) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving
      Alert.alert(
        'Upload in Progress',
        'Are you sure you want to cancel the upload?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Cancel Upload',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, uploading]);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "You need to grant permission to access your media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!videoUri) {
      Alert.alert("Select a video", "Please select a video to upload.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for the video.");
      return;
    }

    setUploading(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      Animated.timing(progressAnim, {
        toValue: current,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          Alert.alert(
            "✅ Upload Complete",
            "Your video has been uploaded successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigate to videos tab after successful upload
                  router.push("/(tabs)/videos");
                }
              }
            ]
          );
          setVideoUri(null);
          setTitle("");
          setDescription("");
          setProgress(0);
        }, 300);
      }
    }, 300);
  };

  const handleCancel = () => {
    if (videoUri || title || description) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to go back? Your changes will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color="#222" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>🎬 Upload New Video</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
        <Text style={styles.pickBtnText}>{videoUri ? "Change Video" : "Select Video"}</Text>
      </TouchableOpacity>

      {videoUri && (
        <View style={styles.videoPreview}>
          <Video
            source={{ uri: videoUri }}
            style={{ width: "100%", height: 220, borderRadius: 14 }}
            useNativeControls
            resizeMode="contain"
          />
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Video Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description (optional)"
        placeholderTextColor="#888"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {uploading ? (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.uploadText}>Uploading... {progress}%</Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
          <Ionicons name="rocket-outline" size={20} color="#fff" />
          <Text style={styles.uploadBtnText}>Upload Video</Text>
        </TouchableOpacity>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 4,
    fontWeight: "500",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 25,
  },
  pickBtn: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  pickBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  videoPreview: {
    marginVertical: 20,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#222",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 10,
  },
  uploadBtn: {
    backgroundColor: "#28a745",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 20,
    gap: 8,
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadProgress: {
    alignItems: "center",
    marginTop: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
});
