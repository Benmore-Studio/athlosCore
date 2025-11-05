import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
  icon,
  destructive = true,
}: ConfirmDialogProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const confirmScale = useSharedValue(1);
  const cancelScale = useSharedValue(1);

  const getIconName = (): string => {
    if (icon) return icon;
    
    switch (type) {
      case 'danger':
        return 'trash.fill';
      case 'warning':
        return 'exclamationmark.triangle.fill';
      case 'info':
        return 'info.circle.fill';
      default:
        return 'exclamationmark.triangle.fill';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'danger':
        return currentColors.error;
      case 'warning':
        return currentColors.warning;
      case 'info':
        return currentColors.info;
      default:
        return currentColors.error;
    }
  };

  const getConfirmGradient = () => {
    if (!destructive) return Gradients.primary.colors;
    
    switch (type) {
      case 'danger':
        return [currentColors.error, currentColors.error];
      case 'warning':
        return [currentColors.warning, currentColors.warning];
      case 'info':
        return Gradients.primary.colors;
      default:
        return [currentColors.error, currentColors.error];
    }
  };

  const handleConfirmPressIn = () => {
    confirmScale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handleConfirmPressOut = () => {
    confirmScale.value = withSpring(1, Animation.spring.bouncy);
  };

  const handleCancelPressIn = () => {
    cancelScale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handleCancelPressOut = () => {
    cancelScale.value = withSpring(1, Animation.spring.bouncy);
  };

  const confirmAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onCancel}>
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Pressable>

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={styles.dialogContainer}
        >
          <View
            style={[
              styles.dialog,
              { backgroundColor: currentColors.cardBackground },
              Shadows.large,
            ]}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
              <IconSymbol
                name={getIconName()}
                size={48}
                color={getIconColor()}
              />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: currentColors.text }]}>
              {title}
            </Text>

            {/* Message */}
            <Text style={[styles.message, { color: currentColors.textSecondary }]}>
              {message}
            </Text>

            {/* Warning Note for Destructive Actions */}
            {destructive && (
              <View style={[styles.warningBox, { backgroundColor: `${currentColors.error}15` }]}>
                <IconSymbol
                  name="exclamationmark.circle.fill"
                  size={16}
                  color={currentColors.error}
                />
                <Text style={[styles.warningText, { color: currentColors.error }]}>
                  This action cannot be undone
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Cancel Button */}
              <AnimatedPressable
                onPress={onCancel}
                onPressIn={handleCancelPressIn}
                onPressOut={handleCancelPressOut}
                style={[cancelAnimatedStyle, styles.button]}
              >
                <View
                  style={[
                    styles.cancelButton,
                    { backgroundColor: currentColors.surface, borderColor: currentColors.border },
                  ]}
                >
                  <Text style={[styles.cancelButtonText, { color: currentColors.text }]}>
                    {cancelText}
                  </Text>
                </View>
              </AnimatedPressable>

              {/* Confirm Button */}
              <AnimatedPressable
                onPress={onConfirm}
                onPressIn={handleConfirmPressIn}
                onPressOut={handleConfirmPressOut}
                style={[confirmAnimatedStyle, styles.button]}
              >
                <LinearGradient
                  colors={getConfirmGradient()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.confirmButton, destructive && Shadows.errorGlow]}
                >
                  <Text style={styles.confirmButtonText}>
                    {confirmText}
                  </Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },

  dialog: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
  },

  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  message: {
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },

  warningText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },

  button: {
    flex: 1,
  },

  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 52,
  },

  cancelButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },

  confirmButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },

  confirmButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '700',
  },
});