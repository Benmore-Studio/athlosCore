import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, DarkColors, BorderRadius, Spacing, Shadows, Gradients, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'elevated_high' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
  pressable?: boolean;
  animate?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
  pressable = false,
  animate = true,
}: CardProps) {
  const theme = useColorScheme() ?? 'light';
  const scale = useSharedValue(1);
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (animate && (pressable || onPress)) {
      scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (animate && (pressable || onPress)) {
      scale.value = withSpring(1, Animation.spring.snappy);
    }
  };

  const cardStyle = [
    styles.base,
    variant === 'glass' && (isDark ? styles.glassDark : styles.glassLight),
    variant !== 'glass' && variant !== 'gradient' && {
      backgroundColor: currentColors.cardBackground,
    },
    variant === 'elevated' && Shadows.medium,
    variant === 'elevated_high' && Shadows.large,
    variant === 'outlined' && {
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    styles[`${padding}Padding`],
    style,
  ];

  // Gradient border effect for elevated cards
  if (variant === 'gradient') {
    return (
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress && !pressable}
          style={({ pressed }) => [
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <LinearGradient
            colors={Gradients.primary.colors}
            start={Gradients.primary.start}
            end={Gradients.primary.end}
            style={[styles.gradientBorder, style]}
          >
            <View style={[
              styles.gradientInner,
              { backgroundColor: currentColors.cardBackground },
              styles[`${padding}Padding`],
            ]}>
              {children}
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Glass morphism effect
  if (variant === 'glass') {
    return (
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress && !pressable}
          style={({ pressed }) => [
            cardStyle,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  // Standard card
  if (onPress || pressable) {
    return (
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            cardStyle,
            pressed && styles.pressed,
          ]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[cardStyle, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Glass morphism styles
  glassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Shadows.medium,
  },

  glassDark: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Shadows.medium,
  },

  // Gradient border
  gradientBorder: {
    borderRadius: BorderRadius.lg,
    padding: 2, // Border width
  },

  gradientInner: {
    borderRadius: BorderRadius.lg - 2,
    overflow: 'hidden',
  },

  // Pressed state
  pressed: {
    opacity: 0.95,
  },

  // Padding variants
  nonePadding: {
    padding: 0,
  },

  smallPadding: {
    padding: Spacing.md,
  },

  mediumPadding: {
    padding: Spacing.cardPadding,
  },

  largePadding: {
    padding: Spacing.lg,
  },
});