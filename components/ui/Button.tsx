import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  secondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },

  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Sizes
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },

  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },

  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },

  // Text variants
  primaryText: {
    color: Colors.textOnPrimary,
  },

  secondaryText: {
    color: Colors.text,
  },

  outlineText: {
    color: Colors.primary,
  },

  ghostText: {
    color: Colors.primary,
  },

  // Text sizes
  smallText: {
    fontSize: Typography.callout,
  },

  mediumText: {
    fontSize: Typography.body,
  },

  largeText: {
    fontSize: Typography.headline,
  },

  // Disabled states
  disabled: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.border,
  },

  disabledText: {
    color: Colors.textLight,
  },
});