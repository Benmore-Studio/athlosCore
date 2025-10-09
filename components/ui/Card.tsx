import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
  },

  // Variants
  default: {
    backgroundColor: Colors.cardBackground,
  },

  elevated: {
    backgroundColor: Colors.cardBackground,
    ...Shadows.medium,
  },

  outlined: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
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