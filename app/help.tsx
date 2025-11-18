// File: app/help.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'teams' | 'analytics' | 'videos' | 'technical';
  icon: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    id: 'faq-1',
    question: 'How do I create my first team?',
    answer: 'Navigate to the Teams tab, tap the "+" button, and fill in your team details including name, sport, and season. You can then add players to your roster.',
    category: 'getting-started',
    icon: 'person.3.fill',
  },
  {
    id: 'faq-2',
    question: 'How do I add players to my team?',
    answer: 'Go to Teams tab, select your team, and tap "Add Player". Enter player details like name, jersey number, position, and optional physical stats.',
    category: 'getting-started',
    icon: 'person.badge.plus',
  },
  {
    id: 'faq-3',
    question: 'What video formats are supported?',
    answer: 'AthlosCore supports MP4, MOV, and AVI formats. Videos should be under 500MB for optimal processing. The AI works best with HD quality footage.',
    category: 'videos',
    icon: 'video.fill',
  },
  
  // Teams
  {
    id: 'faq-4',
    question: 'Can I manage multiple teams?',
    answer: 'Yes! You can create and manage unlimited teams. Switch between teams using the team selector in the Teams tab.',
    category: 'teams',
    icon: 'sportscourt.fill',
  },
  {
    id: 'faq-5',
    question: 'How do I edit player information?',
    answer: 'In the Teams tab, select your team, tap on the player you want to edit, and select "Edit Player" from the menu.',
    category: 'teams',
    icon: 'pencil.circle.fill',
  },
  
  // Analytics
  {
    id: 'faq-6',
    question: 'What stats does the AI track?',
    answer: 'Our AI tracks points, rebounds, assists, field goal percentage, free throw percentage, turnovers, minutes played, and more advanced metrics.',
    category: 'analytics',
    icon: 'chart.line.uptrend.xyaxis',
  },
  {
    id: 'faq-7',
    question: 'How accurate is the AI analysis?',
    answer: 'Our AI has 95%+ accuracy for basic stats and 85%+ for advanced metrics. Accuracy improves with better video quality and camera angles.',
    category: 'analytics',
    icon: 'star.fill',
  },
  {
    id: 'faq-8',
    question: 'Can I compare players?',
    answer: 'Yes! In Player Analytics, tap "Compare Players" to view side-by-side comparisons of up to 3 players with visual charts.',
    category: 'analytics',
    icon: 'chart.bar.xaxis',
  },
  
  // Technical
  {
    id: 'faq-9',
    question: 'Why is my video taking long to process?',
    answer: 'Processing time depends on video length and server load. Typical processing takes 2-5 minutes. You\'ll receive a notification when complete.',
    category: 'technical',
    icon: 'clock.fill',
  },
  {
    id: 'faq-10',
    question: 'How do I report a bug?',
    answer: 'Use the "Report Issue" button below or email support@athloscore.com with details about the problem and screenshots if possible.',
    category: 'technical',
    icon: 'exclamationmark.triangle.fill',
  },
];

const QUICK_ACTIONS = [
  {
    id: 'tutorial',
    title: 'Interactive Tutorial',
    description: 'Step-by-step walkthrough',
    icon: 'play.circle.fill',
    color: Colors.primary,
    action: 'tutorial',
  },
  {
    id: 'video-guide',
    title: 'Video Guides',
    description: 'Watch how-to videos',
    icon: 'video.fill',
    color: Colors.info,
    action: 'video-guide',
  },
  {
    id: 'contact',
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: 'envelope.fill',
    color: Colors.success,
    action: 'contact',
  },
  {
    id: 'docs',
    title: 'Documentation',
    description: 'Full feature documentation',
    icon: 'doc.text.fill',
    color: Colors.warning,
    action: 'docs',
  },
];

