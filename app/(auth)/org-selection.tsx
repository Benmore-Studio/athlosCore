import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  View,
  Text,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

interface Organization {
  id: string;
  name: string;
  members: number;
  icon: string; // SF Symbol name
}

export default function OrgSelectionScreen() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    // Mock data with SF Symbol icons
    setOrganizations([
      { id: '1', name: 'Lincoln Eagles', members: 150, icon: 'basketball.fill' },
      { id: '2', name: 'Warriors Basketball', members: 87, icon: 'figure.basketball' },
      { id: '3', name: 'Hoops Academy', members: 45, icon: 'graduationcap.fill' },
      { id: '4', name: 'Elite Training', members: 203, icon: 'trophy.fill' },
    ]);

    try {
      const savedOrgId = await AsyncStorage.getItem('current_org_id');
      if (savedOrgId) {
        setSelectedOrg(savedOrgId);
      }
    } catch (error) {
      console.error('Failed to load saved org:', error);
    }
  };

  const handleContinue = async () => {
    if (!selectedOrg) {
      Alert.alert('Error', 'Please select an organization');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('current_org_id', selectedOrg);
      const selectedOrgData = organizations.find(org => org.id === selectedOrg);

      AccessibilityInfo.announceForAccessibility(
        `Organization ${selectedOrgData?.name} selected`
      );

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = () => {
    Alert.alert('Create Organization', 'This feature will be available soon!');
  };

  return (
    <View style={styles.container}>
      {/* Navy background */}
      <LinearGradient
        colors={['#1E2A3A', '#2D3E52', '#1E2A3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && isLandscape && styles.scrollContentLandscape,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.contentContainer,
            isTablet && isLandscape && styles.contentContainerLandscape,
          ]}>
            {/* Branding section (tablet landscape) */}
            {isTablet && isLandscape && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(600)}
                style={styles.brandingSection}
              >
                <LinearGradient
                  colors={[Colors.primary, '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.largeLogo}
                >
                  <Text style={styles.largeLogoText}>A</Text>
                </LinearGradient>
                <Text style={styles.brandTitle}>AthlosCore</Text>
                <Text style={styles.brandTagline}>
                  Select your team workspace to get started
                </Text>
              </Animated.View>
            )}

            {/* Main content */}
            <View style={[
              styles.mainSection,
              isTablet && isLandscape && styles.mainSectionLandscape,
            ]}>
              <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                style={[styles.card, isTablet && styles.cardTablet]}
              >
                {/* Header */}
                {(!isTablet || !isLandscape) && (
                  <View style={styles.headerSection}>
                    <LinearGradient
                      colors={[Colors.primary, '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.logo}
                    >
                      <Text style={styles.logoText}>A</Text>
                    </LinearGradient>
                    <Text style={styles.title}>Select Organization</Text>
                    <Text style={styles.subtitle}>Choose your team workspace</Text>
                  </View>
                )}

                {isTablet && isLandscape && (
                  <View style={styles.headerSection}>
                    <Text style={styles.title}>Your Organizations</Text>
                    <Text style={styles.subtitle}>Select a workspace to continue</Text>
                  </View>
                )}

                {/* Organization List */}
                <View style={styles.orgList}>
                  {organizations.map((org, index) => (
                    <Animated.View
                      key={org.id}
                      entering={FadeInDown.delay(300 + index * 100).duration(500)}
                    >
                      <TouchableOpacity
                        onPress={() => setSelectedOrg(org.id)}
                        activeOpacity={0.7}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel={`${org.name}, ${org.members} members`}
                        accessibilityState={{ selected: selectedOrg === org.id }}
                      >
                        <View style={[
                          styles.orgCard,
                          selectedOrg === org.id && styles.orgCardSelected,
                        ]}>
                          {/* Icon */}
                          <View style={[
                            styles.orgIconContainer,
                            selectedOrg === org.id && styles.orgIconContainerSelected,
                          ]}>
                            <IconSymbol
                              name={org.icon as any}
                              size={28}
                              color={selectedOrg === org.id ? '#FFFFFF' : Colors.primary}
                            />
                          </View>

                          {/* Info */}
                          <View style={styles.orgInfo}>
                            <Text style={[
                              styles.orgName,
                              selectedOrg === org.id && styles.orgNameSelected,
                            ]}>
                              {org.name}
                            </Text>
                            <View style={styles.orgMeta}>
                              <IconSymbol
                                name="person.2.fill"
                                size={14}
                                color={Colors.textSecondary}
                              />
                              <Text style={styles.orgMembers}>{org.members} members</Text>
                            </View>
                          </View>

                          {/* Checkbox */}
                          <View style={[
                            styles.checkbox,
                            selectedOrg === org.id && styles.checkboxSelected,
                          ]}>
                            {selectedOrg === org.id && (
                              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}

                  {/* Create New Organization */}
                  <Animated.View
                    entering={FadeInDown.delay(700).duration(500)}
                  >
                    <TouchableOpacity
                      onPress={handleCreateOrg}
                      disabled={loading}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Create new organization"
                    >
                      <View style={styles.createOrgCard}>
                        <View style={styles.createOrgIconContainer}>
                          <IconSymbol name="plus" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.createOrgText}>Create New Organization</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!selectedOrg || loading}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={loading ? 'Loading' : 'Continue'}
                  accessibilityState={{ disabled: !selectedOrg || loading }}
                >
                  <LinearGradient
                    colors={selectedOrg ? [Colors.primary, '#F59E0B'] : ['#D1D5DB', '#9CA3AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.continueButton, !selectedOrg && styles.continueButtonDisabled]}
                  >
                    <Text style={styles.continueButtonText}>
                      {loading ? 'Loading...' : 'Continue'}
                    </Text>
                    {!loading && selectedOrg && (
                      <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Skip Link */}
                <TouchableOpacity
                  onPress={() => router.replace('/(tabs)')}
                  disabled={loading}
                  style={styles.skipButton}
                  accessibilityRole="link"
                  accessibilityLabel="Skip for now"
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  scrollContentLandscape: {
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainerLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xxl,
  },

  // Branding section
  brandingSection: {
    flex: 1,
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  largeLogo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  largeLogoText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandTitle: {
    fontSize: Typography.title1,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  brandTagline: {
    fontSize: Typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Main section
  mainSection: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  mainSectionLandscape: {
    flex: 1,
    maxWidth: 520,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  cardTablet: {
    padding: Spacing.xxl,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    fontSize: Typography.title2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
  },

  // Organization list
  orgList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  orgCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(233, 122, 66, 0.05)',
  },
  orgIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(233, 122, 66, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  orgNameSelected: {
    color: Colors.primary,
  },
  orgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orgMembers: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // Create org
  createOrgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: 'rgba(233, 122, 66, 0.03)',
    gap: Spacing.sm,
  },
  createOrgIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(233, 122, 66, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOrgText: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Continue button
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Skip
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
