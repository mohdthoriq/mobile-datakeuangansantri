import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Type untuk icon names yang tersedia di FontAwesome6
type FontAwesome6IconName = 
  | 'house'
  | 'magnifying-glass'
  | 'compass'
  | 'dragon'
  | 'heart'
  | 'user'
  | 'user-circle'
  | 'gear'
  | 'fingerprint'
  | 'shield-halved'
  | 'bell'
  | 'message'
  | 'circle';

const BottomTabBar: React.FC<BottomTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  // Gunakan useRef untuk menyimpan semua animations
  const animationsRef = useRef<{
    scale: Animated.Value[];
    iconScale: Animated.Value[];
  }>({
    scale: [],
    iconScale: [],
  });

  // Initialize animations sekali saja
  if (animationsRef.current.scale.length === 0) {
    for (let i = 0; i < state.routes.length; i++) {
      animationsRef.current.scale[i] = new Animated.Value(1);
      animationsRef.current.iconScale[i] = new Animated.Value(1);
    }
  }

  // Function to get icon name based on route name dengan type yang benar
  const getIconName = (routeName: string): FontAwesome6IconName => {
    const iconMap: { [key: string]: FontAwesome6IconName } = {
      'pokemonlist': 'dragon',
      'favorites': 'heart',
      'home': 'house',
      'explore': 'magnifying-glass',
      'discover': 'compass',
      'pokedex': 'dragon',
      'pokemon': 'dragon',
      'favourites': 'heart',
      'profile': 'user',
      'account': 'user-circle',
      'settings': 'gear',
      'biometric': 'fingerprint',
      'security': 'shield-halved',
      'notifications': 'bell',
      'messages': 'message',
    };
    
    return iconMap[routeName.toLowerCase()] || 'circle';
  };

  // Animasi untuk tab aktif
  useEffect(() => {
    state.routes.forEach((_, index) => {
      if (state.index === index) {
        // Icon scale animation sederhana
        Animated.spring(animationsRef.current.iconScale[index], {
          toValue: 1.2,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset animations untuk tab tidak aktif
        animationsRef.current.iconScale[index].setValue(1);
      }
    });
  }, [state.index]);

  const handlePressIn = (index: number) => {
    Animated.spring(animationsRef.current.scale[index], {
      toValue: 0.92,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(animationsRef.current.scale[index], {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Background dengan gradient biru */}
      <View style={styles.background} />
      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;
        const iconName = getIconName(route.name);
        const iconColor = isFocused ? '#FFD700' : '#93C5FD';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <Animated.View 
              style={[
                styles.tabContent,
                {
                  transform: [
                    { scale: animationsRef.current.scale[index] }
                  ]
                }
              ]}
            >
              {/* Icon Container */}
              <Animated.View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive,
                {
                  transform: [{ scale: animationsRef.current.iconScale[index] }]
                }
              ]}>
                <FontAwesome6 
                  name={iconName as any} 
                  size={18}
                  color={iconColor}
                  iconStyle='solid'
                />
              </Animated.View>
              
              {/* Label */}
              <Text style={[
                styles.tabText,
                isFocused && styles.tabTextFocused
              ]}>
                {label}
              </Text>

              {/* Active Indicator */}
              {isFocused && (
                <View style={styles.activeIndicator} />
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    paddingHorizontal: 8,
    paddingBottom: 4,
    paddingTop: 6,
    height: 65, // Height lebih kecil
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E3A8A',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 36, // Lebih kecil
    height: 36, // Lebih kecil
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 10, // Font lebih kecil
    fontWeight: '600',
    color: '#93C5FD',
    marginTop: 2,
    textAlign: 'center',
  },
  tabTextFocused: {
    color: '#FFD700',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default BottomTabBar;