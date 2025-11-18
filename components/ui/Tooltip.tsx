// File: components/ui/Tooltip.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipProps {
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'press' | 'longPress';
  icon?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  style?: any;
}

export default function Tooltip({
  title,
  content,
  placement = 'bottom',
  trigger = 'press',
  icon = 'questionmark.circle.fill',
  children,
  showIcon = true,
  iconSize = 20,
  style,
}: TooltipProps) {
  const { currentColors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePress = (event: any) => {
    if (trigger === 'press') {
      event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setTooltipPosition({ x: pageX, y: pageY });
        setVisible(true);
      });
    }
  };

  const handleLongPress = (event: any) => {
    if (trigger === 'longPress') {
      event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setTooltipPosition({ x: pageX, y: pageY });
        setVisible(true);
      });
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        style={[styles.trigger, style]}
      >
        {children || (
          showIcon && (
            <IconSymbol 
              name={icon} 
              size={iconSize} 
              color={currentColors.primary}
            />
          )
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            entering={ZoomIn.duration(200).springify()}
            exiting={ZoomOut.duration(150)}
            style={[
              styles.tooltipContainer,
              { 
                top: tooltipPosition.y + 30,
                left: Math.max(Spacing.lg, Math.min(tooltipPosition.x - 140, SCREEN_WIDTH - 300)),
              }
            ]}
          >
            <BlurView
              intensity={isDark ? 80 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.tooltipBlur, { backgroundColor: currentColors.surface + 'F5' }]}
            >
              <View style={styles.tooltipHeader}>
                <View style={[styles.tooltipIconContainer, { backgroundColor: currentColors.primary + '20' }]}>
                  <IconSymbol name="lightbulb.fill" size={20} color={currentColors.primary} />
                </View>
                <Text style={[styles.tooltipTitle, { color: currentColors.text }]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={16} color={currentColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.tooltipContent, { color: currentColors.textSecondary }]}>
                {content}
              </Text>

              {/* Arrow */}
              <View style={[styles.arrow, { backgroundColor: currentColors.surface + 'F5' }]} />
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// Inline Tooltip Variant
interface InlineTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
}

export function InlineTooltip({ label, tooltip, required = false }: InlineTooltipProps) {
  const { currentColors } = useTheme();

  return (
    <View style={styles.inlineContainer}>
      <Text style={[styles.inlineLabel, { color: currentColors.text }]}>
        {label}
        {required && <Text style={{ color: Colors.error }}> *</Text>}
      </Text>
      <Tooltip
        title={label}
        content={tooltip}
        iconSize={16}
        style={styles.inlineTooltip}
      />
    </View>
  );
}

// Feature Highlight Tooltip
interface FeatureTooltipProps {
  feature: string;
  description: string;
  steps?: string[];
  onDismiss?: () => void;
}

export function FeatureTooltip({ feature, description, steps, onDismiss }: FeatureTooltipProps) {
  const { currentColors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.featureTooltipContainer, { backgroundColor: currentColors.surface }]}
    >
      <BlurView
        intensity={isDark ? 60 : 40}
        tint={isDark ? 'dark' : 'light'}
        style={styles.featureTooltipBlur}
      >
        <View style={styles.featureHeader}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.info + '20' }]}>
            <IconSymbol name="star.fill" size={24} color={Colors.info} />
          </View>
          <Text style={[styles.featureTitle, { color: currentColors.text }]}>
            {feature}
          </Text>
        </View>

        <Text style={[styles.featureDescription, { color: currentColors.textSecondary }]}>
          {description}
        </Text>

        {steps && steps.length > 0 && (
          <View style={styles.featureSteps}>
            {steps.map((step, index) => (
              <View key={index} style={styles.featureStep}>
                <View style={[styles.stepNumber, { backgroundColor: currentColors.primary }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: currentColors.text }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={onDismiss}
          style={[styles.gotItButton, { backgroundColor: currentColors.primary }]}
        >
          <Text style={styles.gotItText}>Got it!</Text>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  tooltipContainer: {
    position: 'absolute',
    width: 280,
    ...Shadows.large,
  },
  tooltipBlur: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tooltipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTitle: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  tooltipContent: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.5,
  },
  arrow: {
    position: 'absolute',
    top: -6,
    left: 140,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
  },

  // Inline Tooltip
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  inlineLabel: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  inlineTooltip: {
    padding: 0,
  },

  // Feature Tooltip
  featureTooltipContainer: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  featureTooltipBlur: {
    padding: Spacing.lg,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    flex: 1,
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.5,
    marginBottom: Spacing.lg,
  },
  featureSteps: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.4,
  },
  gotItButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});