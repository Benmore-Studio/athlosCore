import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { SlideInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface Action {
  id: string;
  icon: string;
  label: string;
  gradient: { colors: string[] };
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface QuickActionsProps {
  actions: Action[];
  onActionPress: (actionId: string) => void;
  currentColors?: any;
  // ✅ NEW: Section accessibility
  sectionAccessibilityLabel?: string;
}

export default function QuickActions({ 
  actions, 
  onActionPress, 
  currentColors: propsColors,
  sectionAccessibilityLabel,
}: QuickActionsProps) {
  const { currentColors: contextColors } = useTheme();
  const currentColors = propsColors || contextColors;

  return (
    <Animated.View 
      entering={SlideInRight.delay(1000).springify()}
      accessible={true}
      accessibilityRole="menu"
      accessibilityLabel={sectionAccessibilityLabel || "Quick actions menu"}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>Quick Actions</Text>
      </View>
      
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <Animated.View 
            key={action.id}
            entering={ZoomIn.delay(1100 + index * 100).springify()}
            style={styles.cardWrapper}
          >
            <TouchableOpacity 
              onPress={() => onActionPress(action.id)} 
              activeOpacity={0.8}
              // ✅ ADD: Button accessibility
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel || action.label.replace('\n', ' ')}
              accessibilityHint={action.accessibilityHint}
            >
              <Card variant="elevated_high" padding="none" style={styles.card}>
                <LinearGradient
                  colors={action.gradient.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <IconSymbol name={action.icon} size={32} color={Colors.textOnPrimary} />
                </LinearGradient>
                <View style={styles.content}>
                  <Text style={[styles.label, { color: currentColors.text }]}>{action.label}</Text>
                  <IconSymbol name="chevron.right" size={16} color={currentColors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  cardWrapper: {
    width: '47%',
  },
  card: {
    overflow: 'hidden',
  },
  gradient: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  label: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    flex: 1,
    lineHeight: Typography.footnote * 1.3,
  },
});