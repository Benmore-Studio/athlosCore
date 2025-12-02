import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

interface TopPerformersProps {
  topPerformers: {
    scorer: any;
    rebounder: any;
    assists: any;
  };
  currentColors: any;
  // ✅ NEW: Accessibility props
  sectionAccessibilityLabel?: string;
}

export default function TopPerformers({ 
  topPerformers, 
  currentColors,
  sectionAccessibilityLabel,
}: TopPerformersProps) {
  const performers = [
    { 
      player: topPerformers.scorer, 
      stat: 'points', 
      label: 'PTS',
      category: 'top scorer'
    },
    { 
      player: topPerformers.rebounder, 
      stat: 'rebounds', 
      label: 'REB',
      category: 'top rebounder'
    },
    { 
      player: topPerformers.assists, 
      stat: 'assists', 
      label: 'AST',
      category: 'assists leader'
    },
  ];

  return (
    <View
      // ✅ ADD: Section accessibility
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={sectionAccessibilityLabel || "Top performers section"}
    >
      <View style={styles.header}>
        <IconSymbol name="star.fill" size={20} color={currentColors.primary} />
        <Text style={[styles.title, { color: currentColors.text }]}>
          Top Performers
        </Text>
      </View>

      <View style={styles.grid}>
        {performers.map((performer, idx) => {
          const statValue = performer.player.stats[performer.stat as keyof typeof performer.player.stats];
          
          return (
            <View 
              key={idx} 
              style={[styles.card, { backgroundColor: currentColors.cardBackground }]}
              // ✅ ADD: Each performer card accessibility
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${performer.category}: ${performer.player.name}, ${statValue} ${performer.label}`}
            >
              <PlayerAvatar
                name={performer.player.name}
                imageUri={performer.player.imageUri}
                jerseyNumber={performer.player.jerseyNumber}
                size="small"
                variant="gradient"
              />
              <Text style={[styles.name, { color: currentColors.text }]}>
                {performer.player.name?.split(' ')[0] || ''}
              </Text>
              <View 
                style={[styles.statBadge, { backgroundColor: currentColors.primary }]}
                accessible={false} // Parent handles accessibility
              >
                <Text style={styles.statValue}>
                  {statValue}
                </Text>
                <Text style={styles.statLabel}>{performer.label}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.footnote,
    fontWeight: '700',
    textAlign: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statValue: {
    fontSize: Typography.callout,
    fontWeight: '900',
    color: 'dark',
  },
  statLabel: {
    fontSize: Typography.caption,
    fontWeight: '700',
    color: 'dark',
  },
});