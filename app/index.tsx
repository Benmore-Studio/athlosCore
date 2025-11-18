// File: app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log('📍 Index - Auth status:', isAuthenticated);

    // Navigate based on auth status
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
    //   router.replace('/(auth)/login');
    router.replace('/(auth)/login');

    }
  }, [isAuthenticated, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}