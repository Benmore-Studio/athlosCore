import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { onboardingSteps, mockCoach } from '@/data/mockData';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { useResponsive } from '@/hooks/useResponsive';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function WelcomeScreen() {
  const { isTablet, isLandscape } = useResponsive();

  const handleGetStarted = () => {
    router.push('/(tabs)');
  };

  const handleSkipTutorial = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
            <Text style={styles.logoSubtext}>ATHLOSCORE</Text>
          </View>
          <View style={styles.coachInfo}>
            <PlayerAvatar
              name={mockCoach.name}
              imageUri={mockCoach.imageUri}
              size="medium"
              showJerseyNumber={false}
            />
            <Text style={styles.coachName}>{mockCoach.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={[
          styles.welcomeSection,
          isTablet && isLandscape && styles.tabletLandscapeContainer
        ]}>
          <Text style={styles.welcomeTitle}>WELCOME TO ATHLOSCORE</Text>

          {/* Steps Overview */}
          <View style={[
            styles.stepsContainer,
            isTablet && isLandscape && styles.tabletStepsGrid
          ]}>
            {onboardingSteps.map((step, index) => (
              <View key={step.id} style={[
                styles.stepItem,
                isTablet && isLandscape && styles.tabletStepItem
              ]}>
                <View style={styles.stepIcon}>
                  {step.id === 'step1' && <IconSymbol size={32} name="sportscourt.fill" color={Colors.textOnPrimary} />}
                  {step.id === 'step2' && <IconSymbol size={32} name="video.fill" color={Colors.textOnPrimary} />}
                  {step.id === 'step3' && <IconSymbol size={32} name="brain.head.profile" color={Colors.textOnPrimary} />}
                  {step.id === 'step4' && <IconSymbol size={32} name="figure.basketball" color={Colors.textOnPrimary} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Step {index + 1}</Text>
                  <Text style={styles.stepSubtitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Basketball Analytics Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.analyticsDisplay}>
              <IconSymbol size={80} name="chart.line.uptrend.xyaxis" color={Colors.primary} />
              <Text style={styles.illustrationText}>AI-Powered Analytics</Text>
            </View>
          </View>

          {/* Quick Start Guide */}
          <Card variant="outlined" style={styles.guideCard}>
            <Text style={styles.guideTitle}>Quick Start Guide</Text>
            <View style={styles.guideList}>
              <Text style={styles.guideItem}>• Analyze recent games</Text>
              <Text style={styles.guideItem}>• Track player progress</Text>
              <Text style={styles.guideItem}>• Identify improvement areas</Text>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="GET STARTED"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              style={styles.primaryButton}
            />
            <Button
              title="SKIP TUTORIAL"
              onPress={handleSkipTutorial}
              variant="ghost"
              size="medium"
              style={styles.skipButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.headerBackground,
    paddingVertical: Spacing.lg,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    fontSize: Typography.title1,
    fontWeight: '800',
    color: Colors.headerText,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },

  logoSubtext: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.headerText,
    letterSpacing: 1,
  },

  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  coachName: {
    fontSize: Typography.callout,
    fontWeight: '500',
    color: Colors.headerText,
    marginLeft: Spacing.sm,
  },

  content: {
    flex: 1,
  },

  welcomeSection: {
    padding: Spacing.screenPadding,
    alignItems: 'center',
  },

  welcomeTitle: {
    fontSize: Typography.title1,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  stepsContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },

  stepIcon: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  stepContent: {
    flex: 1,
    paddingTop: Spacing.xs,
  },

  stepTitle: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },

  stepSubtitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  stepDescription: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.normal * Typography.callout,
  },

  illustrationContainer: {
    width: '100%',
    aspectRatio: 2,
    marginBottom: Spacing.xl,
  },

  analyticsDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  illustrationText: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },

  guideCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },

  guideTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  guideList: {
    gap: Spacing.sm,
  },

  guideItem: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.normal * Typography.body,
  },

  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
  },

  primaryButton: {
    width: '100%',
    maxWidth: 300,
  },

  skipButton: {
    width: '100%',
    maxWidth: 200,
  },

  // Responsive styles for iPad landscape
  tabletLandscapeContainer: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  tabletStepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },

  tabletStepItem: {
    flex: 1,
    minWidth: 280,
    marginBottom: Spacing.md,
  },
});