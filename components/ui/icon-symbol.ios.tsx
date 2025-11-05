import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';
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

const AnimatedSymbolView = Animated.createAnimatedComponent(SymbolView);

interface IconSymbolProps {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  animated?: boolean;
  animationType?: 'pulse' | 'bounce' | 'rotate' | 'shake' | 'none';
  badge?: number | boolean;
  badgeColor?: string;
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
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
      <AnimatedSymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={name}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
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