// File: app/tutorial.tsx
// Place this file in your app directory: app/tutorial.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Colors, Spacing, Typography, Gradients } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  illustration: string;
  tips: string[];
  action?: {
    label: string;
    route: string;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Welcome to AthlosCore',
    description: 'Your AI-powered basketball analytics platform. Let\'s get you started with the basics.',
    icon: 'hand.wave.fill',
    illustration: '👋',
    tips: [
      'Track player performance',
      'Analyze game footage',
      'Get AI-powered insights',
    ],
  },
  {
    id: 'step-2',
    title: 'Create Your Team',
    description: 'Start by setting up your team roster. Add team details, players, and manage your lineup.',
    icon: 'person.3.fill',
    illustration: '🏀',
    tips: [
      'Tap the Teams tab at the bottom',
      'Press the + button to add a team',
      'Fill in team name and season',
      'Add players to your roster',
    ],
    action: {
      label: 'Go to Teams',
      route: '/(tabs)/teams',
    },
  },
  {
    id: 'step-3',
    title: 'Upload Game Footage',
    description: 'Upload videos of your games for AI analysis. We support MP4, MOV, and AVI formats.',
    icon: 'video.fill',
    illustration: '📹',
    tips: [
      'Navigate to Videos tab',
      'Tap Upload Video button',
      'Select video from device',
      'AI processes automatically',
      'Get results in 2-5 minutes',
    ],
    action: {
      label: 'Upload Video',
      route: '/(tabs)/videos',
    },
  },
  {
    id: 'step-4',
    title: 'View Player Analytics',
    description: 'Access detailed stats, performance metrics, and development recommendations for each player.',
    icon: 'chart.line.uptrend.xyaxis',
    illustration: '📊',
    tips: [
      'Go to Analytics tab',
      'Select a player to view',
      'See detailed statistics',
      'Compare multiple players',
      'Export performance reports',
    ],
    action: {
      label: 'View Analytics',
      route: '/(tabs)/explore',
    },
  },
  {
    id: 'step-5',
    title: 'Track Team Performance',
    description: 'Monitor your team\'s progress with comprehensive dashboards and insights.',
    icon: 'chart.bar.fill',
    illustration: '🏆',
    tips: [
      'View win/loss records',
      'Track team statistics',
      'Monitor player development',
      'Get coaching recommendations',
    ],
    action: {
      label: 'Open Dashboard',
      route: '/(tabs)',
    },
  },
  {
    id: 'step-6',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start using AthlosCore. Need help? Visit our Help center anytime.',
    icon: 'checkmark.circle.fill',
    illustration: '✨',
    tips: [
      'Explore all features',
      'Check Help & FAQ',
      'Contact support if needed',
      'Enjoy coaching smarter!',
    ],
  },
];

export default function TutorialScreen() {
  const { currentColors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('tutorial_completed', 'true');
    router.replace('/(tabs)');
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('tutorial_completed', 'true');
    setShowConfetti(true);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
  };

  const handleActionButton = () => {
    if (step.action) {
      router.push(step.action.route as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="xmark" size={24} color={currentColors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Quick Start Guide
        </Text>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, { color: currentColors.primary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: currentColors.border }]}>
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.progressBarWrapper}
          >
            <LinearGradient
              colors={Gradients.primary.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${progress}%` }]}
            />
          </Animated.View>
        </View>
        
        <Text style={[styles.progressText, { color: currentColors.textSecondary }]}>
          {currentStep + 1} of {TUTORIAL_STEPS.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          key={step.id}
          entering={SlideInRight.duration(400).springify()}
          exiting={SlideOutLeft.duration(300)}
        >
          {/* Illustration */}
          <Animated.View 
            entering={ZoomIn.delay(200).duration(600).springify()}
            style={styles.illustrationContainer}
          >
            <LinearGradient
              colors={[
                currentColors.primary + '15',
                currentColors.primary + '05',
                'transparent',
              ]}
              style={styles.illustrationGradient}
            >
              <View style={[styles.illustrationCircle, { backgroundColor: currentColors.surface }]}>
                <Text style={styles.illustration}>{step.illustration}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Title and Description */}
          <View style={styles.textContent}>
            <Animated.View 
              entering={FadeIn.delay(400).duration(600)}
              style={styles.iconBadge}
            >
              <LinearGradient
                colors={Gradients.primary.colors}
                style={styles.iconBadgeGradient}
              >
                <IconSymbol name={step.icon} size={24} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.stepTitle, { color: currentColors.text }]}>
              {step.title}
            </Text>
            
            <Text style={[styles.stepDescription, { color: currentColors.textSecondary }]}>
              {step.description}
            </Text>
          </View>

          {/* Tips */}
          <Card variant="elevated" padding="large" style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <IconSymbol name="lightbulb.fill" size={20} color={Colors.warning} />
              <Text style={[styles.tipsTitle, { color: currentColors.text }]}>
                Quick Tips
              </Text>
            </View>

            {step.tips.map((tip, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(600 + index * 100).duration(400)}
                style={styles.tipItem}
              >
                <View style={[styles.tipDot, { backgroundColor: currentColors.primary }]} />
                <Text style={[styles.tipText, { color: currentColors.textSecondary }]}>
                  {tip}
                </Text>
              </Animated.View>
            ))}
          </Card>

          {/* Action Button */}
          {step.action && (
            <Animated.View 
              entering={FadeIn.delay(800).duration(400)}
              style={styles.actionButtonContainer}
            >
              <Button
                title={step.action.label}
                onPress={handleActionButton}
                variant="outline"
                icon={<IconSymbol name="arrow.right.circle.fill" size={18} color={currentColors.primary} />}
                iconPosition="right"
                fullWidth
              />
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          {!isFirstStep && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="ghost"
              icon={<IconSymbol name="chevron.left" size={18} color={currentColors.text} />}
              style={styles.navButton}
            />
          )}
          
          <Button
            title={isLastStep ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primaryGradient"
            icon={
              <IconSymbol 
                name={isLastStep ? 'checkmark' : 'chevron.right'} 
                size={18} 
                color="#FFFFFF" 
              />
            }
            iconPosition="right"
            style={styles.nextButton}
          />
        </View>

        {/* Step Indicators */}
        <View style={styles.stepIndicators}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === currentStep
                  ? { backgroundColor: currentColors.primary }
                  : { backgroundColor: currentColors.border },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Confetti Effect (Last Step) */}
      {showConfetti && (
        <Animated.View 
          entering={ZoomIn.duration(600).springify()}
          style={styles.confettiOverlay}
        >
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.confettiText}>You're ready to go!</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    width: 60,
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  skipButton: {
    padding: Spacing.sm,
    width: 60,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarWrapper: {
    height: '100%',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: Typography.footnote,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  illustrationGradient: {
    width: width - Spacing.xl * 2,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xxl,
  },
  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    fontSize: 64,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconBadge: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  iconBadgeGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: Typography.body * 1.5,
    maxWidth: 320,
  },
  tipsCard: {
    marginBottom: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.callout,
    fontWeight: '700',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.4,
  },
  actionButtonContainer: {
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  confettiEmoji: {
    fontSize: 80,
  },
  confettiText: {
    fontSize: Typography.title1,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});