/**
 * Store Initialization Hook
 *
 * Initializes all Zustand stores with persisted data from AsyncStorage.
 * Call this hook at the root of the app (_layout.tsx) to load saved state.
 */

import { useEffect, useState } from 'react';
import { useTeamStore, usePlayerStore, useVideoStore, useUIStore } from '@/stores';

export function useStoreInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const loadTeamStore = useTeamStore((state) => state.loadSelectedTeam);
  const loadPlayerStore = usePlayerStore((state) => state.loadSelectedPlayer);
  const loadVideoStore = useVideoStore((state) => state.loadPlaybackSpeed);
  const loadUIStore = useUIStore((state) => state.loadAllSettings);
  const setAppLoading = useUIStore((state) => state.setAppLoading);

  useEffect(() => {
    async function initializeStores() {
      try {
        setAppLoading(true);

        // Load all persisted state in parallel
        await Promise.all([
          loadUIStore(),
          loadTeamStore(),
          loadPlayerStore(),
          loadVideoStore(),
        ]);

        setIsInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to load app data');
        setIsInitialized(false);
      } finally {
        setAppLoading(false);
      }
    }

    initializeStores();
  }, [loadTeamStore, loadPlayerStore, loadVideoStore, loadUIStore, setAppLoading]);

  return { isInitialized, initError };
}
