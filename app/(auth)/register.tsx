import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import authService, { Organization } from '@/services/api/authService';

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
  const router = useRouter();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const data = await authService.getOrganizations();
      setOrganizations(data);
    } catch (error: any) {
      console.log('Could not fetch organizations (user may not be logged in yet)');
      // Don't show error - it's optional
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleRegister = async () => {
    // Validation
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call the registration API using authService
      const response = await authService.register({
        full_name: name,
        email: email.toLowerCase().trim(),
        password: password,
        org_ids: selectedOrg ? [selectedOrg.org_id] : undefined,
      });

      console.log('Registration successful:', response);

      // Navigate to main app or org selection
      if (selectedOrg) {
        // User selected an org, go to main app
        router.replace('/(tabs)');
      } else if (response.organizations && response.organizations.length > 0) {
        // User has orgs but didn't select one, show org selection
        router.replace('/(auth)/org-selection');
      } else {
        // No orgs, go to main app
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage?.includes('already exists') || errorMessage?.includes('duplicate')) {
        Alert.alert('Error', 'An account with this email already exists');
      } else if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
        Alert.alert('Error', 'Network error. Please check your connection and try again');
      } else {
        Alert.alert('Error', errorMessage || 'Registration failed. Please try again');
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
      year: 'numeric' 
    });
  };

  const renderOrgItem = ({ item }: { item: Organization }) => (
    <TouchableOpacity
      style={styles.orgItem}
      onPress={() => {
        setSelectedOrg(item);
        setShowOrgModal(false);
      }}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.orgItemContent}>
        <ThemedView style={styles.orgItemIcon}>
          <LinearGradient
            colors={['#E97A42', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orgIconGradient}
          >
            <ThemedText style={styles.orgIconText}>
              {item.name.charAt(0).toUpperCase()}
            </ThemedText>
          </LinearGradient>
        </ThemedView>
        <ThemedView style={styles.orgItemInfo}>
          <ThemedText style={styles.orgItemName}>{item.name}</ThemedText>
          <ThemedText style={styles.orgItemDate}>
            Created {formatDate(item.created_at)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

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
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Join AthlosCore™ today</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(1000)} style={styles.formContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#999999"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </ThemedView>

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

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  autoCapitalize="none"
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedView style={styles.labelContainer}>
                  <ThemedText style={styles.label}>Organization</ThemedText>
                  <ThemedText style={styles.optionalLabel}>(Optional)</ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowOrgModal(true)}
                  disabled={loading || loadingOrgs || organizations.length === 0}
                  activeOpacity={0.7}
                >
                  {loadingOrgs ? (
                    <ActivityIndicator size="small" color="#E97A42" />
                  ) : (
                    <ThemedText style={selectedOrg ? styles.selectedOrgText : styles.placeholderText}>
                      {selectedOrg ? selectedOrg.name : organizations.length > 0 ? 'Select an organization' : 'No organizations available'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
                {selectedOrg && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSelectedOrg(null)}
                  >
                    <ThemedText style={styles.clearButtonText}>Clear selection</ThemedText>
                  </TouchableOpacity>
                )}
              </ThemedView>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <ThemedView style={styles.termsContainer}>
                <ThemedText style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <ThemedText style={styles.termsLink}>Terms</ThemedText> and{' '}
                  <ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
                </ThemedText>
              </ThemedView>

              <TouchableOpacity 
                style={styles.signupLink}
                onPress={() => router.push('/(auth)/login')}
                disabled={loading}
              >
                <ThemedText style={styles.signupText}>
                  Already have an account? <ThemedText style={styles.signupBold}>Sign In</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Organization Selection Modal */}
      <Modal
        visible={showOrgModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrgModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Organization</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOrgModal(false)}
              >
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={organizations}
              renderItem={renderOrgItem}
              keyExtractor={(item) => item.org_id}
              contentContainerStyle={styles.orgList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </ThemedView>
      </Modal>
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E97A42',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  selectedOrgText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  clearButtonText: {
    color: '#E97A42',
    fontSize: 14,
    fontWeight: '600',
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
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  termsText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#E97A42',
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666666',
    fontSize: 14,
  },
  signupBold: {
    fontWeight: 'bold',
    color: '#E97A42',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
  orgList: {
    padding: 20,
  },
  orgItem: {
    marginBottom: 12,
  },
  orgItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orgItemIcon: {
    marginRight: 12,
    backgroundColor: 'transparent',
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
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  orgItemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  orgItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orgItemDate: {
    fontSize: 12,
    color: '#666666',
  },
});