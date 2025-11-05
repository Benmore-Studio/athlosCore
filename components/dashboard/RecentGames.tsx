// File: components/dashboard/RecentGames.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ Added: Import theme context
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Game {
  home: string;
  away: string;
  score: string;
  date: string;
  win: boolean;
}

interface RecentGamesProps {
  games: Game[];
  onSeeAll: () => void;
  onGamePress: () => void;
  onCategoryPress: () => void;
  onWatchFilm: () => void;
  currentColors?: any; // ✅ Changed: Made optional
}

export default function RecentGames({ 
  games, 
  onSeeAll, 
  onGamePress, 
  onCategoryPress, 
  onWatchFilm, 
  currentColors: propsColors 
}: RecentGamesProps) {
  const { currentColors: contextColors } = useTheme(); // ✅ Added: Get colors from theme context
  const currentColors = propsColors || contextColors; // ✅ Added: Use props if provided, otherwise use context

  return (
    <Animated.View entering={FadeInUp.delay(1400).springify()}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>Recent Games</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: currentColors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <Card variant="elevated" padding="large" style={styles.card}>
        {games.map((game, index) => (
          <Animated.View key={index} entering={FadeIn.delay(1500 + index * 100).duration(400)}>
            <TouchableOpacity style={styles.gameItem} activeOpacity={0.7} onPress={onGamePress}>
              <View style={styles.gameContent}>
                <View style={[
                  styles.indicator,
                  { backgroundColor: game.win ? currentColors.success : currentColors.error }
                ]} />
                
                <View style={styles.teams}>
                  <Text style={[styles.teamName, { color: currentColors.text }]}>{game.home}</Text>
                  <Text style={[styles.vs, { color: currentColors.textLight }]}>vs</Text>
                  <Text style={[styles.teamName, { color: currentColors.text }]}>{game.away}</Text>
                </View>

                <View style={styles.gameRight}>
                  <Text style={[
                    styles.score,
                    { color: game.win ? currentColors.success : currentColors.error }
                  ]}>
                    {game.score}
                  </Text>
                  <Text style={[styles.date, { color: currentColors.textSecondary }]}>{game.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={styles.highlights}>
          <Text style={[styles.highlightsTitle, { color: currentColors.text }]}>Film Highlights</Text>
          <View style={styles.categories}>
            {['Offensive Sets', 'Defensive Stops', 'Key Plays'].map((category, index) => (
              <Animated.View key={index} entering={FadeIn.delay(1700 + index * 100).duration(400)}>
                <TouchableOpacity 
                  style={[
                    styles.category,
                    { backgroundColor: currentColors.surface, borderColor: currentColors.border }
                  ]}
                  onPress={onCategoryPress}
                >
                  <Text style={[styles.categoryLabel, { color: currentColors.text }]}>{category}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Button
            title="Watch Full Game Film"
            onPress={onWatchFilm}
            variant="primaryGradient"
            icon={<IconSymbol name="play.fill" size={18} color={'black'} />}
            fullWidth
          />
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: Spacing.xl,
  },
  gameItem: {
    marginBottom: Spacing.md,
  },
  gameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)', // ✅ Changed: Made dynamic-friendly
  },
  indicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  teams: {
    flex: 1,
  },
  teamName: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  vs: {
    fontSize: Typography.caption,
    marginVertical: Spacing.xs / 2,
    fontWeight: '500',
  },
  gameRight: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  date: {
    fontSize: Typography.footnote,
    marginTop: Spacing.xs / 2,
  },
  highlights: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)', // ✅ Changed: Made dynamic-friendly
  },
  highlightsTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  categories: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  category: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: Typography.footnote,
    fontWeight: '600',
  },
});