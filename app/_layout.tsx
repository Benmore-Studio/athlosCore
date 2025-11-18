import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import OfflineBanner from '@/components/OfflineBanner';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import 'react-native-reanimated';
import React from 'react';
import { initializeSentry } from '@/config/sentry';
import DevPerformanceMonitor from '@/components/DevPerformanceMonitor';

// Initialize Sentry BEFORE the app starts
initializeSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isDark } = useTheme();
  useDeviceOrientation();

  return (
    <>
      <OfflineBanner />
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="settings" 
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right',
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'Modal', 
              headerShown: true 
            }} 
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
      {/* DevPerformanceMonitor has access to all providers here */}
      <DevPerformanceMonitor />
    </>
  );
}

export default function RootLayout() {
  return (
    <OfflineProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* All providers wrap RootLayoutNav */}
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </OfflineProvider>
  );
}

// // File: app/_layout.tsx
// import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { AuthProvider } from '@/contexts/AuthContext';
// import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
// import 'react-native-reanimated';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// function RootLayoutNav() {
//   const { isDark } = useTheme();

//   return (
//     <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(auth)" />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen 
//           name="settings" 
//           options={{ 
//             presentation: 'card',
//             animation: 'slide_from_right',
//           }} 
//         />
//         <Stack.Screen 
//           name="modal" 
//           options={{ 
//             presentation: 'modal', 
//             title: 'Modal', 
//             headerShown: true 
//           }} 
//         />
//       </Stack>
//       <StatusBar style={isDark ? 'light' : 'dark'} />
//     </NavigationThemeProvider>
//   );
// }

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <RootLayoutNav />
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }