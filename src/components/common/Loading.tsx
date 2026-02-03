import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { Theme } from '../../styles/themes';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  type?: 'pokeball' | 'pulse' | 'dots' | 'spinner';
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'large', 
  text, 
  type = 'spinner' 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'spinner') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else if (type === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (type === 'dots') {
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
              delay,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      };

      createDotAnimation(dotAnim1, 0).start();
      createDotAnimation(dotAnim2, 200).start();
      createDotAnimation(dotAnim3, 400).start();
    }
  }, [type]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const dotScale1 = dotAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const dotScale2 = dotAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const dotScale3 = dotAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const renderSpinnerLoader = () => (
    <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate }] }]}>
      <FontAwesome6 name="spinner" size={getIconSize()} color={Theme.colors.primary} iconStyle='solid'/>
    </Animated.View>
  );

  const renderPulseLoader = () => (
    <Animated.View style={[
      styles.pulseContainer, 
      { 
        transform: [{ scale: pulseScale }],
        opacity: pulseOpacity
      }
    ]}>
      <FontAwesome6 name="bolt" size={getIconSize()} color={Theme.colors.types.electric}iconStyle='solid' />
    </Animated.View>
  );

  const renderDotsLoader = () => (
    <View style={styles.dotsContainer}>
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: Theme.colors.primary, transform: [{ scale: dotScale1 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: Theme.colors.secondary, transform: [{ scale: dotScale2 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: Theme.colors.types.electric, transform: [{ scale: dotScale3 }] }
        ]} 
      />
    </View>
  );

  const getIconSize = () => {
    return size === 'large' ? 48 : 32;
  };

  const getLoader = () => {
    switch (type) {
      case 'spinner':
        return renderSpinnerLoader();
      case 'pulse':
        return renderPulseLoader();
      case 'dots':
        return renderDotsLoader();
      default:
        return renderSpinnerLoader();
    }
  };

  return (
    <View style={[
      styles.container,
      size === 'small' && styles.containerSmall
    ]}>
      {getLoader()}
      {text && (
        <Text style={[
          styles.text,
          size === 'small' && styles.textSmall
        ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: 'transparent',
  },
  containerSmall: {
    padding: Theme.spacing.md,
  },
  text: {
    marginTop: Theme.spacing.lg,
    fontSize: Theme.typography.size.lg,
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.family.medium,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: Theme.typography.size.md,
    marginTop: Theme.spacing.md,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 40,
    padding: Theme.spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    ...Theme.shadows.small,
  },
});

export default Loading;