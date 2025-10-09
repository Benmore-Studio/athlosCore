import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

interface PlayerAvatarProps {
  imageUri?: string;
  name: string;
  jerseyNumber?: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showJerseyNumber?: boolean;
}

export default function PlayerAvatar({
  imageUri,
  name,
  jerseyNumber,
  size = 'medium',
  style,
  showJerseyNumber = true,
}: PlayerAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarStyle = [
    styles.base,
    styles[size],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
  ];

  return (
    <View style={styles.container}>
      <View style={avatarStyle}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, avatarStyle]}>
            <Text style={textStyle}>{getInitials(name)}</Text>
          </View>
        )}
      </View>
      {showJerseyNumber && jerseyNumber && (
        <View style={styles.jerseyBadge}>
          <Text style={styles.jerseyText}>{jerseyNumber}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  base: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },

  placeholder: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
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

  // Jersey number badge
  jerseyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.headerBackground,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  jerseyText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.caption,
    fontWeight: '700',
  },
});