import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { Breakpoints } from '@/constants/theme';

interface ResponsiveInfo {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  gridColumns: number;
}

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  const isPhone = width < Breakpoints.tablet;
  const isTablet = width >= Breakpoints.tablet && width < Breakpoints.desktop;
  const isDesktop = width >= Breakpoints.desktop;
  const isLandscape = width > height;
  const isPortrait = height > width;

  // Determine grid columns based on screen size
  let gridColumns = 2; // Default for phone
  if (isTablet) {
    gridColumns = isLandscape ? 4 : 3;
  } else if (isDesktop) {
    gridColumns = 6;
  }

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    gridColumns,
  };
}

export default useResponsive;