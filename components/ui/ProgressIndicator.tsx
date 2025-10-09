import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

export default function ProgressIndicator({
  progress,
  size = 120,
  strokeWidth = 8,
  color = Colors.primary,
  backgroundColor = Colors.borderLight,
  showPercentage = true,
  style,
}: ProgressIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={styles.svgContainer}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />

        {/* Progress circle - simplified version using border and rotation */}
        <View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: color,
              transform: [
                { rotate: `${(progress / 100) * 360 - 90}deg` }
              ],
            },
          ]}
        />
      </View>

      {showPercentage && (
        <View style={styles.textContainer}>
          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
          <Text style={styles.completeText}>COMPLETE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  circle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  progressCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  percentageText: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  completeText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});