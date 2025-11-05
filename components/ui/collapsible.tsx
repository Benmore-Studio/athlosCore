import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DarkColors, Spacing, BorderRadius, Shadows, Animation } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Collapsible({ 
  children, 
  title,
  defaultOpen = false,
  variant = 'default',
}: PropsWithChildren & { 
  title: string;
  defaultOpen?: boolean;
  variant?: 'default' | 'card' | 'bordered';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const currentColors = isDark ? DarkColors : Colors;
  
  const rotation = useSharedValue(defaultOpen ? 90 : 0);
  const height = useSharedValue(defaultOpen ? 1 : 0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Rotate chevron
    rotation.value = withSpring(newState ? 90 : 0, Animation.spring.smooth);
    
    // Expand/collapse content
    height.value = withSpring(newState ? 1 : 0, Animation.spring.smooth);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.snappy);
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    if (contentHeight === 0) {
      setContentHeight(measuredHeight);
    }
  };

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const animatedHeight = interpolate(
      height.value,
      [0, 1],
      [0, contentHeight],
      Extrapolation.CLAMP
    );

    return {
      height: animatedHeight,
      opacity: interpolate(
        height.value,
        [0, 0.5, 1],
        [0, 0.5, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const pressableAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = 
    variant === 'card' ? [styles.cardContainer, { backgroundColor: currentColors.cardBackground }, Shadows.small] :
    variant === 'bordered' ? [styles.borderedContainer, { borderColor: currentColors.border }] :
    styles.defaultContainer;

  return (
    <ThemedView style={containerStyle}>
      <AnimatedPressable
        style={[
          styles.heading,
          variant === 'card' && styles.cardHeading,
          variant === 'bordered' && styles.borderedHeading,
          pressableAnimatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={chevronAnimatedStyle}>
          <IconSymbol
            name="chevron.right"
            size={20}
            weight="semibold"
            color={currentColors.primary}
          />
        </Animated.View>

        <ThemedText 
          type="defaultSemiBold"
          style={[
            styles.title,
            variant !== 'default' && styles.titleSpaced,
          ]}
        >
          {title}
        </ThemedText>

        {/* Optional badge or indicator */}
        {isOpen && (
          <Animated.View 
            style={[
              styles.indicator,
              { backgroundColor: currentColors.primary },
            ]}
          />
        )}
      </AnimatedPressable>

      <Animated.View 
        style={[
          styles.contentWrapper,
          contentAnimatedStyle,
        ]}
      >
        <ThemedView 
          style={styles.content}
          onLayout={onContentLayout}
        >
          {children}
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Container variants
  defaultContainer: {
    overflow: 'hidden',
  },

  cardContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },

  borderedContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },

  // Heading styles
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },

  cardHeading: {
    padding: Spacing.md,
  },

  borderedHeading: {
    padding: Spacing.md,
  },

  title: {
    flex: 1,
  },

  titleSpaced: {
    marginLeft: Spacing.xs,
  },

  // Indicator
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Content wrapper
  contentWrapper: {
    overflow: 'hidden',
  },

  content: {
    paddingTop: Spacing.xs,
    paddingLeft: Spacing.xl + Spacing.sm,
    paddingRight: Spacing.md,
    paddingBottom: Spacing.md,
  },
});