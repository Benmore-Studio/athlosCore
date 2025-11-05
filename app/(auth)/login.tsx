import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import authService from '@/services/api/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting login with email:', email);

      // Call login API using authService
      const token = await authService.login({
        email: email.toLowerCase().trim(),
        password: password,
      });

      console.log('Login successful, token received');
      Alert.alert('Success', 'Login successful!');

      // Navigate to org selection screen
      router.replace('/(auth)/org-selection');

    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      
      if (error.response?.status === 401 || errorMessage?.includes('Invalid') || errorMessage?.includes('credentials')) {
        Alert.alert('Error', 'Invalid email or password');
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        Alert.alert(
          'Network Error',
          'Cannot connect to the server.\n\n' +
          'Possible causes:\n' +
          '• Backend server is not running\n' +
          '• Wrong API URL in config/api.ts\n' +
          '• Network connection issue\n\n' +
          'Current URL: ' + error.config?.baseURL + error.config?.url + '\n\n' +
          'Would you like to continue in DEMO mode?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Demo Mode',
              onPress: () => {
                console.log('Using demo mode');
                Alert.alert('Demo Mode', 'Continuing without backend connection');
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage || 'Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5F0', '#E97A42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.header}>
            <ThemedView style={styles.logoContainer}>
              <LinearGradient
                colors={['#E97A42', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBox}
              >
                <ThemedText style={styles.logoText}>A</ThemedText>
              </LinearGradient>
            </ThemedView>
            <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to AthlosCore™</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(1000)} style={styles.formContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  autoCorrect={false}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  autoCapitalize="none"
                />
              </ThemedView>

              <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Password reset feature coming soon!')}>
                <ThemedText style={styles.forgotPassword}>Forgot Password?</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#CCCCCC', '#999999'] : ['#E97A42', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <ThemedView style={styles.divider}>
                <ThemedView style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>or continue with</ThemedText>
                <ThemedView style={styles.dividerLine} />
              </ThemedView>

              {/* Social login buttons - Coming soon */}
              {/* <ThemedView style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <ThemedText style={styles.socialIcon}>G</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <ThemedText style={styles.socialIcon}>🍎</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <ThemedText style={styles.socialIcon}>📱</ThemedText>
                </TouchableOpacity>
              </ThemedView> */}

              <TouchableOpacity 
                style={styles.signupLink}
                onPress={() => router.push('/(auth)/register')}
                disabled={loading}
              >
                <ThemedText style={styles.signupText}>
                  Don't have an account? <ThemedText style={styles.signupBold}>Sign Up</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(233, 122, 66, 0.3)',
    overflow: 'hidden',
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E97A42',
  },
  forgotPassword: {
    color: '#E97A42',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'transparent',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E97A42',
  },
  dividerText: {
    color: '#666666',
    marginHorizontal: 12,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E97A42',
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 24,
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: '#666666',
    fontSize: 14,
  },
  signupBold: {
    fontWeight: 'bold',
    color: '#E97A42',
  },
});