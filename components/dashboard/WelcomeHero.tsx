// File: components/dashboard/WelcomeHero.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import { BorderRadius, Spacing, Typography, Animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WelcomeHeroProps {
  coachName: string;
  coachImageUri?: string;
  record: string;
  nextGame: string;
  onViewFilm: () => void;
}

export default function WelcomeHero({ coachName, coachImageUri, record, nextGame, onViewFilm }: WelcomeHeroProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.press, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={ZoomIn.delay(600).duration(800).springify()}>
      <Card variant="gradient" padding="large" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Welcome back, {coachName.split(' ')[0]}! 🏀
            </Text>
            <View style={styles.stats}>
              <View style={styles.badge}>
                <IconSymbol name="star.fill" size={14} color={'dark'} />
                <Text style={styles.badgeText}>{record}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.subtitle}>Next: {nextGame}</Text>
            </View>
          </View>
          
          <PlayerAvatar
            name={coachName}
            imageUri={coachImageUri}
            size="large"
            variant="gradient"
            showJerseyNumber={false}
            online
          />
        </View>

        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onViewFilm}
          style={[buttonAnimatedStyle, styles.buttonContainer]}
        >
          <BlurView intensity={20} tint="light" style={styles.button}>
            <IconSymbol name="video.fill" size={20} color={'dark'} />
            <Text style={styles.buttonText}>View Latest Game Film</Text>
            <IconSymbol name="arrow.right" size={16} color={'dark'} />
          </BlurView>
        </AnimatedPressable>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: 'dark',
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: 'black',
    fontSize: Typography.footnote,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#E97A42',
  },
  subtitle: {
    fontSize: Typography.footnote,
    color: 'black',
    fontWeight: '600',
  },
  buttonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  buttonText: {
    color: 'black',
    fontSize: Typography.body,
    fontWeight: '700',
  },
});