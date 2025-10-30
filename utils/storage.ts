/**
 * Storage Utility
 *
 * Wrapper around AsyncStorage for type-safe data persistence.
 * Stores user preferences and session data on the device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys - namespaced with @athloscore prefix
 */
export const StorageKeys = {
  SELECTED_TEAM_ID: '@athloscore:selected_team_id',
  SELECTED_PLAYER_ID: '@athloscore:selected_player_id',
  PLAYBACK_SPEED: '@athloscore:playback_speed',
  THEME: '@athloscore:theme',
  ONBOARDING_COMPLETE: '@athloscore:onboarding_complete',
  AUTH_TOKEN: '@athloscore:auth_token',
  CURRENT_ORG_ID: '@athloscore:current_org_id',
} as const;

/**
 * Storage utility class with type-safe methods
 */
class Storage {
  /**
   * Store a value in AsyncStorage
   * Automatically serializes objects to JSON
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value from AsyncStorage
   * Automatically deserializes JSON to object
   * Returns null if key doesn't exist
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all AsyncStorage data
   * Use with caution!
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get multiple items at once
   */
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};

      values.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  /**
   * Check if a key exists
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking ${key}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const storage = new Storage();

// Export type-safe helper functions for common operations
export const StorageHelpers = {
  /**
   * Save selected team ID
   */
  async saveSelectedTeam(teamId: string): Promise<void> {
    await storage.setItem(StorageKeys.SELECTED_TEAM_ID, teamId);
  },

  /**
   * Get selected team ID
   */
  async getSelectedTeam(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.SELECTED_TEAM_ID);
  },

  /**
   * Save selected player ID
   */
  async saveSelectedPlayer(playerId: string): Promise<void> {
    await storage.setItem(StorageKeys.SELECTED_PLAYER_ID, playerId);
  },

  /**
   * Get selected player ID
   */
  async getSelectedPlayer(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.SELECTED_PLAYER_ID);
  },

  /**
   * Save playback speed preference
   */
  async savePlaybackSpeed(speed: number): Promise<void> {
    await storage.setItem(StorageKeys.PLAYBACK_SPEED, speed);
  },

  /**
   * Get playback speed preference (defaults to 1.0)
   */
  async getPlaybackSpeed(): Promise<number> {
    const speed = await storage.getItem<number>(StorageKeys.PLAYBACK_SPEED);
    return speed ?? 1.0;
  },

  /**
   * Save theme preference
   */
  async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    await storage.setItem(StorageKeys.THEME, theme);
  },

  /**
   * Get theme preference
   */
  async getTheme(): Promise<'light' | 'dark' | 'auto' | null> {
    return storage.getItem<'light' | 'dark' | 'auto'>(StorageKeys.THEME);
  },

  /**
   * Mark onboarding as complete
   */
  async setOnboardingComplete(): Promise<void> {
    await storage.setItem(StorageKeys.ONBOARDING_COMPLETE, true);
  },

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    const complete = await storage.getItem<boolean>(StorageKeys.ONBOARDING_COMPLETE);
    return complete ?? false;
  },

  /**
   * Save auth token
   */
  async saveAuthToken(token: string): Promise<void> {
    await storage.setItem(StorageKeys.AUTH_TOKEN, token);
  },

  /**
   * Get auth token
   */
  async getAuthToken(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.AUTH_TOKEN);
  },

  /**
   * Remove auth token (logout)
   */
  async removeAuthToken(): Promise<void> {
    await storage.removeItem(StorageKeys.AUTH_TOKEN);
  },

  /**
   * Save current organization ID
   */
  async saveCurrentOrg(orgId: string): Promise<void> {
    await storage.setItem(StorageKeys.CURRENT_ORG_ID, orgId);
  },

  /**
   * Get current organization ID
   */
  async getCurrentOrg(): Promise<string | null> {
    return storage.getItem<string>(StorageKeys.CURRENT_ORG_ID);
  },
};
