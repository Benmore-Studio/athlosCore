import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { performanceMonitor, memoryLeakDetector } from '../utils/performance';

const { width, height } = Dimensions.get('window');

export default function DevPerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [memoryReport, setMemoryReport] = useState<any>(null);
  const [slideAnim] = useState(new Animated.Value(width));
  const [refreshKey, setRefreshKey] = useState(0);

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  const togglePanel = () => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    } else {
      setIsVisible(true);
      refreshMetrics();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const refreshMetrics = () => {
    setMetrics(performanceMonitor.getMetricsSummary());
    setMemoryReport(memoryLeakDetector.getReport());
    setRefreshKey(prev => prev + 1);
  };

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    refreshMetrics();
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (loadTime: number) => {
    if (loadTime < 500) return '#4CAF50';
    if (loadTime < 1000) return '#FFC107';
    if (loadTime < 2000) return '#FF9800';
    return '#F44336';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={togglePanel}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>📊</Text>
      </TouchableOpacity>

      {/* Performance Panel Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={togglePanel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.closeArea}
            activeOpacity={1}
            onPress={togglePanel}
          />
          
          <Animated.View
            style={[
              styles.panel,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Performance Monitor</Text>
                <Text style={styles.headerSubtitle}>Development Mode</Text>
              </View>
              <TouchableOpacity onPress={togglePanel}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={refreshMetrics}
                >
                  <Text style={styles.actionButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.clearButton]}
                  onPress={clearMetrics}
                >
                  <Text style={styles.actionButtonText}>🗑️ Clear</Text>
                </TouchableOpacity>
              </View>

              {/* Screen Load Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Screen Load Performance</Text>
                
                {metrics && metrics.totalScreens > 0 ? (
                  <>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Average Load Time</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          { color: getPerformanceColor(metrics.avgLoadTime) },
                        ]}
                      >
                        {formatTime(metrics.avgLoadTime)}
                      </Text>
                    </View>

                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Total Screens Tracked</Text>
                      <Text style={styles.metricValue}>{metrics.totalScreens}</Text>
                    </View>

                    {metrics.slowestScreen && (
                      <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Slowest Screen</Text>
                        <Text style={styles.metricName}>
                          {metrics.slowestScreen.screenName}
                        </Text>
                        <Text
                          style={[
                            styles.metricValue,
                            { color: getPerformanceColor(metrics.slowestScreen.loadTime) },
                          ]}
                        >
                          {formatTime(metrics.slowestScreen.loadTime)}
                        </Text>
                      </View>
                    )}

                    {metrics.fastestScreen && (
                      <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Fastest Screen</Text>
                        <Text style={styles.metricName}>
                          {metrics.fastestScreen.screenName}
                        </Text>
                        <Text
                          style={[
                            styles.metricValue,
                            { color: getPerformanceColor(metrics.fastestScreen.loadTime) },
                          ]}
                        >
                          {formatTime(metrics.fastestScreen.loadTime)}
                        </Text>
                      </View>
                    )}

                    {/* Recent Screen Loads */}
                    <Text style={styles.subsectionTitle}>Recent Screen Loads</Text>
                    {performanceMonitor.getAllMetrics().reverse().slice(0, 10).map((metric, index) => (
                      <View key={`${metric.screenName}-${metric.timestamp}-${index}`} style={styles.recentMetric}>
                        <View style={styles.recentMetricLeft}>
                          <Text style={styles.recentMetricName}>{metric.screenName}</Text>
                          <Text style={styles.recentMetricTime}>
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.recentMetricBadge,
                            { backgroundColor: getPerformanceColor(metric.loadTime) },
                          ]}
                        >
                          <Text style={styles.recentMetricValue}>
                            {formatTime(metric.loadTime)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No metrics collected yet
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Navigate to different screens to collect data
                    </Text>
                  </View>
                )}
              </View>

              {/* Memory Leak Detection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Memory Leak Detection</Text>
                
                {memoryReport && (
                  <>
                    {/* Listeners */}
                    <Text style={styles.subsectionTitle}>Event Listeners</Text>
                    {memoryReport.listeners.length > 0 ? (
                      memoryReport.listeners.map((item: any, index: number) => (
                        <View
                          key={`listener-${index}`}
                          style={[
                            styles.leakItem,
                            item.warning && styles.leakItemWarning,
                          ]}
                        >
                          <Text style={styles.leakItemName}>{item.component}</Text>
                          <View style={styles.leakItemRight}>
                            <Text
                              style={[
                                styles.leakItemCount,
                                item.warning && styles.leakItemCountWarning,
                              ]}
                            >
                              {item.count}
                            </Text>
                            {item.warning && (
                              <Text style={styles.warningIcon}>⚠️</Text>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No active listeners</Text>
                    )}

                    {/* Timers */}
                    <Text style={styles.subsectionTitle}>Active Timers</Text>
                    {memoryReport.timers.length > 0 ? (
                      memoryReport.timers.map((item: any, index: number) => (
                        <View
                          key={`timer-${index}`}
                          style={[
                            styles.leakItem,
                            item.warning && styles.leakItemWarning,
                          ]}
                        >
                          <Text style={styles.leakItemName}>{item.component}</Text>
                          <View style={styles.leakItemRight}>
                            <Text
                              style={[
                                styles.leakItemCount,
                                item.warning && styles.leakItemCountWarning,
                              ]}
                            >
                              {item.count}
                            </Text>
                            {item.warning && (
                              <Text style={styles.warningIcon}>⚠️</Text>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No active timers</Text>
                    )}
                  </>
                )}
              </View>

              {/* Performance Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Guidelines</Text>
                <View style={styles.tipCard}>
                  <Text style={styles.tipEmoji}>🟢</Text>
                  <Text style={styles.tipText}>Excellent: &lt; 500ms</Text>
                </View>
                <View style={styles.tipCard}>
                  <Text style={styles.tipEmoji}>🟡</Text>
                  <Text style={styles.tipText}>Good: 500ms - 1s</Text>
                </View>
                <View style={styles.tipCard}>
                  <Text style={styles.tipEmoji}>🟠</Text>
                  <Text style={styles.tipText}>Fair: 1s - 2s</Text>
                </View>
                <View style={styles.tipCard}>
                  <Text style={styles.tipEmoji}>🔴</Text>
                  <Text style={styles.tipText}>Slow: &gt; 2s</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  closeArea: {
    flex: 1,
  },
  panel: {
    width: width * 0.85,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    fontSize: 28,
    color: '#888',
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 16,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  metricName: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  recentMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentMetricLeft: {
    flex: 1,
  },
  recentMetricName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  recentMetricTime: {
    fontSize: 12,
    color: '#888',
  },
  recentMetricBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentMetricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  leakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leakItemWarning: {
    backgroundColor: '#3F2020',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  leakItemName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  leakItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leakItemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  leakItemCountWarning: {
    color: '#F44336',
  },
  warningIcon: {
    fontSize: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
  },
});