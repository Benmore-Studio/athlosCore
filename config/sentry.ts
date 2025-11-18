// config/sentry.ts
import { Platform } from 'react-native';

// Safely import Sentry - make it optional
let Sentry: any = null;
let sentryAvailable = false;

try {
  Sentry = require('@sentry/react-native');
  sentryAvailable = true;
  console.log('✅ Sentry package found');
} catch (error) {
  console.log('⚠️ Sentry not installed - performance monitoring disabled');
  console.log('💡 To enable: npm install @sentry/react-native');
}

// Initialize Sentry with performance monitoring
export const initializeSentry = () => {
  if (!sentryAvailable || !Sentry) {
    console.log('📊 Running without Sentry (dev mode only)');
    return;
  }

  try {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your Sentry DSN
      
      // Enable performance monitoring
      enableAutoPerformanceTracing: true,
      enableAutoSessionTracking: true,
      
      // Performance monitoring options
      tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
      
      // Session replay sample rate
      replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Environment
      environment: __DEV__ ? 'development' : 'production',
      
      // Enable native crash handling
      enableNativeCrashHandling: true,
      enableNativeNagger: __DEV__,
      
      // Attach stack traces
      attachStacktrace: true,
      
      // Enable profiling
      profilesSampleRate: __DEV__ ? 1.0 : 0.1,
      
      // Integrations
      integrations: [
        new Sentry.ReactNativeTracing({
          // Track slow/frozen frames
          enableNativeFramesTracking: true,
          
          // Track app start time
          enableAppStartTracking: true,
          
          // Enable stall tracking
          enableStallTracking: true,
          
          // Trace all network requests
          traceFetch: true,
          traceXHR: true,
        }),
      ],
      
      // Before send hook to add custom data
      beforeSend(event, hint) {
        // Add custom context
        event.contexts = {
          ...event.contexts,
          device: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        };
        
        // Filter out development errors
        if (__DEV__ && event.level === 'warning') {
          return null;
        }
        
        return event;
      },
      
      // Before breadcrumb hook
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter sensitive data from breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.data) {
          // Remove sensitive console logs
          const message = breadcrumb.message || '';
          if (message.includes('password') || message.includes('token')) {
            return null;
          }
        }
        
        return breadcrumb;
      },
    });
    
    console.log('🔒 [Sentry] Performance monitoring initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
};

// Safe wrappers for Sentry functions
export const trackScreenLoad = (screenName: string) => {
  if (!sentryAvailable || !Sentry) return { end: () => {}, setData: () => {} };
  
  const transaction = Sentry.startTransaction({
    name: screenName,
    op: 'navigation',
  });
  
  return {
    end: () => transaction.finish(),
    setData: (key: string, value: any) => transaction.setData(key, value),
  };
};

export const trackAPICall = (endpoint: string, method: string) => {
  if (!sentryAvailable || !Sentry) {
    return { 
      end: () => {}, 
      setStatus: () => {} 
    };
  }
  
  const transaction = Sentry.startTransaction({
    name: `${method} ${endpoint}`,
    op: 'http.client',
  });
  
  return {
    end: () => transaction.finish(),
    setStatus: (status: number) => {
      transaction.setHttpStatus(status);
    },
  };
};

export const trackAsyncOperation = async <T,>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  if (!sentryAvailable || !Sentry) {
    return await operation();
  }
  
  const transaction = Sentry.startTransaction({
    name: operationName,
    op: 'function',
  });
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('unknown_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
};

// Manual error tracking
export const logError = (
  error: Error,
  context?: Record<string, any>
) => {
  if (!sentryAvailable || !Sentry) {
    console.error('[Error]', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
};

export const logMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) => {
  if (!sentryAvailable || !Sentry) {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};