/**
 * AthlosCore Theme Configuration
 * Based on the mockups with dark header and orange accents
 * Updated for Issue #1 - Comprehensive UI/Design Modernization
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

/**
 * Dark Mode Colors - OLED Optimized
 * Using true black (#000000) for OLED optimization
 */
export const DarkColors = {
  primary: '#E97A42',
  primaryLight: '#FF8F5A',
  primaryDark: '#D16B35',

  // Background colors - True black for OLED
  background: '#000000',
  surface: '#0A0A0A',
  surfaceSecondary: '#141414',
  surfaceTertiary: '#1A1A1A',

  // Header colors
  headerBackground: '#0A0A0A',
  headerText: '#FFFFFF',

  // Text colors
  text: '#A1A1A1', // Pure black for light mode
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  // text: '#FFFFFF',
  // textSecondary: '#A1A1A1',
  // textLight: '#737373',
  // textOnPrimary: '#FFFFFF',

  // Status colors (adjusted for dark mode)
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Card and border colors
  cardBackground: '#141414',
  border: '#262626',
  borderLight: '#1A1A1A',

  // Game specific colors
  win: '#22C55E',
  loss: '#F87171',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

/**
 * Gradient Definitions
 * Using brand colors: Orange (#E97A42) and Navy (#1E2A3A)
 */
export const Gradients = {
  // Primary gradients
  primary: {
    colors: ['#E97A42', '#FF8F5A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryVertical: {
    colors: ['#E97A42', '#FF8F5A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  primaryHorizontal: {
    colors: ['#E97A42', '#FF8F5A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Accent gradients
  orangeToNavy: {
    colors: ['#E97A42', '#1E2A3A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  navyToOrange: {
    colors: ['#1E2A3A', '#E97A42'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Subtle overlay gradients
  overlayTop: {
    colors: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  overlayBottom: {
    colors: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Shimmer effect
  shimmer: {
    colors: ['#F3F4F6', '#E5E7EB', '#F3F4F6'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  shimmerDark: {
    colors: ['#1A1A1A', '#262626', '#1A1A1A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Status gradients
  success: {
    colors: ['#10B981', '#22C55E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  error: {
    colors: ['#EF4444', '#F87171'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warning: {
    colors: ['#F59E0B', '#FBBF24'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Hero section gradients
  heroLight: {
    colors: ['#FFFFFF', '#F8F9FA'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  heroDark: {
    colors: ['#000000', '#0A0A0A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
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
  xxl: 24,
  full: 9999,
};

/**
 * Enhanced Shadow System for Elevation
 * Layered shadows for more depth and modern appearance
 */
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  // Colored shadows for special effects
  primaryGlow: {
    shadowColor: '#E97A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorGlow: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

/**
 * Blur Effects
 * For glassmorphism and modern overlays
 */
export const BlurIntensity = {
  light: 10,
  regular: 20,
  strong: 30,
  ultraThin: 5,
};

export const BlurType = {
  light: 'light',
  dark: 'dark',
  regular: 'regular',
  prominent: 'prominent',
  chromeMaterial: 'chromeMaterial',
  materialLight: 'materialLight',
  materialDark: 'materialDark',
  thinMaterialLight: 'thinMaterialLight',
  thinMaterialDark: 'thinMaterialDark',
  ultraThinMaterialLight: 'ultraThinMaterialLight',
  ultraThinMaterialDark: 'ultraThinMaterialDark',
} as const;

/**
 * Animation Configuration
 * Using react-native-reanimated spring physics
 */
export const Animation = {
  // Spring configs for different use cases
  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    smooth: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 25,
      stiffness: 180,
      mass: 0.6,
    },
  },
  
  // Timing durations
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing curves
  easing: {
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
    linear: 'linear',
  },

  // Micro-interaction scales
  scale: {
    press: 0.95,
    hover: 1.02,
    active: 0.97,
  },
};

/**
 * Component Style Variants
 * Pre-defined styles for common component states
 */
export const ComponentVariants = {
  // Button variants
  button: {
    primary: {
      backgroundColor: Colors.primary,
      ...Shadows.medium,
    },
    primaryGradient: {
      gradient: Gradients.primary,
      ...Shadows.primaryGlow,
    },
    secondary: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      ...Shadows.small,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    disabled: {
      backgroundColor: Colors.borderLight,
      opacity: 0.5,
    },
  },

  // Card variants
  card: {
    default: {
      backgroundColor: Colors.cardBackground,
      borderRadius: BorderRadius.lg,
      ...Shadows.small,
    },
    elevated: {
      backgroundColor: Colors.cardBackground,
      borderRadius: BorderRadius.lg,
      ...Shadows.medium,
    },
    elevated_high: {
      backgroundColor: Colors.cardBackground,
      borderRadius: BorderRadius.lg,
      ...Shadows.large,
    },
    bordered: {
      backgroundColor: Colors.cardBackground,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },

  // Input variants
  input: {
    default: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    focused: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: Colors.primary,
      ...Shadows.small,
    },
    error: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: Colors.error,
    },
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
  
  // Floating tab bar (modern iOS style)
  floatingTabBar: {
    height: 60,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: BorderRadius.xl,
  },
};

/**
 * Theme object combining all design tokens
 */
export const Theme = {
  colors: Colors,
  darkColors: DarkColors,
  gradients: Gradients,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  blur: {
    intensity: BlurIntensity,
    type: BlurType,
  },
  animation: Animation,
  componentVariants: ComponentVariants,
  breakpoints: Breakpoints,
  layout: Layout,
};

export default Theme;