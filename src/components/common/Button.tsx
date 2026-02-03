import React, { useRef, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
  View
} from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { Theme } from '../../styles/themes';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!disabled && !loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [disabled, loading]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = styles.base;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    const disabledStyle = disabled ? styles.disabled : {};
    
    return [baseStyle, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    const baseTextStyle = styles.baseText;
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];
    const disabledTextStyle = disabled ? styles.disabledText : {};
    
    return [baseTextStyle, variantTextStyle, sizeTextStyle, disabledTextStyle, textStyle];
  };

  const getIconColor = () => {
    if (disabled) return Theme.colors.gray[600];
    return variant === 'outline' ? Theme.colors.primary : Theme.colors.white;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 18;
      default: return 16;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <FontAwesome6 
        name={icon as any} 
        size={getIconSize()} 
        color={getIconColor()}
        style={[
          styles.icon,
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight
        ]}
      />
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {/* Glow Effect */}
        {!disabled && !loading && (
          <Animated.View 
            style={[
              styles.glowEffect,
              { opacity: glowOpacity }
            ]} 
          />
        )}
        
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? Theme.colors.primary : Theme.colors.white} 
          />
        ) : (
          <View style={styles.content}>
            {iconPosition === 'left' && renderIcon()}
            <Text style={getTextStyle()}>{title}</Text>
            {iconPosition === 'right' && renderIcon()}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    ...Theme.shadows.medium,
  },
  baseText: {
    fontFamily: Theme.typography.family.bold,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  
  // Variants dengan efek game-like
  primary: {
    backgroundColor: Theme.colors.primary,
    borderColor: '#FF6B6B',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryText: {
    color: Theme.colors.white,
  },
  
  secondary: {
    backgroundColor: Theme.colors.secondary,
    borderColor: '#4A7FC8',
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryText: {
    color: Theme.colors.white,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: Theme.colors.primary,
    borderWidth: 3,
  },
  outlineText: {
    color: Theme.colors.primary,
  },
  
  danger: {
    backgroundColor: '#FF4757',
    borderColor: '#FF6B7E',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dangerText: {
    color: Theme.colors.white,
  },

  success: {
    backgroundColor: '#2ED573',
    borderColor: '#51E88A',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successText: {
    color: Theme.colors.white,
  },
  
  // Sizes
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  smallText: {
    fontSize: Theme.typography.size.sm,
  },
  
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 50,
  },
  mediumText: {
    fontSize: Theme.typography.size.md,
  },
  
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 60,
  },
  largeText: {
    fontSize: Theme.typography.size.lg,
  },
  
  // States
  disabled: {
    backgroundColor: Theme.colors.gray[400],
    borderColor: Theme.colors.gray[500],
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Theme.colors.gray[600],
    textShadowColor: 'transparent',
  },
});

export default Button;