import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, DarkColors, Typography, BorderRadius, Spacing, Shadows, Gradients, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'primaryGradient' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const handlePress = () => {
    // Haptic feedback effect with opacity
    opacity.value = withSequence(
      withTiming(0.7, { duration: 50 }),
      withTiming(1, { duration: 150 })
    );
    onPress();
  };

  const baseButtonStyle = [
    styles.base,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getTextColor = () => {
    if (disabled) return currentColors.textLight;
    
    switch (variant) {
      case 'primary':
      case 'primaryGradient':
        return Colors.textOnPrimary;
      case 'secondary':
        return currentColors.text;
      case 'outline':
      case 'ghost':
        return currentColors.primary;
      default:
        return currentColors.text;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={getTextColor()}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[textStyles, { color: getTextColor() }]}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  // Gradient button
  if (variant === 'primaryGradient' && !disabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle]}
      >
        <LinearGradient
          colors={Gradients.primary.colors}
          start={Gradients.primary.start}
          end={Gradients.primary.end}
          style={[
            baseButtonStyle,
            styles.gradientButton,
            Shadows.primaryGlow,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Standard buttons
  const buttonVariantStyle = 
    variant === 'primary' ? [styles.primary, Shadows.medium] :
    variant === 'secondary' ? styles.secondary :
    variant === 'outline' ? styles.outline :
    variant === 'ghost' ? styles.ghost :
    styles.primary;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        baseButtonStyle,
        buttonVariantStyle,
        animatedStyle,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    overflow: 'hidden',
  },

  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },

  gradientButton: {
    // Gradient is applied via LinearGradient component
  },

  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
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
    opacity: 0.5,
  },

  disabledText: {
    color: Colors.textLight,
  },
});