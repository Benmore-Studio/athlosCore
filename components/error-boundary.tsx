import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react-native';
import ErrorScreen from './error-screen';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetErrorBoundary: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors to Sentry, and displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
        errorBoundary: true,
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }

      // Otherwise, use the default ErrorScreen
      return (
        <ErrorScreen 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;