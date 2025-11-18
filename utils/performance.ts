// utils/performance.ts
import { InteractionManager, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface PerformanceMetrics {
  screenName: string;
  loadTime: number;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private screenMetrics: PerformanceMetrics[] = [];
  private maxStoredMetrics = 50;

  // Start tracking screen load
  startScreenLoad(screenName: string) {
    const key = `screen_${screenName}_start`;
    this.metrics.set(key, Date.now());
    
    if (__DEV__) {
      console.log(`📊 [Performance] Started tracking: ${screenName}`);
    }
  }

  // End tracking screen load
  endScreenLoad(screenName: string) {
    const key = `screen_${screenName}_start`;
    const startTime = this.metrics.get(key);
    
    if (!startTime) {
      console.warn(`No start time found for ${screenName}`);
      return;
    }

    const loadTime = Date.now() - startTime;
    this.metrics.delete(key);

    // Store metrics
    const metric: PerformanceMetrics = {
      screenName,
      loadTime,
      renderTime: loadTime,
      timestamp: Date.now(),
    };

    this.screenMetrics.push(metric);
    
    // Keep only last N metrics
    if (this.screenMetrics.length > this.maxStoredMetrics) {
      this.screenMetrics.shift();
    }

    // Log to console in dev
    if (__DEV__) {
      console.log(
        `📊 [Performance] ${screenName} loaded in ${loadTime}ms`,
        this.getPerformanceLevel(loadTime)
      );
    }

    // Send to Sentry in production
    if (!__DEV__) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Screen load: ${screenName}`,
        level: 'info',
        data: {
          loadTime,
          screenName,
        },
      });

      // Create transaction for slow screens
      if (loadTime > 3000) {
        const transaction = Sentry.startTransaction({
          name: `slow_screen_${screenName}`,
          op: 'screen.load',
        });

        transaction.setMeasurement('screen_load_time', loadTime, 'millisecond');
        transaction.finish();
      }
    }

    return loadTime;
  }

  // Track interaction to interactive
  trackInteractive(screenName: string, startTime: number) {
    InteractionManager.runAfterInteractions(() => {
      const interactiveTime = Date.now() - startTime;
      
      if (__DEV__) {
        console.log(
          `📊 [Performance] ${screenName} interactive in ${interactiveTime}ms`
        );
      }

      if (!__DEV__) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Screen interactive: ${screenName}`,
          level: 'info',
          data: {
            interactiveTime,
            screenName,
          },
        });
      }
    });
  }

  // Start tracking custom operation
  startOperation(operationName: string) {
    this.metrics.set(operationName, Date.now());
  }

  // End tracking custom operation
  endOperation(operationName: string) {
    const startTime = this.metrics.get(operationName);
    
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(operationName);

    if (__DEV__) {
      console.log(`📊 [Performance] ${operationName} took ${duration}ms`);
    }

    if (!__DEV__) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: operationName,
        level: 'info',
        data: { duration },
      });
    }

    return duration;
  }

  // Get performance level indicator
  private getPerformanceLevel(loadTime: number): string {
    if (loadTime < 500) return '🟢 Excellent';
    if (loadTime < 1000) return '🟡 Good';
    if (loadTime < 2000) return '🟠 Fair';
    return '🔴 Slow';
  }

  // Get metrics summary
  getMetricsSummary() {
    const summary = {
      totalScreens: this.screenMetrics.length,
      avgLoadTime: 0,
      slowestScreen: null as PerformanceMetrics | null,
      fastestScreen: null as PerformanceMetrics | null,
    };

    if (this.screenMetrics.length === 0) {
      return summary;
    }

    const totalTime = this.screenMetrics.reduce(
      (sum, metric) => sum + metric.loadTime,
      0
    );
    summary.avgLoadTime = totalTime / this.screenMetrics.length;

    summary.slowestScreen = this.screenMetrics.reduce((slowest, current) =>
      current.loadTime > slowest.loadTime ? current : slowest
    );

    summary.fastestScreen = this.screenMetrics.reduce((fastest, current) =>
      current.loadTime < fastest.loadTime ? current : fastest
    );

    return summary;
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
    this.screenMetrics = [];
    console.log('📊 [Performance] Metrics cleared');
  }

  // Get all screen metrics
  getAllMetrics() {
    return [...this.screenMetrics];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Memory leak detector
export class MemoryLeakDetector {
  private listeners: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();
  private maxListeners = 10;
  private maxTimers = 20;

  trackListener(componentName: string) {
    const count = (this.listeners.get(componentName) || 0) + 1;
    this.listeners.set(componentName, count);

    if (count > this.maxListeners) {
      console.warn(
        `⚠️ [Memory] Potential memory leak in ${componentName}: ${count} listeners`
      );
      
      if (!__DEV__) {
        Sentry.captureMessage(`Potential memory leak: ${componentName}`, {
          level: 'warning',
          extra: { listenerCount: count },
        });
      }
    }
  }

  removeListener(componentName: string) {
    const count = this.listeners.get(componentName) || 0;
    if (count > 0) {
      this.listeners.set(componentName, count - 1);
    }
  }

  trackTimer(componentName: string) {
    const count = (this.timers.get(componentName) || 0) + 1;
    this.timers.set(componentName, count);

    if (count > this.maxTimers) {
      console.warn(
        `⚠️ [Memory] Potential timer leak in ${componentName}: ${count} timers`
      );
      
      if (!__DEV__) {
        Sentry.captureMessage(`Potential timer leak: ${componentName}`, {
          level: 'warning',
          extra: { timerCount: count },
        });
      }
    }
  }

  removeTimer(componentName: string) {
    const count = this.timers.get(componentName) || 0;
    if (count > 0) {
      this.timers.set(componentName, count - 1);
    }
  }

  getReport() {
    return {
      listeners: Array.from(this.listeners.entries()).map(([name, count]) => ({
        component: name,
        count,
        warning: count > this.maxListeners,
      })),
      timers: Array.from(this.timers.entries()).map(([name, count]) => ({
        component: name,
        count,
        warning: count > this.maxTimers,
      })),
    };
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();