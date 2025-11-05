// File: components/dashboard/DashboardHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';

interface DashboardHeaderProps {
  coachName: string;
  coachImageUri?: string;
  currentColors: any;
}

export default function DashboardHeader({ coachName, coachImageUri, currentColors }: DashboardHeaderProps) {
  const handleNotificationsPress = () => {
    console.log('Notifications pressed');
  };

  const handleSettingsPress = () => {
    console.log('Settings button pressed');
    console.log('Attempting navigation to /settings');
    
    try {
      // Try multiple navigation methods
      const success = router.push('/settings');
      console.log('Router.push returned:', success);
    } catch (error) {
      console.error('Navigation error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(600).springify()}>
      <LinearGradient
        colors={[currentColors.headerBackground, currentColors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {/* Logo */}
          <Animated.View 
            entering={FadeIn.delay(200).duration(600)}
            style={styles.logoContainer}
          >
            <LinearGradient
              colors={Gradients.primary.colors}
              start={Gradients.primary.start}
              end={Gradients.primary.end}
              style={[styles.logoBox, Shadows.primaryGlow]}
            >
              <Text style={styles.logoText}>A</Text>
            </LinearGradient>
            <Text style={[styles.logoSubtext, { color: currentColors.text }]}>
              AthlosCore™
            </Text>
          </Animated.View>

          {/* Header Actions */}
          <Animated.View 
            entering={FadeIn.delay(400).duration(600)}
            style={styles.headerRight}
          >
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: currentColors.surface }]}
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
            >
              <IconSymbol 
                name="bell.fill" 
                size={20} 
                color={currentColors.primary}
                badge={3}
                animated
                animationType="pulse"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: currentColors.surface }]}
              onPress={handleSettingsPress}
              activeOpacity={0.7}
            >
              <IconSymbol name="gear" size={20} color={currentColors.text} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: Typography.title2,
    fontWeight: '900',
    color: Colors.textOnPrimary,
  },
  logoSubtext: {
    fontSize: Typography.callout,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
});