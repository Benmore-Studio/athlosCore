import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import authService from '@/services/api/authService';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

interface Organization {
  org_id: string;
  name: string;
  created_at: string;
  last_updated_at: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const data = await authService.getOrgsList();
      setOrganizations(data);
    } catch (error: any) {
      console.log('Could not fetch organizations');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        full_name: name,
        email: email.toLowerCase().trim(),
        password: password,
        org_ids: selectedOrg ? [selectedOrg.org_id] : undefined,
      });

      AccessibilityInfo.announceForAccessibility('Account created successfully');

      if (selectedOrg) {
        router.replace('/(tabs)');
      } else if (response.organizations && response.organizations.length > 0) {
        router.replace('/(auth)/org-selection');
      } else {
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage?.includes('already exists') || errorMessage?.includes('duplicate')) {
        Alert.alert('Error', 'An account with this email already exists');
      } else if (errorMessage?.includes('network')) {
        Alert.alert('Error', 'Network error. Please check your connection.');
      } else {
        Alert.alert('Error', errorMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderOrgItem = ({ item }: { item: Organization }) => (
    <TouchableOpacity
      style={[
        styles.orgItem,
        selectedOrg?.org_id === item.org_id && styles.orgItemSelected,
      ]}
      onPress={() => {
        setSelectedOrg(item);
        setShowOrgModal(false);
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name} organization`}
    >
      <LinearGradient
        colors={[Colors.primary, '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orgIconGradient}
      >
        <Text style={styles.orgIconText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>
      <View style={styles.orgItemInfo}>
        <Text style={styles.orgItemName}>{item.name}</Text>
        <Text style={styles.orgItemDate}>Created {formatDate(item.created_at)}</Text>
      </View>
      {selectedOrg?.org_id === item.org_id && (
        <IconSymbol name="checkmark.circle.fill" size={24} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && isLandscape && styles.scrollContentLandscape,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    AI-Powered Basketball Analytics
                  </Text>
                  <View style={styles.featureList}>
                    <FeatureItem icon="video.fill" text="Smart Game Film Analysis" />
                    <FeatureItem icon="chart.bar.fill" text="Player Performance Insights" />
                    <FeatureItem icon="star.fill" text="AI-Generated Highlights" />
                  </View>
                </Animated.View>
              )}

              {/* Form section */}
              <View style={[
                styles.formSection,
                isTablet && isLandscape && styles.formSectionLandscape,
              ]}>
                <Animated.View
                  entering={FadeInUp.delay(200).duration(600)}
                  style={[styles.formCard, isTablet && styles.formCardTablet]}
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
                      <Text style={styles.title}>Create Account</Text>
                      <Text style={styles.subtitle}>Join AthlosCore today</Text>
                    </View>
                  )}

                  {isTablet && isLandscape && (
                    <View style={styles.headerSection}>
                      <Text style={styles.title}>Create Account</Text>
                      <Text style={styles.subtitle}>Fill in your details to get started</Text>
                    </View>
                  )}

                  {/* Full Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'name' && styles.inputWrapperFocused,
                    ]}>
                      <IconSymbol
                        name="person.fill"
                        size={20}
                        color={focusedInput === 'name' ? Colors.primary : '#6B7280'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!loading}
                        accessibilityLabel="Full name"
                        accessibilityHint="Enter your full name"
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                    ]}>
                      <IconSymbol
                        name="envelope.fill"
                        size={20}
                        color={focusedInput === 'email' ? Colors.primary : '#6B7280'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="coach@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        accessibilityLabel="Email address"
                        accessibilityHint="Enter your email address"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                    ]}>
                      <IconSymbol
                        name="lock.fill"
                        size={20}
                        color={focusedInput === 'password' ? Colors.primary : '#6B7280'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!loading}
                        accessibilityLabel="Password"
                        accessibilityHint="Enter a password with at least 6 characters"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        accessibilityRole="button"
                      >
                        <IconSymbol
                          name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
                    ]}>
                      <IconSymbol
                        name="lock.fill"
                        size={20}
                        color={focusedInput === 'confirmPassword' ? Colors.primary : '#6B7280'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        editable={!loading}
                        accessibilityLabel="Confirm password"
                        accessibilityHint="Re-enter your password"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                        accessibilityRole="button"
                      >
                        <IconSymbol
                          name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Organization */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Organization</Text>
                      <Text style={styles.optionalLabel}>(Optional)</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.inputWrapper,
                        focusedInput === 'org' && styles.inputWrapperFocused,
                      ]}
                      onPress={() => setShowOrgModal(true)}
                      disabled={loading || loadingOrgs || organizations.length === 0}
                      accessibilityRole="button"
                      accessibilityLabel="Select organization"
                    >
                      <IconSymbol
                        name="building.2.fill"
                        size={20}
                        color={selectedOrg ? Colors.primary : '#6B7280'}
                      />
                      {loadingOrgs ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={styles.orgLoader} />
                      ) : (
                        <Text style={[
                          styles.orgText,
                          !selectedOrg && styles.orgPlaceholder,
                        ]}>
                          {selectedOrg
                            ? selectedOrg.name
                            : organizations.length > 0
                            ? 'Select an organization'
                            : 'No organizations available'}
                        </Text>
                      )}
                      {organizations.length > 0 && (
                        <IconSymbol name="chevron.down" size={16} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                    {selectedOrg && (
                      <TouchableOpacity
                        onPress={() => setSelectedOrg(null)}
                        style={styles.clearOrgButton}
                        accessibilityLabel="Clear organization selection"
                        accessibilityRole="button"
                      >
                        <Text style={styles.clearOrgText}>Clear selection</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={loading ? 'Creating account' : 'Create account'}
                    accessibilityState={{ disabled: loading }}
                  >
                    <LinearGradient
                      colors={loading ? ['#9CA3AF', '#6B7280'] : [Colors.primary, '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.createButton, loading && styles.createButtonDisabled]}
                    >
                      {loading ? (
                        <Text style={styles.createButtonText}>Creating Account...</Text>
                      ) : (
                        <>
                          <Text style={styles.createButtonText}>Create Account</Text>
                          <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Terms */}
                  <Text style={styles.termsText}>
                    By signing up, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>

                  {/* Sign In Link */}
                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/(auth)/login')}
                      disabled={loading}
                      accessibilityRole="link"
                      accessibilityLabel="Sign in to existing account"
                    >
                      <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Organization Selection Modal */}
      <Modal
        visible={showOrgModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrgModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isTablet && styles.modalContentTablet]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Organization</Text>
              <TouchableOpacity
                onPress={() => setShowOrgModal(false)}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <IconSymbol name="xmark" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={organizations}
              renderItem={renderOrgItem}
              keyExtractor={(item) => item.org_id}
              contentContainerStyle={styles.orgList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyOrgs}>
                  <IconSymbol name="building.2" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyOrgsText}>No organizations available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <IconSymbol name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
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
  keyboardView: {
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
    marginBottom: Spacing.xl,
  },
  featureList: {
    width: '100%',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: Typography.callout,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Form section
  formSection: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  formSectionLandscape: {
    flex: 1,
    maxWidth: 480,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  formCardTablet: {
    padding: Spacing.xxl,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
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

  // Input styles
  inputGroup: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  optionalLabel: {
    fontSize: Typography.footnote,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    ...Shadows.small,
  },
  input: {
    flex: 1,
    fontSize: Typography.callout,
    color: Colors.text,
    height: '100%',
  },

  // Organization
  orgLoader: {
    flex: 1,
    alignItems: 'flex-start',
  },
  orgText: {
    flex: 1,
    fontSize: Typography.callout,
    color: Colors.text,
  },
  orgPlaceholder: {
    color: '#9CA3AF',
  },
  clearOrgButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    padding: Spacing.xs,
  },
  clearOrgText: {
    fontSize: Typography.subhead,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Create button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadows.medium,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Terms
  termsText: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Sign in link
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signInText: {
    fontSize: Typography.subhead,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: Typography.subhead,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '70%',
    paddingBottom: Spacing.lg,
  },
  modalContentTablet: {
    maxHeight: '50%',
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgList: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  orgItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(233, 122, 66, 0.05)',
  },
  orgIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  orgItemInfo: {
    flex: 1,
  },
  orgItemName: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  orgItemDate: {
    fontSize: Typography.footnote,
    color: Colors.textSecondary,
  },
  emptyOrgs: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyOrgsText: {
    fontSize: Typography.callout,
    color: Colors.textSecondary,
  },
});
