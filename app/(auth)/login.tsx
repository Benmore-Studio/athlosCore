import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import authService from '@/services/api/authService';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.login({
        email: email.toLowerCase().trim(),
        password: password,
      });

      AccessibilityInfo.announceForAccessibility('Login successful');
      router.replace('/(auth)/org-selection');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;

      if (error.response?.status === 401 || errorMessage?.includes('Invalid')) {
        Alert.alert('Error', 'Invalid email or password');
      } else if (error.code === 'ERR_NETWORK') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Would you like to continue in Demo Mode?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Demo Mode',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navy background with subtle gradient */}
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
          <View style={[
            styles.contentContainer,
            isTablet && isLandscape && styles.contentContainerLandscape,
          ]}>
            {/* Left side - Branding (visible on tablet landscape) */}
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

            {/* Right side - Login Form */}
            <View style={[
              styles.formSection,
              isTablet && isLandscape && styles.formSectionLandscape,
            ]}>
              <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                style={[
                  styles.formCard,
                  isTablet && styles.formCardTablet,
                ]}
              >
                {/* Logo (visible on phone or tablet portrait) */}
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
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to AthlosCore</Text>
                  </View>
                )}

                {isTablet && isLandscape && (
                  <View style={styles.headerSection}>
                    <Text style={styles.title}>Sign In</Text>
                    <Text style={styles.subtitle}>Enter your credentials to continue</Text>
                  </View>
                )}

                {/* Email Input */}
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
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      accessibilityLabel="Email address"
                      accessibilityHint="Enter your email address"
                    />
                  </View>
                </View>

                {/* Password Input */}
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
                      editable={!loading}
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your password"
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

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => Alert.alert('Coming Soon', 'Password reset will be available soon.')}
                  style={styles.forgotButton}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={loading ? 'Signing in' : 'Sign in'}
                  accessibilityState={{ disabled: loading }}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : [Colors.primary, '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                  >
                    {loading ? (
                      <Text style={styles.signInButtonText}>Signing In...</Text>
                    ) : (
                      <>
                        <Text style={styles.signInButtonText}>Sign In</Text>
                        <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Demo Mode Button */}
                <TouchableOpacity
                  onPress={() => router.replace('/(tabs)')}
                  style={styles.demoButton}
                  accessibilityRole="button"
                  accessibilityLabel="Continue in demo mode"
                >
                  <IconSymbol name="play.circle.fill" size={20} color={Colors.primary} />
                  <Text style={styles.demoButtonText}>Try Demo Mode</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    disabled={loading}
                    accessibilityRole="link"
                    accessibilityLabel="Sign up for a new account"
                  >
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// Feature item component for tablet landscape view
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  contentContainerLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xxl,
  },

  // Branding section (tablet landscape)
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

  // Input styles
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.subhead,
    fontWeight: '600',
    color: Colors.text,
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

  // Forgot password
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    padding: Spacing.xs,
  },
  forgotText: {
    fontSize: Typography.subhead,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Sign in button
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.subhead,
    color: Colors.textSecondary,
  },

  // Demo button
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(233, 122, 66, 0.05)',
    gap: Spacing.sm,
  },
  demoButtonText: {
    fontSize: Typography.callout,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Sign up link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signUpText: {
    fontSize: Typography.subhead,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: Typography.subhead,
    fontWeight: '700',
    color: Colors.primary,
  },
});
