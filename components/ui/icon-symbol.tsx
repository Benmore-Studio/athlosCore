// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Animation } from '@/constants/theme';

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  
  // Media controls
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  
  // Common icons
  'star.fill': 'star',
  'heart.fill': 'favorite',
  'bell.fill': 'notifications',
  'person.fill': 'person',
  'gear': 'settings',
  'magnifyingglass': 'search',
  'plus': 'add',
  'xmark': 'close',
  'checkmark': 'check',
  
  // Arrows
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'arrow.clockwise': 'refresh',
  'arrow.up.left.and.arrow.down.right': 'fullscreen',
  'arrow.down.right.and.arrow.up.left': 'fullscreen-exit',
  
  // Status
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'info.circle.fill': 'info',
  
  // Actions
  'trash.fill': 'delete',
  'pencil': 'edit',
  'square.and.arrow.up': 'share',
  'doc.on.doc': 'content-copy',
  
  // More icons
  'camera.fill': 'camera-alt',
  'video.fill': 'videocam',
  'mic.fill': 'mic',
  'location.fill': 'location-on',
  'calendar': 'event',
  'clock.fill': 'schedule',
  'flag.fill': 'flag',
  'bookmark.fill': 'bookmark',
  'folder.fill': 'folder',
  'photo.fill': 'photo',
} as IconMapping;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  animated?: boolean;
  animationType?: 'pulse' | 'bounce' | 'rotate' | 'shake' | 'none';
  badge?: number | boolean;
  badgeColor?: string;
}

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  animated = false,
  animationType = 'none',
  badge,
  badgeColor = '#EF4444',
}: IconSymbolProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;

    switch (animationType) {
      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.2, Animation.spring.gentle),
            withSpring(1, Animation.spring.gentle)
          ),
          -1,
          true
        );
        break;

      case 'bounce':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.15, Animation.spring.bouncy),
            withSpring(0.95, Animation.spring.bouncy),
            withSpring(1, Animation.spring.bouncy)
          ),
          -1,
          true
        );
        break;

      case 'rotate':
        rotation.value = withRepeat(
          withTiming(360, { duration: 2000 }),
          -1,
          false
        );
        break;

      case 'shake':
        rotation.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(0, { duration: 50 })
          ),
          -1,
          false
        );
        break;
    }
  }, [animated, animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = [];

    if (animationType === 'rotate' || animationType === 'shake') {
      transform.push({ rotate: `${rotation.value}deg` });
    }

    if (animationType === 'pulse' || animationType === 'bounce') {
      transform.push({ scale: scale.value });
    }

    return {
      transform,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[{ position: 'relative' }, animatedStyle]}>
      <AnimatedMaterialIcons 
        color={color} 
        size={size} 
        name={MAPPING[name]} 
        style={style} 
      />
      
      {badge !== undefined && badge !== false && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: typeof badge === 'number' ? 16 : 8,
            height: typeof badge === 'number' ? 16 : 8,
            borderRadius: typeof badge === 'number' ? 8 : 4,
            backgroundColor: badgeColor,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: typeof badge === 'number' ? 4 : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          {typeof badge === 'number' && (
            <Animated.Text
              style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '700',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </Animated.Text>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * Usage Examples:
 * 
 * // Basic icon
 * <IconSymbol name="star.fill" size={24} color="#E97A42" />
 * 
 * // Animated pulse (for notifications)
 * <IconSymbol 
 *   name="bell.fill" 
 *   size={24} 
 *   color="#E97A42"
 *   animated
 *   animationType="pulse"
 *   badge={5}
 * />
 * 
 * // Rotating loader
 * <IconSymbol 
 *   name="arrow.clockwise" 
 *   size={32} 
 *   color="#E97A42"
 *   animated
 *   animationType="rotate"
 * />
 * 
 * // Bouncing icon
 * <IconSymbol 
 *   name="heart.fill" 
 *   size={28} 
 *   color="#EF4444"
 *   animated
 *   animationType="bounce"
 * />
 * 
 * // Shaking alert
 * <IconSymbol 
 *   name="exclamationmark.triangle.fill" 
 *   size={24} 
 *   color="#F59E0B"
 *   animated
 *   animationType="shake"
 *   badge
 * />
 */