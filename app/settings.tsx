// File: app/settings.tsx
// Settings Screen - Redesigned to match Dashboard design system
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing, Typography, Shadows, Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';
import authService from '@/services/api/authService';
import offlineApiService from '@/services/api/offlineApiService';

function SettingsScreenContent() {
  const { currentColors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/(tabs)');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Starting logout process...');

              // Clear auth data (token, user data)
              await authService.logout();

              // Clear all API caches
              await offlineApiService.clearAllCache();

              // Clear current org ID
              await AsyncStorage.removeItem('current_org_id');

              console.log('✅ Logout complete');

              // Navigate to login screen
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('❌ Logout error:', error);

              // Even if there's an error, try to navigate to login
              Alert.alert(
                'Logout Error',
                'There was an issue logging out, but we\'ll sign you out anyway.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(auth)/login')
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Preferences',
      icon: 'slider.horizontal.3' as const,
      items: [
        {
          icon: 'bell.fill' as const,
          label: 'Push Notifications',
          type: 'switch' as const,
          value: notifications,
          onValueChange: setNotifications,
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Push notifications',
          accessibilityHint: notifications 
            ? 'Double tap to disable push notifications' 
            : 'Double tap to enable push notifications',
        },
        {
          icon: 'icloud.and.arrow.up.fill' as const,
          label: 'Auto Upload Videos',
          type: 'switch' as const,
          value: autoUpload,
          onValueChange: setAutoUpload,
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Auto upload videos',
          accessibilityHint: autoUpload 
            ? 'Double tap to disable automatic video uploads' 
            : 'Double tap to enable automatic video uploads',
        },
      ],
    },
    {
      title: 'Account',
      icon: 'person.fill' as const,
      items: [
        {
          icon: 'person.fill' as const,
          label: 'Profile Settings',
          type: 'navigation' as const,
          onPress: () => console.log('Profile'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Profile settings',
          accessibilityHint: 'Opens profile settings screen',
        },
        {
          icon: 'key.fill' as const,
          label: 'Change Password',
          type: 'navigation' as const,
          onPress: () => console.log('Password'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Change password',
          accessibilityHint: 'Opens password change screen',
        },
      ],
    },
    {
      title: 'Support',
      icon: 'questionmark.circle.fill' as const,
      items: [
        {
          icon: 'questionmark.circle.fill' as const,
          label: 'Help & Support',
          type: 'navigation' as const,
          onPress: () => console.log('Help'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Help and support',
          accessibilityHint: 'Opens help and support resources',
        },
        {
          icon: 'exclamationmark.bubble.fill' as const,
          label: 'Report a Problem',
          type: 'navigation' as const,
          onPress: () => console.log('Report'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Report a problem',
          accessibilityHint: 'Opens problem reporting form',
        },
        {
          icon: 'doc.text.fill' as const,
          label: 'Privacy Policy',
          type: 'navigation' as const,
          onPress: () => console.log('Privacy'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Privacy policy',
          accessibilityHint: 'Opens privacy policy document',
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      accessible={true}
      accessibilityLabel="Settings screen"
    >
      {/* Header - Matching Dashboard Style */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: currentColors.surface }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          >
            <IconSymbol name="chevron.left" size={20} color={currentColors.text} />
          </TouchableOpacity>
          <LinearGradient
            colors={[Colors.primary, '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoText}>A</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: currentColors.textSecondary }]}>
              Manage your preferences
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Settings content"
      >
        <View style={styles.mainContent}>
          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <Animated.View
              key={section.title}
              entering={FadeInUp.delay(100 + sectionIndex * 100).duration(400)}
              style={styles.sectionContainer}
            >
              <View
                style={[styles.sectionCard, { backgroundColor: currentColors.cardBackground }]}
                accessible={true}
                accessibilityRole="menu"
                accessibilityLabel={`${section.title} menu`}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '15' }]}>
                      <IconSymbol
                        name={section.icon}
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <Text
                      style={[styles.sectionTitle, { color: currentColors.text }]}
                      accessible={true}
                      accessibilityRole="header"
                      accessibilityLabel={`${section.title} section`}
                    >
                      {section.title}
                    </Text>
                  </View>
                </View>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      {
                        backgroundColor: currentColors.surface,
                        borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                        borderBottomColor: currentColors.border,
                      },
                    ]}
                    onPress={item.type === 'navigation' ? item.onPress : undefined}
                    disabled={item.type === 'switch'}
                    activeOpacity={0.7}
                    accessibilityRole={item.type === 'switch' ? 'switch' : 'button'}
                    accessibilityLabel={item.accessibilityLabel || item.label}
                    accessibilityHint={item.accessibilityHint}
                    accessibilityState={
                      item.type === 'switch'
                        ? { checked: item.value }
                        : undefined
                    }
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: currentColors.cardBackground }]}>
                        <IconSymbol name={item.icon} size={20} color={Colors.primary} />
                      </View>
                      <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                        {item.label}
                      </Text>
                    </View>

                    {item.type === 'switch' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        trackColor={{
                          false: currentColors.border,
                          true: Colors.primary
                        }}
                        thumbColor="#FFFFFF"
                        accessible={true}
                        accessibilityRole="switch"
                        accessibilityLabel={item.accessibilityLabel || item.label}
                        accessibilityState={{ checked: item.value }}
                      />
                    )}

                    {item.type === 'navigation' && (
                      <IconSymbol name="chevron.right" size={16} color={currentColors.textLight} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Logout Button */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.sectionContainer}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: Colors.error + '08' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Logout"
              accessibilityHint="Double tap to sign out of your account"
            >
              <View style={[styles.logoutIconContainer, { backgroundColor: Colors.error + '15' }]}>
                <IconSymbol name="arrow.right.square.fill" size={20} color={Colors.error} />
              </View>
              <Text style={[styles.logoutText, { color: Colors.error }]}>Logout</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.error} />
            </TouchableOpacity>
          </Animated.View>

          {/* App Info */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.appInfo}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="AthlosCore version 1.0.0, Copyright 2025 Benmore Tech"
          >
            <Text style={[styles.appInfoText, { color: currentColors.textSecondary }]}>
              AthlosCore v1.0.0
            </Text>
            <Text style={[styles.appInfoText, { color: currentColors.textSecondary }]}>
              © 2025 Benmore Tech
            </Text>
          </Animated.View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function SettingsScreen() {
  return (
    <ComponentErrorBoundary componentName="SettingsScreen">
      <SettingsScreenContent />
    </ComponentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header - Matching Dashboard
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.footnote,
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Section Container
  sectionContainer: {
    marginTop: Spacing.sm,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
  },

  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: Typography.subhead,
    fontWeight: '600',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: Typography.subhead,
    fontWeight: '700',
    marginLeft: Spacing.md,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  appInfoText: {
    fontSize: Typography.footnote,
  },
});