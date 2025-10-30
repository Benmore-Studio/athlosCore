/**
 * LoadingSpinner Component
 *
 * Reusable loading indicator with brand colors.
 * Can be used inline or as a full-screen overlay.
 */

import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  /**
   * Loading message to display below the spinner
   */
  message?: string;

  /**
   * Size of the spinner
   */
  size?: 'small' | 'large';

  /**
   * Color of the spinner (defaults to brand primary)
   */
  color?: string;

  /**
   * If true, displays as full-screen overlay
   */
  fullScreen?: boolean;

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export default function LoadingSpinner({
  message,
  size = 'large',
  color = Colors.primary,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
  },

  message: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
