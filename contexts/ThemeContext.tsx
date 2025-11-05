// File: contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors, DarkColors } from '@/constants/theme';

type ThemeMode = 'auto' | 'light' | 'dark';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  currentColors: typeof Colors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@athloscore_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useNativeColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Determine actual color scheme based on theme mode
  const getColorScheme = (): ColorScheme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as ColorScheme;
  };

  const colorScheme = getColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;

  // Load theme mode from storage on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['auto', 'light', 'dark'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorScheme,
        currentColors,
        setThemeMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}