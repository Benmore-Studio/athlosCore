// hooks/usePerformanceTracking.ts
import { useEffect } from 'react';
import { performanceMonitor, memoryLeakDetector } from '@/utils/performance';

// Hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    performanceMonitor.startOperation(`render_${componentName}`);

    return () => {
      performanceMonitor.endOperation(`render_${componentName}`);
    };
  }, [componentName]);
}

// Hook for tracking memory leaks
export function useMemoryLeakDetection(componentName: string) {
  useEffect(() => {
    // Track component mount
    memoryLeakDetector.trackListener(componentName);

    return () => {
      // Track component unmount
      memoryLeakDetector.removeListener(componentName);
    };
  }, [componentName]);
}

// Hook for tracking screen loads
export function useScreenTracking(screenName: string) {
  useEffect(() => {
    const startTime = Date.now();
    performanceMonitor.startScreenLoad(screenName);

    // Track when screen becomes interactive
    const timeout = setTimeout(() => {
      performanceMonitor.endScreenLoad(screenName);
      performanceMonitor.trackInteractive(screenName, startTime);
    }, 0);

    return () => clearTimeout(timeout);
  }, [screenName]);
}