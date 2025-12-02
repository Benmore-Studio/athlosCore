import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export interface AIInsight {
  id: string;
  type: 'improvement' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  metric?: {
    value: number;
    change: number;
    unit: string;
  };
  relatedPlayerId?: string;
  timestamp?: Date;
}

interface AIInsightsCardProps {
  insights: AIInsight[];
  onViewAll?: () => void;
  onInsightPress?: (insight: AIInsight) => void;
  maxDisplay?: number;
  animationDelay?: number;
}

export default function AIInsightsCard({
  insights,
  onViewAll,
  onInsightPress,
  maxDisplay = 2,
  animationDelay = 250,
}: AIInsightsCardProps) {
  const { currentColors, isDarkMode } = useTheme();

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'improvement': return 'arrow.up.circle.fill';
      case 'trend': return 'chart.line.uptrend.xyaxis';
      case 'alert': return 'exclamationmark.triangle.fill';
      case 'recommendation': return 'lightbulb.fill';
      default: return 'sparkles';
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'improvement': return Colors.success;
      case 'trend': return Colors.info;
      case 'alert': return Colors.warning;
      case 'recommendation': return Colors.primary;
      default: return Colors.primary;
    }
  };

  const displayedInsights = insights.slice(0, maxDisplay);

  if (insights.length === 0) {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={styles.container}
      >
        <View style={[styles.emptyCard, { backgroundColor: currentColors.cardBackground }]}>
          <IconSymbol name="sparkles" size={24} color={currentColors.textLight} />
          <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
            AI insights will appear after analyzing game film
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(400)}
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="AI Coach Insights"
    >
      <LinearGradient
        colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#f8f9ff', '#eef2ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: isDarkMode ? '#2d3748' : '#e2e8f0' }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.aiIcon, { backgroundColor: Colors.primary + '20' }]}>
              <IconSymbol name="brain" size={16} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: currentColors.text }]}>
              Coach Vision AI
            </Text>
          </View>
          {onViewAll && insights.length > maxDisplay && (
            <TouchableOpacity
              onPress={onViewAll}
              accessibilityRole="button"
              accessibilityLabel="View all insights"
            >
              <Text style={[styles.viewAll, { color: Colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Insights List */}
        <View style={styles.insightsList}>
          {displayedInsights.map((insight, index) => (
            <TouchableOpacity
              key={insight.id}
              style={[
                styles.insightItem,
                index < displayedInsights.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: currentColors.border,
                },
              ]}
              onPress={() => onInsightPress?.(insight)}
              activeOpacity={onInsightPress ? 0.7 : 1}
              accessibilityRole="button"
              accessibilityLabel={`${insight.title}: ${insight.description}`}
            >
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: getInsightColor(insight.type) + '15' },
                ]}
              >
                <IconSymbol
                  name={getInsightIcon(insight.type)}
                  size={18}
                  color={getInsightColor(insight.type)}
                />
              </View>
              <View style={styles.insightContent}>
                <Text
                  style={[styles.insightTitle, { color: currentColors.text }]}
                  numberOfLines={1}
                >
                  {insight.title}
                </Text>
                <Text
                  style={[styles.insightDescription, { color: currentColors.textSecondary }]}
                  numberOfLines={2}
                >
                  {insight.description}
                </Text>
                {insight.metric && (
                  <View style={styles.metricRow}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: insight.metric.change >= 0 ? Colors.success : Colors.error },
                      ]}
                    >
                      {insight.metric.change >= 0 ? '+' : ''}
                      {insight.metric.change}
                      {insight.metric.unit}
                    </Text>
                  </View>
                )}
              </View>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={currentColors.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
  insightsList: {
    gap: 0,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: Typography.footnote,
    lineHeight: Typography.footnote * 1.4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metricValue: {
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  emptyText: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },
});
