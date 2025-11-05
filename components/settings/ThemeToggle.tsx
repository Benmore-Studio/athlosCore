// File: components/settings/ThemeToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Animation } from '@/constants/theme';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeToggleProps {
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  currentColors: any;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ThemeToggle({ currentMode, onModeChange, currentColors }: ThemeToggleProps) {
  const themeOptions: Array<{ mode: ThemeMode; icon: string; label: string }> = [
    { mode: 'auto', icon: 'sparkles', label: 'Auto' },
    { mode: 'light', icon: 'sun.max.fill', label: 'Light' },
    { mode: 'dark', icon: 'moon.fill', label: 'Dark' },
  ];

  const handlePress = (mode: ThemeMode) => {
    onModeChange(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentColors.text }]}>Theme</Text>
      <Text style={[styles.description, { color: currentColors.textSecondary }]}>
        Choose how AthlosCore looks to you
      </Text>

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => {
          const isSelected = currentMode === option.mode;

          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                {
                  backgroundColor: currentColors.surface,
                  borderWidth: 2,
                  borderColor: isSelected ? currentColors.primary : currentColors.border,
                },
              ]}
              onPress={() => handlePress(option.mode)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isSelected ? currentColors.primary : currentColors.surface }
              ]}>
                <IconSymbol
                  name={option.icon}
                  size={28}
                  color={isSelected ? 'dark' : currentColors.text}
                />
              </View>
              <Text style={[
                styles.optionLabel,
                { 
                  color: isSelected ? currentColors.primary : currentColors.text,
                  fontWeight: isSelected ? '700' : '600',
                }
              ]}>
                {option.label}
              </Text>
              {isSelected && (
                <Animated.View 
                  entering={FadeIn.duration(300)}
                  style={[styles.checkmark, { backgroundColor: currentColors.primary }]}
                >
                  <IconSymbol name="checkmark" size={16} color={'dark'} />
                </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.callout,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  option: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  optionLabel: {
    fontSize: Typography.body,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});