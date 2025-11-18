import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Game {
  home: string;
  away: string;
  score: string;
  date: string;
  win: boolean;
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface RecentGamesProps {
  games: Game[];
  onSeeAll: () => void;
  onGamePress: () => void;
  onCategoryPress: () => void;
  onWatchFilm: () => void;
  currentColors?: any;
  // ✅ NEW: Section accessibility
  sectionAccessibilityLabel?: string;
  seeAllAccessibilityLabel?: string;
  seeAllAccessibilityHint?: string;
}

export default function RecentGames({ 
  games, 
  onSeeAll, 
  onGamePress, 
  onCategoryPress, 
  onWatchFilm, 
  currentColors: propsColors,
  sectionAccessibilityLabel,
  seeAllAccessibilityLabel,
  seeAllAccessibilityHint,
}: RecentGamesProps) {
  const { currentColors: contextColors } = useTheme();
  const currentColors = propsColors || contextColors;

  const categories = [
    { label: 'Offensive Sets', accessibilityLabel: 'View offensive sets highlights' },
    { label: 'Defensive Stops', accessibilityLabel: 'View defensive stops highlights' },
    { label: 'Key Plays', accessibilityLabel: 'View key plays highlights' },
  ];

  return (
    <Animated.View 
      entering={FadeInUp.delay(1400).springify()}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={sectionAccessibilityLabel || "Recent games section"}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>Recent Games</Text>
        <TouchableOpacity 
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={seeAllAccessibilityLabel || "See all games"}
          accessibilityHint={seeAllAccessibilityHint || "View complete game history"}
        >
          <Text style={[styles.seeAll, { color: currentColors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <Card variant="elevated" padding="large" style={styles.card}>
        {games.map((game, index) => (
          <Animated.View key={index} entering={FadeIn.delay(1500 + index * 100).duration(400)}>
            <TouchableOpacity 
              style={styles.gameItem} 
              activeOpacity={0.7} 
              onPress={onGamePress}
              // ✅ ADD: Game card accessibility
              accessibilityRole="button"
              accessibilityLabel={
                game.accessibilityLabel || 
                `${game.win ? 'Win' : 'Loss'} against ${game.away}, ${game.date}, final score ${game.score.replace('-', ' to ')}`
              }
              accessibilityHint={game.accessibilityHint || "Tap to view game details and statistics"}
            >
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

        <View 
          style={styles.highlights}
          accessible={true}
          accessibilityRole="menu"
          accessibilityLabel="Film highlights categories"
        >
          <Text style={[styles.highlightsTitle, { color: currentColors.text }]}>Film Highlights</Text>
          <View style={styles.categories}>
            {categories.map((category, index) => (
              <Animated.View key={index} entering={FadeIn.delay(1700 + index * 100).duration(400)}>
                <TouchableOpacity 
                  style={[
                    styles.category,
                    { backgroundColor: currentColors.surface, borderColor: currentColors.border }
                  ]}
                  onPress={onCategoryPress}
                  // ✅ ADD: Category accessibility
                  accessibilityRole="button"
                  accessibilityLabel={category.accessibilityLabel}
                  accessibilityHint="Opens filtered highlights for this category"
                >
                  <Text style={[styles.categoryLabel, { color: currentColors.text }]}>{category.label}</Text>
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
            // ✅ ADD: Button accessibility (uses enhanced Button component)
            accessibilityLabel="Watch full game film"
            accessibilityHint="Opens the complete game recording with all plays"
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
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
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