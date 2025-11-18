import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentColors } = useTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Player Profile',
          headerShown: true,
          headerStyle: { backgroundColor: currentColors.cardBackground },
          headerTintColor: currentColors.text,
        }} 
      />
      <SafeAreaView 
        style={[styles.container, { backgroundColor: currentColors.background }]}
        edges={['bottom']}
      >
        <ScrollView style={styles.content}>
          <Card variant="elevated" padding="large" style={styles.card}>
            <View style={styles.header}>
              <IconSymbol name="person.circle.fill" size={80} color={currentColors.primary} />
              <Text style={[styles.title, { color: currentColors.text }]}>
                Player Profile
              </Text>
              <Text style={[styles.id, { color: currentColors.textSecondary }]}>
                ID: {id}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Statistics
              </Text>
              <Text style={[styles.placeholder, { color: currentColors.textSecondary }]}>
                Player statistics will be displayed here
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Recent Games
              </Text>
              <Text style={[styles.placeholder, { color: currentColors.textSecondary }]}>
                Recent game performance will be displayed here
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.title1,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  id: {
    fontSize: Typography.body,
    marginTop: Spacing.xs,
  },
  infoSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  placeholder: {
    fontSize: Typography.body,
    fontStyle: 'italic',
  },
});