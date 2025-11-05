import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DarkColors, Typography, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ErrorScreenProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorScreen({ error, resetErrorBoundary }: ErrorScreenProps) {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  const handleGoHome = () => {
    resetErrorBoundary();
    router.push('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={[styles.iconContainer, { backgroundColor: currentColors.error + '15' }]}>
            <IconSymbol 
              name="exclamationmark.triangle.fill" 
              size={64} 
              color={currentColors.error}
            />
          </View>
        </Animated.View>

        {/* Error Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.title, { color: currentColors.text }]}>
            Oops! Something Went Wrong
          </Text>
        </Animated.View>

        {/* Error Message */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={[styles.messageContainer, { backgroundColor: currentColors.surface }]}>
            <Text style={[styles.messageLabel, { color: currentColors.textSecondary }]}>
              Error Details:
            </Text>
            <Text style={[styles.errorMessage, { color: currentColors.text }]}>
              {error.message || 'An unexpected error occurred'}
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.buttonContainer}
        >
          {/* Try Again Button */}
          <TouchableOpacity
            onPress={resetErrorBoundary}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.primary.colors}
              start={Gradients.primary.start}
              end={Gradients.primary.end}
              style={[styles.button, styles.primaryButton, Shadows.primaryGlow]}
            >
              <IconSymbol 
                name="arrow.clockwise" 
                size={20} 
                color={Colors.textOnPrimary}
              />
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Go Home Button */}
          <TouchableOpacity
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <View style={[
              styles.button, 
              styles.secondaryButton,
              { 
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }
            ]}>
              <IconSymbol 
                name="house.fill" 
                size={20} 
                color={currentColors.primary}
              />
              <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>
                Go Home
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Support Text */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.supportContainer}>
            <IconSymbol 
              name="info.circle" 
              size={16} 
              color={currentColors.textLight}
            />
            <Text style={[styles.supportText, { color: currentColors.textLight }]}>
              If this problem persists, please contact support
            </Text>
          </View>
        </Animated.View>

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={[styles.debugContainer, { backgroundColor: currentColors.surface }]}
          >
            <Text style={[styles.debugTitle, { color: currentColors.textSecondary }]}>
              Debug Info (Dev Only):
            </Text>
            <ScrollView 
              style={styles.debugScroll}
              nestedScrollEnabled
            >
              <Text style={[styles.debugText, { color: currentColors.textLight }]}>
                {error.stack || 'No stack trace available'}
              </Text>
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: Typography.largeTitle,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  messageContainer: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },

  messageLabel: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  errorMessage: {
    fontSize: Typography.body,
    fontWeight: '500',
    lineHeight: 22,
  },

  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
  },

  primaryButton: {
    ...Shadows.medium,
  },

  secondaryButton: {
    borderWidth: 2,
    ...Shadows.small,
  },

  primaryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.body,
    fontWeight: '700',
  },

  secondaryButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },

  supportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },

  supportText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    textAlign: 'center',
  },

  debugContainer: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    maxHeight: 200,
    ...Shadows.small,
  },

  debugTitle: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  debugScroll: {
    maxHeight: 150,
  },

  debugText: {
    fontSize: Typography.caption,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
});