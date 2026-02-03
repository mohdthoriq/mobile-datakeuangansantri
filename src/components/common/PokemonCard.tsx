import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Easing 
} from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PokemonListItem } from '../../types/pokemon';
import { Theme } from '../../styles/themes';
import { capitalizeFirst, formatNumber, getTypeColor } from '../../utils/helpers';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onPress: (pokemon: PokemonListItem) => void;
  pokemonId: number;
  types?: string[];
  isFavorite?: boolean;
  onToggleFavorite?: (pokemonId: number, isFavorite: boolean) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, 
  onPress, 
  pokemonId,
  types = [],
  isFavorite = false,
  onToggleFavorite
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const favoriteAnim = useRef(new Animated.Value(isFavorite ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  // Use the official artwork from PokeAPI
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  // Key untuk AsyncStorage
  const FAVORITES_KEY = 'pokemon_favorites';

  useEffect(() => {
    setLocalIsFavorite(isFavorite);
  }, [isFavorite]);

  useEffect(() => {
    // Subtle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Favorite animation
    Animated.spring(favoriteAnim, {
      toValue: localIsFavorite ? 1 : 0,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Pulse animation ketika ditambahkan ke wishlist
    if (localIsFavorite) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [localIsFavorite]);

  // Fungsi untuk menambah/menghapus favorit
  const toggleFavoriteStorage = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      const currentFavorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      let newFavorites: number[];

      if (localIsFavorite) {
        // Hapus dari favorit
        newFavorites = currentFavorites.filter((id: number) => id !== pokemonId);
        setLocalIsFavorite(false);
      } else {
        // Tambah ke favorit
        newFavorites = [...currentFavorites, pokemonId];
        setLocalIsFavorite(true);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      
      // Panggil callback jika ada
      if (onToggleFavorite) {
        onToggleFavorite(pokemonId, !localIsFavorite);
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePress = () => {
    // Press animation lebih smooth
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress(pokemon);
  };

  const handlePressIn = () => {
    // Efek lebih halus ketika ditekan
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Reset animasi lebih smooth
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFavoritePress = () => {
    toggleFavoriteStorage();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-3deg'], // Rotasi lebih kecil
  });

  const translateY = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3], // Floating effect lebih kecil
  });

  const favoriteScale = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15], // Scale lebih kecil
  });

  const favoriteOpacity = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const primaryType = types[0] || 'normal';
  const cardColor = getTypeColor(primaryType);

  // Fallback image if the official artwork doesn't exist
  const handleImageError = (e: any) => {
    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [
            { scale: scaleAnim },
            { rotate },
            { translateY }
          ]
        }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.card,
          { 
            backgroundColor: 'rgba(255, 215, 0, 0.15)', 
            borderColor: cardColor, 
            shadowColor: cardColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }
        ]} 
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Wishlist Heart Button - Lebih Kecil */}
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View style={[
            styles.heartContainer,
            { 
              transform: [
                { scale: favoriteScale },
                { scale: pulseScale }
              ],
              opacity: favoriteOpacity
            }
          ]}>
            <FontAwesome6 
              name="heart" 
              size={18} // Icon lebih kecil
              color={localIsFavorite ? '#FF4757' : '#FFFFFF'}
              iconStyle={localIsFavorite ? 'solid' : 'regular'}
            />
            
            {/* Glow effect untuk heart yang aktif */}
            {localIsFavorite && (
              <Animated.View style={[
                styles.heartGlow,
                { 
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }]
                }
              ]} />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Wishlist Indicator - Lebih Kecil */}
        {localIsFavorite && (
          <View style={styles.wishlistIndicator}>
            <Text style={styles.wishlistText}>❤️</Text>
          </View>
        )}

        {/* Image Container - Gambar lebih kecil */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={handleImageError}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.number}>{formatNumber(pokemonId)}</Text>
          <Text style={styles.name}>{capitalizeFirst(pokemon.name)}</Text>
          
          {types.length > 0 && (
            <View style={styles.typesContainer}>
              {types.map((type, index) => (
                <View
                  key={index}
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(type) },
                  ]}
                >
                  <FontAwesome6 
                    name="diamond" 
                    size={6} // Icon type lebih kecil
                    color={Theme.colors.white}
                    style={styles.typeIcon}
                    iconStyle='solid'
                  />
                  <Text style={styles.typeText}>{capitalizeFirst(type)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Card Glow Effect */}
        <Animated.View 
          style={[
            styles.cardGlow,
            { backgroundColor: cardColor, opacity: glowAnim }
          ]} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6, // Margin lebih kecil
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  card: {
    borderRadius: 16,
    padding: 12, // Padding lebih kecil
    borderWidth: 2, // Border lebih tipis
    borderStyle: 'solid',
    minHeight: 160, // Height lebih kecil
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  heartButton: {
    position: 'absolute',
    top: 8, // Position lebih ketat
    right: 8,
    zIndex: 10,
  },
  heartContainer: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16, // Border radius lebih kecil
    padding: 6, // Padding lebih kecil
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  heartGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: '#FF4757',
    borderRadius: 19,
    opacity: 0.2,
  },
  wishlistIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 71, 87, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#FF4757',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  wishlistText: {
    fontSize: 8, // Font lebih kecil
    fontWeight: '800',
    color: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // Margin lebih kecil
    position: 'relative',
    zIndex: 2,
  },
  image: {
    width: 80, // Gambar lebih kecil
    height: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  infoContainer: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  number: {
    fontSize: 10, // Font lebih kecil
    fontFamily: 'System',
    fontWeight: '800',
    color: '#8B7500',
    backgroundColor: 'rgba(255, 215, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  name: {
    fontSize: 14, // Font lebih kecil
    fontFamily: 'System',
    fontWeight: '900',
    color: '#4B3F00',
    marginBottom: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4, // Gap lebih kecil
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // Padding lebih kecil
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    minWidth: 60, // Lebar lebih kecil
    justifyContent: 'center',
  },
  typeIcon: {
    marginRight: 3, // Margin lebih kecil
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  typeText: {
    fontSize: 9, // Font lebih kecil
    fontFamily: 'System',
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 0.2,
  },
  cardGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 30,
    opacity: 0.08,
    zIndex: 1,
  },
});

export default PokemonCard;