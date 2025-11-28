// File: services/api/offlineApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const CACHE_PREFIX = '@api_cache_';
const CACHE_TIMESTAMP_KEY = '@cache_timestamp_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheConfig {
  key: string;
  expiryMs?: number;
}

class OfflineApiService {
  async fetchWithCache<T>(
    fetchFn: () => Promise<T>,
    cacheConfig: CacheConfig
  ): Promise<T> {
    const { key, expiryMs = CACHE_EXPIRY } = cacheConfig;
    
    try {
      const data = await fetchFn();
      await this.cacheData(key, data);
      return data;
    } catch (err) {
      console.warn('API call failed, attempting to use cache:', err);
      const cachedData = await this.getCachedData<T>(key, expiryMs);
      
      if (cachedData) {
        console.log(`✅ Using cached data for: ${key}`);
        return cachedData;
      }
      
      throw err;
    }
  }

  private async cacheData(key: string, data: any): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const timestampKey = `${CACHE_TIMESTAMP_KEY}${key}`;
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      
      console.log(`✅ Cached data for key: ${key}`);
    } catch (err) {
      console.error('Failed to cache data:', err);
      Sentry.captureException(err, {
        tags: { action: 'cache_data' },
        extra: { key }
      });
    }
  }

  private async getCachedData<T>(key: string, expiryMs: number): Promise<T | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const timestampKey = `${CACHE_TIMESTAMP_KEY}${key}`;
      
      const [cachedData, timestamp] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(timestampKey)
      ]);

      if (!cachedData) {
        return null;
      }

      if (timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        if (cacheAge > expiryMs) {
          console.log(`⚠️ Cache expired for key: ${key}`);
          await this.clearCache(key);
          return null;
        }
      }

      console.log(`✅ Retrieved cached data for key: ${key}`);
      return JSON.parse(cachedData) as T;
    } catch (err) {
      console.error('Failed to get cached data:', err);
      return null;
    }
  }

  async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const timestampKey = `${CACHE_TIMESTAMP_KEY}${key}`;
        await AsyncStorage.multiRemove([cacheKey, timestampKey]);
        console.log(`🗑️ Cleared cache for key: ${key}`);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => 
          k.startsWith(CACHE_PREFIX) || k.startsWith(CACHE_TIMESTAMP_KEY)
        );
        await AsyncStorage.multiRemove(cacheKeys);
        console.log('🗑️ Cleared all cache');
      }
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }

  async getCachedKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(k => k.startsWith(CACHE_PREFIX))
        .map(k => k.replace(CACHE_PREFIX, ''));
    } catch (err) {
      console.error('Failed to get cached keys:', err);
      return [];
    }
  }

  async getCacheInfo(): Promise<{ keysCount: number; keys: string[] }> {
    const keys = await this.getCachedKeys();
    return {
      keysCount: keys.length,
      keys
    };
  }

  // Alias for clearCache() without parameters for better clarity
  async clearAllCache(): Promise<void> {
    return this.clearCache();
  }
}

export default new OfflineApiService();