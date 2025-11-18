// File: hooks/useDeviceOrientation.ts
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useWindowDimensions } from 'react-native';

export const useDeviceOrientation = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  useEffect(() => {
    const setOrientation = async () => {
      if (isTablet) {
        // Tablets: Allow all orientations (user can rotate)
        await ScreenOrientation.unlockAsync();
      } else {
        // Phones: Lock to portrait only
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
    };

    setOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isTablet]);

  return { isTablet };
};