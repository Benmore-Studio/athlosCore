import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, DarkColors, Typography, BorderRadius, Spacing, Shadows, Gradients, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PlayerAvatarProps {
  imageUri?: string;
  name: string;
  jerseyNumber?: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  showJerseyNumber?: boolean;
  variant?: 'default' | 'gradient' | 'glow';
  online?: boolean;
  animate?: boolean;
}

function PlayerAvatar({
  imageUri,
  name,
  jerseyNumber,
  size = 'medium',
  style,
  showJerseyNumber = true,
  variant = 'default',
  online = false,
  animate = false,
}: PlayerAvatarProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (animate) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, Animation.spring.gentle),
          withSpring(1, Animation.spring.gentle)
        ),
        -1,
        true
      );
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeStyles = styles[size];
  const borderSize = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

  // Gradient border avatar
  if (variant === 'gradient') {
    return (
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <LinearGradient
          colors={Gradients.primary.colors}
          start={Gradients.primary.start}
          end={Gradients.primary.end}
          style={[sizeStyles, styles.gradientBorder]}
        >
          <View style={[
            styles.gradientInner,
            {
              width: sizeStyles.width - borderSize * 2,
              height: sizeStyles.height - borderSize * 2,
            }
          ]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <LinearGradient
                colors={Gradients.primary.colors}
                start={Gradients.primary.start}
                end={Gradients.primary.end}
                style={styles.placeholderGradient}
              >
                <Text style={[styles.text, styles[`${size}Text`]]}>{getInitials(name)}</Text>
              </LinearGradient>
            )}
          </View>
        </LinearGradient>

        {online && (
          <View style={[styles.onlineIndicator, styles[`${size}OnlineIndicator`]]}>
            <View style={styles.onlineDot} />
          </View>
        )}

        {showJerseyNumber && jerseyNumber && (
          <LinearGradient
            colors={[currentColors.headerBackground, '#2D3E52']}
            style={[styles.jerseyBadge, styles[`${size}JerseyBadge`]]}
          >
            <Text style={[styles.jerseyText, styles[`${size}JerseyText`]]}>{jerseyNumber}</Text>
          </LinearGradient>
        )}
      </Animated.View>
    );
  }

  // Glow effect avatar
  if (variant === 'glow') {
    return (
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <View style={[sizeStyles, styles.base, Shadows.primaryGlow]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: currentColors.primary }]}>
              <Text style={[styles.text, styles[`${size}Text`]]}>{getInitials(name)}</Text>
            </View>
          )}
        </View>

        {online && (
          <View style={[styles.onlineIndicator, styles[`${size}OnlineIndicator`]]}>
            <View style={styles.onlineDot} />
          </View>
        )}

        {showJerseyNumber && jerseyNumber && (
          <View style={[
            styles.jerseyBadge,
            styles[`${size}JerseyBadge`],
            { backgroundColor: currentColors.primary },
            Shadows.small,
          ]}>
            <Text style={[styles.jerseyText, styles[`${size}JerseyText`]]}>{jerseyNumber}</Text>
          </View>
        )}
      </Animated.View>
    );
  }

  // Default avatar
  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <View style={[sizeStyles, styles.base, { backgroundColor: currentColors.surface }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: currentColors.primary }]}>
            <Text style={[styles.text, styles[`${size}Text`]]}>{getInitials(name)}</Text>
          </View>
        )}
      </View>

      {online && (
        <View style={[styles.onlineIndicator, styles[`${size}OnlineIndicator`]]}>
          <View style={styles.onlineDot} />
        </View>
      )}

      {showJerseyNumber && jerseyNumber && (
        <View style={[
          styles.jerseyBadge,
          styles[`${size}JerseyBadge`],
          { backgroundColor: currentColors.headerBackground },
          Shadows.small,
        ]}>
          <Text style={[styles.jerseyText, styles[`${size}JerseyText`]]}>{jerseyNumber}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  base: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },

  // Gradient border styles
  gradientBorder: {
    borderRadius: BorderRadius.full,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gradientInner: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  // Sizes
  small: {
    width: 32,
    height: 32,
  },

  medium: {
    width: 48,
    height: 48,
  },

  large: {
    width: 64,
    height: 64,
  },

  xlarge: {
    width: 96,
    height: 96,
  },

  // Text sizes
  smallText: {
    fontSize: Typography.footnote,
  },

  mediumText: {
    fontSize: Typography.callout,
  },

  largeText: {
    fontSize: Typography.body,
  },

  xlargeText: {
    fontSize: Typography.title3,
  },

  // Online indicator
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallOnlineIndicator: {
    width: 10,
    height: 10,
    bottom: 0,
    right: 0,
  },

  mediumOnlineIndicator: {
    width: 12,
    height: 12,
    bottom: 2,
    right: 2,
  },

  largeOnlineIndicator: {
    width: 14,
    height: 14,
    bottom: 4,
    right: 4,
  },

  xlargeOnlineIndicator: {
    width: 18,
    height: 18,
    bottom: 6,
    right: 6,
  },

  onlineDot: {
    width: '50%',
    height: '50%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },

  // Jersey number badge
  jerseyBadge: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallJerseyBadge: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    bottom: -2,
    right: -2,
  },

  mediumJerseyBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    bottom: -4,
    right: -4,
  },

  largeJerseyBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    bottom: -4,
    right: -4,
  },

  xlargeJerseyBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    bottom: -6,
    right: -6,
  },

  jerseyText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },

  smallJerseyText: {
    fontSize: 8,
  },

  mediumJerseyText: {
    fontSize: Typography.caption,
  },

  largeJerseyText: {
    fontSize: Typography.footnote,
  },

  xlargeJerseyText: {
    fontSize: Typography.callout,
  },
});

// ✅ Add default export
export default PlayerAvatar;