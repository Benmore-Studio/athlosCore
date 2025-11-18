// File: components/games/GameVideoModal.tsx
import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoPlayer from '@/components/ui/VideoPlayer';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface GameVideoModalProps {
  visible: boolean;
  onClose: () => void;
  game: any | null;
  videoData: {
    videoUrl: string;
    timelineMarkers: any[];
    tags: any[];
  };
  currentColors: any;
  // ✅ NEW: Accessibility props
  modalAccessibilityLabel?: string;
  closeButtonAccessibilityLabel?: string;
}

export default function GameVideoModal({
  visible,
  onClose,
  game,
  videoData,
  currentColors,
  modalAccessibilityLabel,
  closeButtonAccessibilityLabel,
}: GameVideoModalProps) {
  if (!game) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      // ✅ ADD: Modal accessibility
      accessibilityViewIsModal={true}
    >
      <SafeAreaView 
        style={[styles.container, { backgroundColor: currentColors.background }]}
        // ✅ ADD: Screen accessibility
        accessible={true}
        accessibilityLabel={modalAccessibilityLabel || `Game highlights modal for ${game.homeTeam.name} versus ${game.awayTeam.name}`}
      >
        <View style={[styles.header, { backgroundColor: currentColors.surface }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: currentColors.border }]}
            // ✅ ADD: Close button accessibility
            accessibilityRole="button"
            accessibilityLabel={closeButtonAccessibilityLabel || "Close game highlights"}
            accessibilityHint="Closes the modal and returns to games list"
          >
            <IconSymbol name="xmark" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: currentColors.text }]}>
            Game Highlights
          </Text>
          <View style={styles.closeButtonPlaceholder} />
        </View>

        <ScrollView 
          style={styles.content}
          // ✅ ADD: ScrollView accessibility
          accessibilityLabel="Game highlights content"
        >
          <View style={styles.videoPlayerContainer}>
            <VideoPlayer
              videoUrl={videoData.videoUrl}
              title="AI-Powered Game Analysis"
              timelineMarkers={videoData.timelineMarkers}
              tags={videoData.tags}
            />
          </View>

          <Card 
            variant="elevated" 
            padding="large" 
            style={styles.gameSummary}
            // ✅ ADD: Card accessibility
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Game summary: ${game.homeTeam.name} ${game.score.home}, ${game.awayTeam.name} ${game.score.away}${game.highlights ? `, ${game.highlights.length} key moments identified` : ''}`}
          >
            <View style={styles.summaryHeader}>
              <IconSymbol name="chart.bar.fill" size={24} color={currentColors.primary} />
              <Text style={[styles.gameTitle, { color: currentColors.text }]}>
                Game Summary
              </Text>
            </View>

            <View style={styles.gameInfo}>
              <View 
                style={styles.scoreRow}
                accessible={false} // Parent card handles accessibility
              >
                <Text style={[styles.team, { color: currentColors.text }]}>
                  {game.homeTeam.name}
                </Text>
                <Text style={[styles.score, { color: currentColors.primary }]}>
                  {game.score.home} - {game.score.away}
                </Text>
                <Text style={[styles.team, { color: currentColors.text }]}>
                  {game.awayTeam.name}
                </Text>
              </View>

              {game.highlights && (
                <View 
                  style={[styles.keyMomentsBadge, { backgroundColor: currentColors.surface }]}
                  accessible={false} // Parent card handles accessibility
                >
                  <IconSymbol name="star.fill" size={16} color={currentColors.primary} />
                  <Text style={[styles.keyMomentsText, { color: currentColors.text }]}>
                    {game.highlights.length} Key Moments Identified
                  </Text>
                </View>
              )}
            </View>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPlaceholder: { width: 40 },
  title: {
    fontSize: Typography.headline,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: { flex: 1 },
  videoPlayerContainer: { margin: Spacing.xl },
  gameSummary: { marginHorizontal: Spacing.xl },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  gameTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  gameInfo: { gap: Spacing.md },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    fontSize: Typography.callout,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  score: {
    fontSize: Typography.title3,
    fontWeight: '900',
  },
  keyMomentsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  keyMomentsText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  bottomSpacing: { height: Spacing.xxxl },
});