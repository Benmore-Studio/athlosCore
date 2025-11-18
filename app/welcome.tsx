import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { BorderRadius, Colors, DarkColors, Layout, Spacing, Typography, Shadows, Gradients, Animation } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import userService from '@/services/api/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 'step1',
    title: 'Create Your Team',
    description: 'Set up your roster and manage player information in one place',
  },
  {
    id: 'step2',
    title: 'Upload Game Videos',
    description: 'Upload game footage for AI-powered analysis and insights',
  },
  {
    id: 'step3',
    title: 'Track Performance',
    description: 'Monitor player stats, team metrics, and development progress',
  },
  {
    id: 'step4',
    title: 'Get AI Insights',
    description: 'Receive personalized coaching recommendations and strategies',
  },
];

interface Coach {
  id: string;
  name: string;
  imageUri?: string;
  email: string;
}

export default function WelcomeScreen() {
  const { isTablet, isLandscape } = useResponsive();
  const { currentColors, isDark } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);

  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);

  useEffect(() => {
    loadCoachProfile();
    
    // Floating animation for the illustration
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const loadCoachProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setCoach({
        id: profile.id,
        name: profile.name || profile.email,
        email: profile.email,
        imageUri: profile.avatar_url,
      });
    } catch (err) {
      console.error('Failed to load coach profile:', err);
      setCoach({
        id: 'default',
        name: 'Coach',
        email: 'coach@athloscore.com',
      });
    }
  };

  const handleGetStarted = async () => {
    // Mark welcome as seen
    await AsyncStorage.setItem('welcome_seen', 'true');
    // Go to interactive tutorial
    router.push('/tutorial');
  };

  const handleSkipTutorial = async () => {
    // Mark welcome and tutorial as complete
    await AsyncStorage.setItem('welcome_seen', 'true');
    await AsyncStorage.setItem('tutorial_completed', 'true');
    // Skip and go directly to app
    router.push('/(tabs)');
  };

  const handleQuickStart = () => {
    // Open tutorial screen
    router.push('/tutorial');
  };

  const handleViewHelp = () => {
    // Open help & FAQ screen
    router.push('/help');
  };

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const floatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const getStepIcon = (stepId: string) => {
    const iconMap = {
      step1: 'sportscourt.fill',
      step2: 'video.fill',
      step3: 'chart.line.uptrend.xyaxis',
      step4: 'star.fill',
    };
    return iconMap[stepId as keyof typeof iconMap] || 'star.fill';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Animated Header with Gradient */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={[currentColors.headerBackground, currentColors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {/* Logo with Animation */}
            <Animated.View 
              style={styles.logoContainer}
              entering={FadeIn.delay(200).duration(600)}
            >
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.logoBox, Shadows.primaryGlow]}
              >
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.logoSubtext, { color: currentColors.text }]}>
                  ATHLOSCORE
                </Text>
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>
                  AI Basketball Analytics
                </Text>
              </View>
            </Animated.View>

            {/* Coach Info with Blur */}
            {coach && (
              <Animated.View 
                entering={FadeIn.delay(400).duration(600)}
                style={styles.coachContainer}
              >
                <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.coachBlur}>
                  <PlayerAvatar
                    name={coach.name}
                    imageUri={coach.imageUri}
                    size="medium"
                    variant="gradient"
                    showJerseyNumber={false}
                    online
                  />
                  <View style={styles.coachTextContainer}>
                    <Text style={[styles.coachLabel, { color: currentColors.textLight }]}>
                      Your Coach
                    </Text>
                    <Text style={[styles.coachName, { color: currentColors.text }]}>
                      {coach.name}
                    </Text>
                  </View>
                </BlurView>
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Gradient Background */}
        <Animated.View 
          entering={ZoomIn.delay(600).duration(800).springify()}
          style={styles.heroSection}
        >
          <LinearGradient
            colors={[
              isDark ? 'rgba(233, 122, 66, 0.15)' : 'rgba(233, 122, 66, 0.08)',
              isDark ? 'rgba(233, 122, 66, 0.05)' : 'rgba(233, 122, 66, 0.02)',
              'transparent',
            ]}
            style={styles.heroGradient}
          >
            <Text style={[styles.welcomeTitle, { color: currentColors.text }]}>
              Welcome to the Future
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: currentColors.textSecondary }]}>
              Transform your game with AI-powered insights
            </Text>

            {/* Floating Illustration */}
            <Animated.View style={[styles.illustrationContainer, floatAnimatedStyle]}>
              <View style={[styles.illustrationCircle, { backgroundColor: currentColors.surface }]}>
                <LinearGradient
                  colors={Gradients.primary.colors}
                  start={Gradients.primary.start}
                  end={Gradients.primary.end}
                  style={styles.illustrationGradient}
                >
                  <IconSymbol 
                    name="chart.line.uptrend.xyaxis" 
                    size={64} 
                    color={Colors.textOnPrimary}
                  />
                </LinearGradient>
              </View>
              
              {/* Floating badges */}
              <Animated.View 
                style={[styles.floatingBadge, styles.badge1]}
                entering={FadeIn.delay(1000).duration(600)}
              >
                <LinearGradient
                  colors={[Colors.success, '#22C55E']}
                  style={styles.badgeGradient}
                >
                  <IconSymbol name="star.fill" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.badgeText}>AI Powered</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View 
                style={[styles.floatingBadge, styles.badge2]}
                entering={FadeIn.delay(1200).duration(600)}
              >
                <LinearGradient
                  colors={[Colors.info, Colors.primary]}
                  style={styles.badgeGradient}
                >
                  <IconSymbol name="video.fill" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.badgeText}>Video Analysis</Text>
                </LinearGradient>
              </Animated.View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Start Actions */}
        <Animated.View entering={FadeInUp.delay(1200).springify()}>
          <View style={styles.quickStartSection}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Quick Start
            </Text>
            
            <View style={styles.quickStartGrid}>
              <TouchableOpacity
                onPress={handleQuickStart}
                activeOpacity={0.7}
                style={styles.quickStartCard}
              >
                <Card variant="elevated_high" padding="large">
                  <View style={[styles.quickStartIcon, { backgroundColor: currentColors.primary + '20' }]}>
                    <IconSymbol name="play.circle.fill" size={32} color={currentColors.primary} />
                  </View>
                  <Text style={[styles.quickStartTitle, { color: currentColors.text }]}>
                    Interactive Tutorial
                  </Text>
                  <Text style={[styles.quickStartDescription, { color: currentColors.textSecondary }]}>
                    Step-by-step walkthrough
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleViewHelp}
                activeOpacity={0.7}
                style={styles.quickStartCard}
              >
                <Card variant="elevated_high" padding="large">
                  <View style={[styles.quickStartIcon, { backgroundColor: Colors.info + '20' }]}>
                    <IconSymbol name="questionmark.circle.fill" size={32} color={Colors.info} />
                  </View>
                  <Text style={[styles.quickStartTitle, { color: currentColors.text }]}>
                    Help & FAQ
                  </Text>
                  <Text style={[styles.quickStartDescription, { color: currentColors.textSecondary }]}>
                    Find answers quickly
                  </Text>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Feature Steps with Cards */}
        <View style={[
          styles.stepsContainer,
          isTablet && isLandscape && styles.tabletStepsGrid
        ]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            How It Works
          </Text>
          
          {onboardingSteps.map((step, index) => (
            <Animated.View
              key={step.id}
              entering={SlideInRight.delay(1400 + index * 150).springify()}
              style={[
                styles.stepCard,
                isTablet && isLandscape && styles.tabletStepItem
              ]}
            >
              <Card 
                variant="elevated_high" 
                padding="large"
                style={styles.stepCardInner}
              >
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={Gradients.primary.colors}
                    start={Gradients.primary.start}
                    end={Gradients.primary.end}
                    style={[styles.stepIcon, Shadows.primaryGlow]}
                  >
                    <IconSymbol 
                      size={28} 
                      name={getStepIcon(step.id)} 
                      color={Colors.textOnPrimary}
                    />
                  </LinearGradient>
                  
                  <View style={[styles.stepBadge, { backgroundColor: currentColors.primary }]}>
                    <Text style={styles.stepBadgeText}>Step {index + 1}</Text>
                  </View>
                </View>

                <Text style={[styles.stepTitle, { color: currentColors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDescription, { color: currentColors.textSecondary }]}>
                  {step.description}
                </Text>

                {/* Progress indicator */}
                <View style={[styles.progressBar, { backgroundColor: currentColors.border }]}>
                  <Animated.View 
                    entering={FadeIn.delay(1600 + index * 150).duration(800)}
                    style={styles.progressBarInner}
                  >
                    <LinearGradient
                      colors={Gradients.primary.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${(index + 1) * 25}%` }]}
                    />
                  </Animated.View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* Quick Stats Grid */}
        <Animated.View 
          entering={FadeInUp.delay(2000).springify()}
          style={styles.statsGrid}
        >
          <View style={styles.statsRow}>
            <Card variant="glass" padding="medium" style={styles.statCard}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color={currentColors.primary} />
              <Text style={[styles.statValue, { color: currentColors.text }]}>AI-Powered</Text>
              <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Analytics</Text>
            </Card>

            <Card variant="glass" padding="medium" style={styles.statCard}>
              <IconSymbol name="video.fill" size={32} color={currentColors.primary} />
              <Text style={[styles.statValue, { color: currentColors.text }]}>Video</Text>
              <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Analysis</Text>
            </Card>

            <Card variant="glass" padding="medium" style={styles.statCard}>
              <IconSymbol name="star.fill" size={32} color={currentColors.primary} />
              <Text style={[styles.statValue, { color: currentColors.text }]}>Real-Time</Text>
              <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Insights</Text>
            </Card>
          </View>
        </Animated.View>

        {/* Feature Highlights */}
        <Animated.View entering={FadeInUp.delay(2200).springify()}>
          <Card variant="gradient" padding="large" style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <IconSymbol name="star.fill" size={24} color={Colors.textOnPrimary} />
              <Text style={styles.highlightTitle}>What You'll Get</Text>
            </View>
            
            <View style={styles.highlightList}>
              {[
                { icon: 'chart.line.uptrend.xyaxis', text: 'Advanced game analytics & insights' },
                { icon: 'video.fill', text: 'AI-powered video breakdown' },
                { icon: 'person.fill', text: 'Individual player tracking' },
                { icon: 'star.fill', text: 'Performance improvement plans' },
              ].map((item, index) => (
                <Animated.View 
                  key={index}
                  entering={FadeIn.delay(2400 + index * 100).duration(400)}
                  style={styles.highlightItem}
                >
                  <IconSymbol name={item.icon} size={20} color={Colors.textOnPrimary} />
                  <Text style={styles.highlightText}>{item.text}</Text>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={Colors.textOnPrimary} />
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInUp.delay(2600).springify()}
          style={styles.buttonContainer}
        >
          <AnimatedPressable
            style={[buttonAnimatedStyle, styles.fullWidth]}
            onPress={handleGetStarted}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Button
              title="Start Tutorial"
              onPress={handleGetStarted}
              variant="primaryGradient"
              size="large"
              icon={<IconSymbol name="play.fill" size={20} color={Colors.textOnPrimary} />}
              iconPosition="right"
              fullWidth
            />
          </AnimatedPressable>

          <Button
            title="Skip to Dashboard"
            onPress={handleSkipTutorial}
            variant="ghost"
            size="medium"
            style={styles.skipButton}
          />

          <TouchableOpacity onPress={handleViewHelp} style={styles.helpLink}>
            <IconSymbol name="questionmark.circle.fill" size={20} color={currentColors.primary} />
            <Text style={[styles.helpLinkText, { color: currentColors.primary }]}>
              Need help? Visit Help Center
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
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
    gap: Spacing.md,
  },

  logoBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
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

  logoTagline: {
    fontSize: Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  coachContainer: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  coachBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  coachTextContainer: {
    gap: 2,
  },

  coachLabel: {
    fontSize: Typography.caption,
    fontWeight: '500',
  },

  coachName: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Hero Section
  heroSection: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },

  heroGradient: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },

  welcomeTitle: {
    fontSize: Typography.title1,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  welcomeSubtitle: {
    fontSize: Typography.body,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
    width: '100%',
  },

  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    ...Shadows.large,
  },

  illustrationGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingBadge: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.medium,
  },

  badge1: {
    top: 20,
    left: width < 400 ? 20 : 60,
  },

  badge2: {
    bottom: 20,
    right: width < 400 ? 20 : 60,
  },

  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  badgeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '700',
  },

  // Quick Start Section
  quickStartSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },

  quickStartGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  quickStartCard: {
    flex: 1,
  },

  quickStartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },

  quickStartTitle: {
    fontSize: Typography.callout,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  quickStartDescription: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },

  // Section Title
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },

  // Steps
  stepsContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },

  stepCard: {
    marginBottom: Spacing.sm,
  },

  stepCardInner: {
    width: '100%',
  },

  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },

  stepBadgeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.footnote,
    fontWeight: '700',
  },

  stepTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  stepDescription: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.4,
    marginBottom: Spacing.md,
  },

  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBarInner: {
    height: '100%',
  },

  progressFill: {
    height: '100%',
  },

  // Stats Grid
  statsGrid: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },

  statValue: {
    fontSize: Typography.callout,
    fontWeight: '700',
    textAlign: 'center',
  },

  statLabel: {
    fontSize: Typography.caption,
    textAlign: 'center',
  },

  // Highlight Card
  highlightCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },

  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  highlightTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  highlightList: {
    gap: Spacing.md,
  },

  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  highlightText: {
    flex: 1,
    fontSize: Typography.callout,
    color: Colors.textOnPrimary,
    fontWeight: '500',
  },

  // Buttons
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },

  fullWidth: {
    width: '100%',
  },

  skipButton: {
    width: '100%',
    maxWidth: 200,
  },

  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },

  helpLinkText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },

  // Responsive
  tabletStepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },

  tabletStepItem: {
    flex: 1,
    minWidth: 300,
  },
});