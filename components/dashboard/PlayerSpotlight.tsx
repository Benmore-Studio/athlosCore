// File: components/dashboard/PlayerSpotlight.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import Card from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/playerAvatar';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Player {
  id: string;
  name: string;
  imageUri?: string;
  jerseyNumber: string;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
  };
}

interface PlayerSpotlightProps {
  players: Player[];
  onSeeAll: () => void;
  onPlayerPress: () => void;
  currentColors: any;
}

export default function PlayerSpotlight({ players, onSeeAll, onPlayerPress, currentColors }: PlayerSpotlightProps) {
  return (
    <Animated.View entering={SlideInRight.delay(1800).springify()} style={styles.container}>
      <Card variant="elevated" padding="large">
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentColors.text }]}>Player Spotlight</Text>
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: currentColors.primary }]}>All Players</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {players.map((player, index) => (
            <Animated.View key={player.id} entering={FadeIn.delay(2000 + index * 150).duration(400)}>
              <TouchableOpacity 
                style={[styles.item, { backgroundColor: currentColors.surface }]}
                activeOpacity={0.7}
                onPress={onPlayerPress}
              >
                <PlayerAvatar
                  name={player.name}
                  imageUri={player.imageUri}
                  jerseyNumber={player.jerseyNumber}
                  size="medium"
                  variant="gradient"
                />
                
                <View style={styles.info}>
                  <Text style={[styles.name, { color: currentColors.text }]}>{player.name}</Text>
                  <View style={[styles.badge, { backgroundColor: currentColors.primary }]}>
                    <Text style={styles.role}>TOP SCORER</Text>
                  </View>
                  <Text style={[styles.stats, { color: currentColors.textSecondary }]}>
                    {player.stats.points}P • {player.stats.rebounds}R • {player.stats.assists}A
                  </Text>
                </View>

                <IconSymbol name="chevron.right" size={20} color={currentColors.textLight} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  name: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  role: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: 'dark',
  },
  stats: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
});