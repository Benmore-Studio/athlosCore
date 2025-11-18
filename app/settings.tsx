// File: app/settings.tsx
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Card from '@/components/ui/Card';
import { BorderRadius, Spacing, Typography, Shadows, Gradients } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/settings/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ComponentErrorBoundary } from '@/components/component-error-boundary';

function SettingsScreenContent() {
  const { themeMode, currentColors, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  const handleThemeChange = async (mode: 'auto' | 'light' | 'dark') => {
    try {
      await setThemeMode(mode);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

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
              await AsyncStorage.clear();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell.fill',
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
          icon: 'icloud.and.arrow.up.fill',
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
      items: [
        {
          icon: 'person.fill',
          label: 'Profile Settings',
          type: 'navigation' as const,
          onPress: () => console.log('Profile'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Profile settings',
          accessibilityHint: 'Opens profile settings screen',
        },
        {
          icon: 'key.fill',
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
      items: [
        {
          icon: 'questionmark.circle.fill',
          label: 'Help & Support',
          type: 'navigation' as const,
          onPress: () => console.log('Help'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Help and support',
          accessibilityHint: 'Opens help and support resources',
        },
        {
          icon: 'exclamationmark.bubble.fill',
          label: 'Report a Problem',
          type: 'navigation' as const,
          onPress: () => console.log('Report'),
          // ✅ NEW: Accessibility
          accessibilityLabel: 'Report a problem',
          accessibilityHint: 'Opens problem reporting form',
        },
        {
          icon: 'doc.text.fill',
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
      // ✅ ADD: Screen-level accessibility
      accessible={true}
      accessibilityLabel="Settings screen"
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={[currentColors.headerBackground, currentColors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: currentColors.surface }]}
              activeOpacity={0.7}
              // ✅ ADD: Back button accessibility
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to previous screen"
            >
              <IconSymbol name="chevron.left" size={24} color={currentColors.text} />
            </TouchableOpacity>

            <Animated.View 
              entering={FadeIn.delay(200).duration(600)} 
              style={styles.logoContainer}
              // ✅ ADD: Logo accessibility
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="AthlosCore Settings"
            >
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={[styles.logoBox, Shadows.primaryGlow]}
              >
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.logoSubtext, { color: currentColors.text }]}>AthlosCore™</Text>
                <Text style={[styles.logoTagline, { color: currentColors.primary }]}>Settings</Text>
              </View>
            </Animated.View>

            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        // ✅ ADD: ScrollView accessibility
        accessibilityLabel="Settings content"
      >
        {/* Theme Toggle */}
        <Animated.View entering={FadeIn.delay(400).duration(600)}>
          <Card 
            variant="elevated" 
            padding="large" 
            style={styles.themeCard}
            // ✅ ADD: Theme card accessibility
            accessible={true}
            accessibilityRole="adjustable"
            accessibilityLabel={`Theme: ${themeMode === 'auto' ? 'automatic' : themeMode} mode`}
            accessibilityHint="Double tap to change theme settings"
          >
            <ThemeToggle
              currentMode={themeMode}
              onModeChange={handleThemeChange}
              currentColors={currentColors}
            />
          </Card>
        </Animated.View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeIn.delay(600 + sectionIndex * 200).duration(600)}
          >
            <Text 
              style={[styles.sectionTitle, { color: currentColors.text }]}
              // ✅ ADD: Section header accessibility
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel={`${section.title} section`}
            >
              {section.title}
            </Text>

            <Card 
              variant="elevated" 
              padding="none" 
              style={styles.sectionCard}
              // ✅ ADD: Section card accessibility
              accessible={true}
              accessibilityRole="menu"
              accessibilityLabel={`${section.title} menu`}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    { 
                      backgroundColor: currentColors.cardBackground,
                      borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                      borderBottomColor: currentColors.border,
                    },
                  ]}
                  onPress={item.type === 'navigation' ? item.onPress : undefined}
                  disabled={item.type === 'switch'}
                  activeOpacity={0.7}
                  // ✅ ADD: Setting item accessibility
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
                    <View style={[styles.iconCircle, { backgroundColor: currentColors.surface }]}>
                      <IconSymbol name={item.icon} size={20} color={currentColors.primary} />
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
                        true: currentColors.primary 
                      }}
                      thumbColor={item.value ? 'dark' : currentColors.surface}
                      // ✅ ADD: Switch accessibility
                      accessible={true}
                      accessibilityRole="switch"
                      accessibilityLabel={item.accessibilityLabel || item.label}
                      accessibilityState={{ checked: item.value }}
                    />
                  )}

                  {item.type === 'navigation' && (
                    <IconSymbol name="chevron.right" size={20} color={currentColors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </Animated.View>
        ))}

        {/* App Info */}
        <Animated.View 
          entering={FadeIn.delay(1400).duration(600)}
          style={styles.appInfo}
          // ✅ ADD: App info accessibility
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

        {/* Logout Button */}
        <Animated.View entering={FadeIn.delay(1600).duration(600)}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: currentColors.surface }]}
            onPress={handleLogout}
            activeOpacity={0.7}
            // ✅ ADD: Logout button accessibility
            accessibilityRole="button"
            accessibilityLabel="Logout"
            accessibilityHint="Double tap to sign out of your account"
          >
            <IconSymbol name="arrow.right.square.fill" size={20} color={currentColors.error} />
            <Text style={[styles.logoutText, { color: currentColors.error }]}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacing} />
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
  container: { flex: 1 },
  headerGradient: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...Shadows.small },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoBox: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: Typography.title2, fontWeight: '900', color: 'dark' },
  logoSubtext: { fontSize: Typography.callout, fontWeight: '700', letterSpacing: 1 },
  logoTagline: { fontSize: Typography.caption, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  placeholder: { width: 40 },
  content: { flex: 1 },
  themeCard: { marginHorizontal: Spacing.xl, marginTop: Spacing.lg },
  sectionTitle: { fontSize: Typography.headline, fontWeight: '700', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionCard: { marginHorizontal: Spacing.xl, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: Typography.body, fontWeight: '600' },
  appInfo: { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.xs },
  appInfoText: { fontSize: Typography.footnote },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg },
  logoutText: { fontSize: Typography.body, fontWeight: '700' },
  bottomSpacing: { height: Spacing.xxxl },
});