import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

interface Organization {
  id: string;
  name: string;
  members: number;
  icon: string;
}

export default function OrgSelectionScreen() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch user's organizations
    // For now, using mock data
    setOrganizations([
      { id: '1', name: 'Lincoln Eagles', members: 150, icon: '🏀' },
      { id: '2', name: 'Warriors Basketball', members: 87, icon: '⛹️' },
      { id: '3', name: 'Hoops Academy', members: 45, icon: '🎯' },
      { id: '4', name: 'Elite Training', members: 203, icon: '🏆' },
    ]);
  }, []);

  const handleContinue = async () => {
    if (!selectedOrg) {
      Alert.alert('Error', 'Please select an organization');
      return;
    }

    setLoading(true);
    try {
      // Save selected organization to user profile
      // await saveUserOrganization(user.id, selectedOrg);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = () => {
    // Navigate to create organization flow
    Alert.alert('Create Organization', 'This feature will be available soon!');
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
            <ThemedText type="title" style={styles.title}>Select Organization</ThemedText>
            <ThemedText style={styles.subtitle}>Choose your team workspace</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(1000)} style={styles.orgContainer}>
            {organizations.map((org, index) => (
              <Animated.View
                key={org.id}
                entering={FadeInDown.delay(600 + index * 100).duration(1000)}
              >
                <TouchableOpacity
                  onPress={() => setSelectedOrg(org.id)}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <BlurView
                    intensity={selectedOrg === org.id ? 40 : 20}
                    tint="light"
                    style={[
                      styles.orgCard,
                      selectedOrg === org.id && styles.orgCardSelected,
                    ]}
                  >
                    <ThemedView style={styles.orgIconContainer}>
                      <ThemedText style={styles.orgIcon}>{org.icon}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.orgInfo}>
                      <ThemedText style={styles.orgName}>{org.name}</ThemedText>
                      <ThemedText style={styles.orgMembers}>{org.members} members</ThemedText>
                    </ThemedView>
                    <ThemedView style={[
                      styles.checkbox,
                      selectedOrg === org.id && styles.checkboxSelected,
                    ]}>
                      {selectedOrg === org.id && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </ThemedView>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <TouchableOpacity 
              style={styles.createOrgButton}
              onPress={handleCreateOrg}
              disabled={loading}
            >
              <BlurView intensity={20} tint="light" style={styles.createOrgBlur}>
                <ThemedText style={styles.createOrgIcon}>➕</ThemedText>
                <ThemedText style={styles.createOrgText}>Create New Organization</ThemedText>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinue}
              disabled={!selectedOrg || loading}
            >
              <LinearGradient
                colors={selectedOrg ? ['#E97A42', '#F59E0B'] : ['#ccc', '#999']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'Loading...' : 'Continue'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => router.replace('/(tabs)')}
              disabled={loading}
            >
              <ThemedText style={styles.skipText}>Skip for now</ThemedText>
            </TouchableOpacity>
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
  orgContainer: {
    width: '100%',
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(233, 122, 66, 0.3)',
    overflow: 'hidden',
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orgCardSelected: {
    backgroundColor: 'rgba(255,255,255,1)',
    borderColor: '#E97A42',
    borderWidth: 2,
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  orgIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(233, 122, 66, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orgIcon: {
    fontSize: 28,
  },
  orgInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  orgName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orgMembers: {
    fontSize: 14,
    color: '#666666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E97A42',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#E97A42',
    borderColor: '#E97A42',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createOrgButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  createOrgBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E97A42',
    borderStyle: 'dashed',
  },
  createOrgIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#E97A42',
  },
  createOrgText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E97A42',
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
  continueButton: {
    marginTop: 0,
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
  skipButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  skipText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});