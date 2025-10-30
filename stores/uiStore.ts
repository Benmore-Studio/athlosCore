/**
 * UI Store
 *
 * Global state management for UI settings and preferences with AsyncStorage persistence.
 * Manages theme, onboarding, app settings, and UI-related state.
 */

import { create } from 'zustand';
import { storage, StorageKeys } from '@/utils/storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppSettings {
  notifications: {
    uploadComplete: boolean;
    analysisReady: boolean;
    weeklyReport: boolean;
  };
  video: {
    autoplay: boolean;
    autoplayOnCellular: boolean;
    videoQuality: 'auto' | 'high' | 'medium' | 'low';
  };
  analytics: {
    showAdvancedStats: boolean;
    defaultTimeframe: '7d' | '30d' | 'season' | 'all';
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReportsEnabled: boolean;
  };
}

interface UIStore {
  // State
  theme: ThemeMode;
  onboardingComplete: boolean;
  settings: AppSettings;
  isAppLoading: boolean;
  activeModal: string | null;
  toastMessage: string | null;

  // Actions - Theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Actions - Onboarding
  setOnboardingComplete: (complete: boolean) => void;

  // Actions - Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotificationSettings: (updates: Partial<AppSettings['notifications']>) => void;
  updateVideoSettings: (updates: Partial<AppSettings['video']>) => void;
  updateAnalyticsSettings: (updates: Partial<AppSettings['analytics']>) => void;
  updatePrivacySettings: (updates: Partial<AppSettings['privacy']>) => void;
  resetSettings: () => void;

  // Actions - UI State
  setAppLoading: (isLoading: boolean) => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;

  // Persistence
  loadTheme: () => Promise<void>;
  loadOnboardingStatus: () => Promise<void>;
  loadAllSettings: () => Promise<void>;

  // Reset
  reset: () => void;
}

const defaultSettings: AppSettings = {
  notifications: {
    uploadComplete: true,
    analysisReady: true,
    weeklyReport: true,
  },
  video: {
    autoplay: false,
    autoplayOnCellular: false,
    videoQuality: 'auto',
  },
  analytics: {
    showAdvancedStats: false,
    defaultTimeframe: '30d',
  },
  privacy: {
    analyticsEnabled: true,
    crashReportsEnabled: true,
  },
};

const initialState = {
  theme: 'auto' as ThemeMode,
  onboardingComplete: false,
  settings: defaultSettings,
  isAppLoading: true,
  activeModal: null,
  toastMessage: null,
};

export const useUIStore = create<UIStore>((set, get) => ({
  ...initialState,

  // Theme
  setTheme: (theme) => {
    set({ theme });
    storage.setItem(StorageKeys.THEME, theme).catch(console.error);
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // Onboarding
  setOnboardingComplete: (complete) => {
    set({ onboardingComplete: complete });
    storage.setItem(StorageKeys.ONBOARDING_COMPLETE, complete).catch(console.error);
  },

  // Settings
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  updateNotificationSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          ...updates,
        },
      },
    }));
  },

  updateVideoSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        video: {
          ...state.settings.video,
          ...updates,
        },
      },
    }));
  },

  updateAnalyticsSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        analytics: {
          ...state.settings.analytics,
          ...updates,
        },
      },
    }));
  },

  updatePrivacySettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        privacy: {
          ...state.settings.privacy,
          ...updates,
        },
      },
    }));
  },

  resetSettings: () => {
    set({ settings: defaultSettings });
  },

  // UI State
  setAppLoading: (isLoading) => {
    set({ isAppLoading: isLoading });
  },

  showModal: (modalId) => {
    set({ activeModal: modalId });
  },

  hideModal: () => {
    set({ activeModal: null });
  },

  showToast: (message, duration = 3000) => {
    set({ toastMessage: message });

    // Auto-hide after duration
    setTimeout(() => {
      if (get().toastMessage === message) {
        get().hideToast();
      }
    }, duration);
  },

  hideToast: () => {
    set({ toastMessage: null });
  },

  // Persistence
  loadTheme: async () => {
    try {
      const theme = await storage.getItem<ThemeMode>(StorageKeys.THEME);
      if (theme) {
        set({ theme });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },

  loadOnboardingStatus: async () => {
    try {
      const complete = await storage.getItem<boolean>(StorageKeys.ONBOARDING_COMPLETE);
      if (complete !== null) {
        set({ onboardingComplete: complete });
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    }
  },

  loadAllSettings: async () => {
    try {
      await Promise.all([
        get().loadTheme(),
        get().loadOnboardingStatus(),
      ]);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      set({ isAppLoading: false });
    }
  },

  reset: () => {
    set(initialState);
    Promise.all([
      storage.removeItem(StorageKeys.THEME),
      storage.removeItem(StorageKeys.ONBOARDING_COMPLETE),
    ]).catch(console.error);
  },
}));
