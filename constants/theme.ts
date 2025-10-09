/**
 * AthlosCore Theme Configuration
 * Based on the mockups with dark header and orange accents
 */

import { Platform } from 'react-native';

export const Colors = {
  primary: '#E97A42', // Orange accent color from mockups
  primaryLight: '#FF8F5A',
  primaryDark: '#D16B35',

  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceSecondary: '#FFFFFF',

  // Header colors (dark navy from mockups)
  headerBackground: '#1E2A3A',
  headerText: '#FFFFFF',

  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Card and border colors
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Game specific colors
  win: '#10B981',
  loss: '#EF4444',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',

  // Legacy support for existing components
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: '#E97A42',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#E97A42',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1E2A3A',
    tint: '#E97A42',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#E97A42',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Typography = {
  // Font sizes optimized for iPad and large screens
  title1: 32,      // Main headings
  title2: 28,      // Section headings
  title3: 24,      // Card titles
  headline: 20,    // Important text
  body: 18,        // Regular body text
  callout: 16,     // Secondary text
  subhead: 14,     // Labels
  footnote: 12,    // Small text
  caption: 10,     // Very small text

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Component specific spacing
  cardPadding: 20,
  screenPadding: 24,
  sectionSpacing: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Responsive breakpoints for different screen sizes
export const Breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};

// Layout constants for iPad landscape orientation
export const Layout = {
  // Grid system for Quick Actions
  gridColumns: {
    phone: 2,
    tablet: 4,
    desktop: 6,
  },

  // Content width constraints
  maxContentWidth: 1200,
  sidebarWidth: 280,

  // Header heights
  headerHeight: 80,
  tabBarHeight: 70,
};

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  breakpoints: Breakpoints,
  layout: Layout,
};

export default Theme;
