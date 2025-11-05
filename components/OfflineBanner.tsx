// File: components/OfflineBanner.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useOffline } from '@/contexts/OfflineContext';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function OfflineBanner() {
  const { isOnline } = useOffline();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(-100, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[styles.banner, { backgroundColor: Colors.warning }, animatedStyle]}
      pointerEvents={isOnline ? 'none' : 'auto'}
    >
      <IconSymbol name="wifi.slash" size={20} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>Some features may be unavailable</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  title: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.9,
  },
});