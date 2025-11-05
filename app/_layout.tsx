// File: app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import OfflineBanner from '@/components/OfflineBanner';
import 'react-native-reanimated';
import React from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <>
      <OfflineBanner />
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <OfflineProvider>
      <ThemeProvider>
        <AuthProvider>
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