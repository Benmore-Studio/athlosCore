import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sentry from '@sentry/react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level ErrorBoundary for wrapping individual screens or sections.
 * Shows inline error state instead of full app crash.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName } = this.props;

    // Log to Sentry with component context
    Sentry.captureException(error, {
      tags: {
        component: componentName || 'UnnamedComponent',
        errorBoundary: 'component-level',
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error(`ComponentErrorBoundary (${componentName}) caught an error:`, error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default inline error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                name="exclamationmark.triangle.fill" 
                size={48} 
                color={Colors.light.error}
              />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            
            <Text style={styles.message}>
              {this.state.error.message || 'An unexpected error occurred in this section'}
            </Text>

            <TouchableOpacity
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E97A42', '#E97A42']}
                style={styles.retryButton}
              >
                <IconSymbol 
                  name="arrow.clockwise" 
                  size={18} 
                  color="#fff"
                />
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText} numberOfLines={5}>
                  {this.state.error.stack}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.background,
  },

  content: {
    alignItems: 'center',
    maxWidth: 400,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 122, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  message: {
    fontSize: Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },

  retryText: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: '700',
  },

  debugContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    width: '100%',
  },

  debugTitle: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },

  debugText: {
    fontSize: Typography.caption,
    color: Colors.light.textLight,
    fontFamily: 'monospace',
  },
});

export default ComponentErrorBoundary;