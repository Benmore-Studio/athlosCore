/**
 * EmptyState Component
 *
 * Beautiful, centered empty state with icon, message, and optional action button.
 * On-brand design with basketball theme.
 */

import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Button from './Button';
import { IconSymbol } from './icon-symbol';

interface EmptyStateProps {
  /**
   * SF Symbol icon name
   */
  icon: string;

  /**
   * Primary message (large, bold)
   */
  title: string;

  /**
   * Secondary message (smaller, lighter)
   */
  description: string;

  /**
   * Optional action button text
   */
  actionLabel?: string;

  /**
   * Optional action button handler
   */
  onAction?: () => void;

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Icon Circle */}
      <View style={styles.iconContainer}>
        <IconSymbol size={48} name={icon} color={Colors.primary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl * 2,
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  description: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.body,
    maxWidth: 320,
    marginBottom: Spacing.xl,
  },

  actionButton: {
    minWidth: 200,
  },
});
