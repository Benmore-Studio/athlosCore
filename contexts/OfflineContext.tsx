// File: contexts/OfflineContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

interface OfflineContextType {
  isOnline: boolean;
  isConnected: boolean;
  queueUpload: (data: QueueItem) => Promise<void>;
  processQueue: () => Promise<void>;
  cacheData: (key: string, data: any) => Promise<void>;
  getCachedData: (key: string) => Promise<any>;
  clearCache: (key?: string) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const CACHE_PREFIX = '@cache_';
const QUEUE_KEY = '@upload_queue';
const CACHE_TIMESTAMP_KEY = '@cache_timestamp_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface QueueItem {
  id?: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp?: number;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsConnected(state.isConnected ?? true);

      console.log('Network state:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        online
      });

      if (online) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const cacheData = async (key: string, data: any) => {
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
  };

  const getCachedData = async (key: string) => {
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
        if (cacheAge > CACHE_EXPIRY) {
          console.log(`⚠️ Cache expired for key: ${key}`);
          await clearCache(key);
          return null;
        }
      }

      console.log(`✅ Retrieved cached data for key: ${key}`);
      return JSON.parse(cachedData);
    } catch (err) {
      console.error('Failed to get cached data:', err);
      return null;
    }
  };

  const clearCache = async (key?: string) => {
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
  };

  const queueUpload = async (data: QueueItem) => {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
      const queue: QueueItem[] = queueJson ? JSON.parse(queueJson) : [];
      
      queue.push({
        ...data,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      });

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log(`📤 Queued upload:`, data.endpoint);
    } catch (err) {
      console.error('Failed to queue upload:', err);
      Sentry.captureException(err, {
        tags: { action: 'queue_upload' },
        extra: { endpoint: data.endpoint }
      });
    }
  };

  const processQueue = async () => {
    if (!isOnline) {
      console.log('⚠️ Cannot process queue - offline');
      return;
    }

    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
      if (!queueJson) {
        return;
      }

      const queue: QueueItem[] = JSON.parse(queueJson);
      if (queue.length === 0) {
        return;
      }

      console.log(`📤 Processing ${queue.length} queued uploads...`);

      const failedItems: QueueItem[] = [];

      for (const item of queue) {
        try {
          const { default: apiService } = await import('@/services/api/apiService');
          
          await apiService.request({
            url: item.endpoint,
            method: item.method,
            data: item.data
          });

          console.log(`✅ Processed queued upload: ${item.endpoint}`);
        } catch (err) {
          console.error(`❌ Failed to process queued upload: ${item.endpoint}`, err);
          failedItems.push(item);
        }
      }

      if (failedItems.length > 0) {
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));
        console.log(`⚠️ ${failedItems.length} uploads failed, will retry later`);
      } else {
        await AsyncStorage.removeItem(QUEUE_KEY);
        console.log('✅ All queued uploads processed successfully');
      }
    } catch (err) {
      console.error('Failed to process queue:', err);
      Sentry.captureException(err, {
        tags: { action: 'process_queue' }
      });
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isConnected,
        queueUpload,
        processQueue,
        cacheData,
        getCachedData,
        clearCache
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}