export default function HelpScreen() {
  const { currentColors, isDark } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'list.bullet' },
    { id: 'getting-started', label: 'Getting Started', icon: 'flag.fill' },
    { id: 'teams', label: 'Teams', icon: 'person.3.fill' },
    { id: 'analytics', label: 'Analytics', icon: 'chart.bar.fill' },
    { id: 'videos', label: 'Videos', icon: 'video.fill' },
    { id: 'technical', label: 'Technical', icon: 'gearshape.fill' },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(faq => faq.category === selectedCategory);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'tutorial':
        router.push('/tutorial');
        break;
      case 'video-guide':
        Linking.openURL('https://athloscore.com/guides');
        break;
      case 'contact':
        handleContactSupport();
        break;
      case 'docs':
        Linking.openURL('https://docs.athloscore.com');
        break;
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to reach us:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@athloscore.com'),
        },
        {
          text: 'Chat',
          onPress: () => Alert.alert('Chat', 'Live chat coming soon!'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report an Issue',
      'This will open your email app to send us a bug report.',
      [
        {
          text: 'Continue',
          onPress: () => Linking.openURL('mailto:support@athloscore.com?subject=Bug Report'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={currentColors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Help & Support
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
            Find answers and get help
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <IconSymbol name="gearshape.fill" size={24} color={currentColors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.id}
                entering={FadeIn.delay(300 + index * 100).springify()}
                style={styles.quickActionWrapper}
              >
                <TouchableOpacity
                  onPress={() => handleQuickAction(action.action)}
                  activeOpacity={0.7}
                >
                  <Card variant="elevated" padding="medium" style={styles.quickActionCard}>
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                      <IconSymbol name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: currentColors.text }]}>
                      {action.title}
                    </Text>
                    <Text style={[styles.quickActionDescription, { color: currentColors.textSecondary }]}>
                      {action.description}
                    </Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Frequently Asked Questions
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                {selectedCategory === category.id ? (
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.categoryButton}
                  >
                    <IconSymbol name={category.icon} size={16} color="#FFFFFF" />
                    <Text style={styles.categoryButtonTextActive}>
                      {category.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.categoryButton, { backgroundColor: currentColors.surface }]}>
                    <IconSymbol name={category.icon} size={16} color={currentColors.textSecondary} />
                    <Text style={[styles.categoryButtonText, { color: currentColors.text }]}>
                      {category.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* FAQ List */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          {filteredFAQs.map((faq, index) => (
            <Animated.View
              key={faq.id}
              entering={FadeIn.delay(700 + index * 50).springify()}
              layout={Layout.springify()}
            >
              <Card 
                variant="elevated" 
                padding="none" 
                style={styles.faqCard}
              >
                <TouchableOpacity
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <View style={[styles.faqIcon, { backgroundColor: currentColors.primary + '20' }]}>
                      <IconSymbol name={faq.icon} size={20} color={currentColors.primary} />
                    </View>
                    
                    <Text style={[styles.faqQuestion, { color: currentColors.text }]}>
                      {faq.question}
                    </Text>
                    
                    <IconSymbol 
                      name={expandedFAQ === faq.id ? 'chevron.up' : 'chevron.down'} 
                      size={20} 
                      color={currentColors.textSecondary} 
                    />
                  </View>
                </TouchableOpacity>

                {expandedFAQ === faq.id && (
                  <Animated.View 
                    entering={FadeIn.duration(200)}
                    style={[styles.faqAnswer, { backgroundColor: currentColors.surface }]}
                  >
                    <Text style={[styles.faqAnswerText, { color: currentColors.textSecondary }]}>
                      {faq.answer}
                    </Text>
                  </Animated.View>
                )}
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Still Need Help */}
        <Animated.View 
          entering={FadeInUp.delay(800).springify()}
          style={styles.section}
        >
          <Card variant="gradient" padding="large">
            <View style={styles.helpCard}>
              <IconSymbol name="questionmark.circle.fill" size={48} color="#FFFFFF" />
              <Text style={styles.helpCardTitle}>
                Still need help?
              </Text>
              <Text style={styles.helpCardDescription}>
                Our support team is here to assist you
              </Text>
              
              <View style={styles.helpCardButtons}>
                <Button
                  title="Contact Support"
                  onPress={handleContactSupport}
                  variant="secondary"
                  icon={<IconSymbol name="envelope.fill" size={18} color={currentColors.primary} />}
                  fullWidth
                />
                
                <Button
                  title="Report Issue"
                  onPress={handleReportIssue}
                  variant="outline"
                  icon={<IconSymbol name="exclamationmark.triangle.fill" size={18} color="#FFFFFF" />}
                  fullWidth
                  style={styles.reportButton}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: currentColors.textLight }]}>
            AthlosCore v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: currentColors.textLight }]}>
            © 2024 AthlosCore. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.footnote,
    fontWeight: '500',
    marginTop: 2,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',  // ✅ Added this
    gap: Spacing.md,
  },
  quickActionWrapper: {
    width: '47%',  // ✅ Changed from 48% to 47%
  },
  quickActionCard: {
    alignItems: 'center',
    minHeight: 140,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: Typography.callout,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionDescription: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },
  categoriesScroll: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryButtonText: {
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    fontSize: Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  faqCard: {
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  faqIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: Typography.callout,
    fontWeight: '600',
  },
  faqAnswer: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: Typography.callout,
    lineHeight: Typography.callout * 1.5,
  },
  helpCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  helpCardTitle: {
    fontSize: Typography.title3,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  helpCardDescription: {
    fontSize: Typography.callout,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  helpCardButtons: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  reportButton: {
    borderColor: '#FFFFFF',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  appInfoText: {
    fontSize: Typography.footnote,
    textAlign: 'center',
  },
});