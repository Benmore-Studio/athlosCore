import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStoreInitialization } from '@/hooks/useStoreInitialization';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initError } = useStoreInitialization();

  // Log initialization errors
  useEffect(() => {
    if (initError) {
      console.error('Store initialization error:', initError);
    }
  }, [initError]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="video" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
