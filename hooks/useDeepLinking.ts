// File: hooks/useDeepLinking.ts
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export const useDeepLinking = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL when app opens from a link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        console.log('Initial URL:', initialUrl);
        
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    // Handle deep links while app is running
    const handleDeepLink = (url: string) => {
      try {
        console.log('Deep link received:', url);
        
        // ✅ Use Linking.parse correctly with your scheme
        const parsed = Linking.parse(url);
        console.log('Parsed URL:', parsed);
        
        // Handle different paths
        if (parsed.path) {
          router.push(parsed.path as any);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    handleInitialURL();

    // Listen for deep links
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
};