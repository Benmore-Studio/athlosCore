// File: components/games/GameCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Button from '@/components/ui/Button';
import { BorderRadius, Colors, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import TopPerformers from './TopPerformers';

interface GameCardProps {
  game: any;
  isSelected: boolean;
  onPress: () => void;
  onViewHighlights: () => void;
  currentColors: any;
  isDark: boolean;
  // ✅ NEW: Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function GameCard({
  game,
  isSelected,
  onPress,
  onViewHighlights,
  currentColors,
  isDark,
  accessibilityLabel,
  accessibilityHint,
}: GameCardProps) {
  const getGameResult = () => {
    if (game.score.home > game.score.away) {
      return { result: 'W', isWin: true, margin: game.score.home - game.score.away };
    } else {
      return { result: 'L', isWin: false, margin: game.score.away - game.score.home };
    }
  };

  const gameResult = getGameResult();

  // ✅ NEW: Generate comprehensive accessibility label
  const generateAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;

    const resultText = gameResult.isWin ? 'Win' : 'Loss';
    const marginText = `by ${gameResult.margin} points`;
    const highlightsText = game.highlights ? `, ${game.highlights.length} highlights available` : '';
    const statsText = game.boxScore 
      ? `. Field goal percentage: ${game.boxScore.teamStats.fieldGoalPercentage} percent. Three point percentage: ${game.boxScore.teamStats.threePointPercentage} percent. Rebounds: ${game.boxScore.teamStats.rebounds}. Turnovers: ${game.boxScore.teamStats.turnovers}.`
      : '';

    return `${resultText} against ${game.awayTeam.name} on ${game.date}, ${marginText}. Final score: ${game.homeTeam.name} ${game.score.home}, ${game.awayTeam.name} ${game.score.away}${highlightsText}${statsText}`;
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.9} 
      style={styles.wrapper}
      // ✅ ADD: Card accessibility
      accessibilityRole="button"
      accessibilityLabel={generateAccessibilityLabel()}
      accessibilityHint={accessibilityHint || (isSelected ? "Double tap to collapse game details" : "Double tap to expand game details")}
      accessibilityState={{ selected: isSelected }}
    >
      <Card
        variant="elevated_high"
        padding="none"
        style={[
          styles.card,
          isSelected && { borderWidth: 2, borderColor: currentColors.primary }
        ]}
      >
        {/* Game Thumbnail */}
        <View 
          style={styles.thumbnail}
          accessible={false} // Parent handles accessibility
        >
          {game.thumbnail ? (
            <Image 
              source={{ uri: game.thumbnail }} 
              style={styles.thumbnailImage}
              accessible={false} // Decorative in this context
            />
          ) : (
            <LinearGradient
              colors={gameResult.isWin ? Gradients.success.colors : [Colors.error, '#F87171']}
              style={styles.placeholderThumbnail}
            >
              <IconSymbol name="video.fill" size={56} color={'dark'} />
            </LinearGradient>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
            style={styles.thumbnailOverlay}
          >
            <View style={styles.thumbnailInfo}>
              <View 
                style={[
                  styles.resultBadge,
                  { backgroundColor: gameResult.isWin ? Colors.success : Colors.error }
                ]}
                accessible={false} // Parent handles accessibility
              >
                <Text style={styles.resultText}>{gameResult.result}</Text>
                <Text style={styles.marginText}>+{gameResult.margin}</Text>
              </View>

              {game.highlights && (
                <View 
                  style={styles.highlightsBadge}
                  accessible={false} // Parent handles accessibility
                >
                  <IconSymbol name="star.fill" size={14} color={'dark'} />
                  <Text style={styles.highlightsBadgeText}>{game.highlights.length}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Game Info */}
        <View 
          style={[styles.gameInfo, { backgroundColor: currentColors.cardBackground }]}
          accessible={false} // Parent handles accessibility
        >
          {/* Teams Row */}
          <View style={styles.teamsRow}>
            <View style={styles.teamSection}>
              <Text style={[styles.teamName, { color: currentColors.text }]}>
                {game.homeTeam.name}
              </Text>
              <Text style={[styles.teamScore, gameResult.isWin ? styles.winningScore : styles.losingScore]}>
                {game.score.home}
              </Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={[styles.vsText, { color: currentColors.textLight }]}>VS</Text>
            </View>

            <View style={styles.teamSection}>
              <Text style={[styles.teamName, { color: currentColors.text }]}>
                {game.awayTeam.name}
              </Text>
              <Text style={[styles.teamScore, !gameResult.isWin ? styles.winningScore : styles.losingScore]}>
                {game.score.away}
              </Text>
            </View>
          </View>

          {/* Date Badge */}
          <View style={styles.gameMetaRow}>
            <View style={styles.dateBadge}>
              <IconSymbol name="calendar" size={14} color={currentColors.textSecondary} />
              <Text style={[styles.dateText, { color: currentColors.textSecondary }]}>
                {game.date}
              </Text>
            </View>
          </View>

          {/* Quick Stats Pills */}
          {game.boxScore && (
            <View style={styles.statsRow}>
              {[
                { label: 'FG', value: `${game.boxScore.teamStats.fieldGoalPercentage}%`, icon: 'target' },
                { label: '3PT', value: `${game.boxScore.teamStats.threePointPercentage}%`, icon: 'star.fill' },
                { label: 'REB', value: game.boxScore.teamStats.rebounds, icon: 'arrow.up.circle.fill' },
                { label: 'TO', value: game.boxScore.teamStats.turnovers, icon: 'exclamationmark.triangle.fill' },
              ].map((stat, idx) => (
                <View 
                  key={idx} 
                  style={[styles.statPill, { backgroundColor: currentColors.surface }]}
                  accessible={false} // Parent handles accessibility
                >
                  <IconSymbol name={stat.icon} size={12} color={currentColors.primary} />
                  <Text style={[styles.statPillText, { color: currentColors.text }]}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Expanded Content - Top Performers */}
        {isSelected && game.boxScore && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.expandedContent, { backgroundColor: currentColors.surface }]}
            // ✅ ADD: Expanded section accessibility
            accessible={true}
            accessibilityRole="region"
            accessibilityLabel="Game details expanded"
            accessibilityLiveRegion="polite" // Announces when expanded
          >
            <BlurView intensity={10} tint={isDark ? 'dark' : 'light'} style={styles.expandedBlur}>
              <TopPerformers
                topPerformers={game.boxScore.topPerformers}
                currentColors={currentColors}
              />

              {/* Action Buttons */}
              <View 
                style={styles.gameActions}
                accessible={true}
                accessibilityRole="menu"
                accessibilityLabel="Game actions"
              >
                <Button
                  title="AI Analysis"
                  onPress={() => console.log('Analyze')}
                  variant="primaryGradient"
                  icon={<IconSymbol name="star.fill" size={16} color={'dark'} />}
                  style={styles.actionButton}
                  // ✅ ADD: Button accessibility
                  accessibilityLabel="View AI game analysis"
                  accessibilityHint="Opens detailed AI-powered insights and recommendations for this game"
                />
                {game.highlights && (
                  <Button
                    title="Highlights"
                    onPress={onViewHighlights}
                    variant="outline"
                    icon={<IconSymbol name="play.fill" size={16} color={currentColors.primary} />}
                    style={styles.actionButton}
                    // ✅ ADD: Button accessibility
                    accessibilityLabel={`Watch ${game.highlights.length} game highlights`}
                    accessibilityHint="Opens video highlights from this game"
                  />
                )}
              </View>
            </BlurView>
          </Animated.View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
  },
  card: {
    overflow: 'hidden',
  },
  thumbnail: {
    height: 160,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailInfo: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  resultText: {
    fontSize: Typography.callout,
    fontWeight: '900',
    color: 'dark',
  },
  marginText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: 'dark',
  },
  highlightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BorderRadius.full,
  },
  highlightsBadgeText: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    color: 'dark',
  },
  gameInfo: {
    padding: Spacing.lg,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: Typography.callout,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  teamScore: {
    fontSize: Typography.title2,
    fontWeight: '900',
  },
  winningScore: {
    color: Colors.success,
  },
  losingScore: {
    color: Colors.textSecondary,
  },
  vsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  vsText: {
    fontSize: Typography.caption,
    fontWeight: '700',
  },
  gameMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  statPillText: {
    fontSize: Typography.caption,
    fontWeight: '700',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  expandedBlur: {
    padding: Spacing.lg,
  },
  gameActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});