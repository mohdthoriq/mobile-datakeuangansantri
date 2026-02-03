import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Container from '../../components/layout/Container';
import PokemonCard from '../../components/common/PokemonCard';
import Loading from '../../components/common/Loading';
import ErrorScreen from '../../components/common/ErrorScreen';
import Button from '../../components/common/Button';
import { Theme } from '../../styles/themes';
import { PokemonListItem } from '../../types/pokemon';
import { RootStackParamList } from '../../types/navigation';
import { getTypeColor } from '../../utils/helpers';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Key untuk AsyncStorage
const FAVORITES_KEY = 'pokemon_favorites';

// Tipe untuk data yang dikelompokkan per type
interface GroupedPokemon {
  type: string;
  data: any[];
  color: string;
}

// Tipe untuk item dalam flat list
interface FlatListItem {
  type: 'header' | 'pokemon';
  data: any;
  section?: {
    title: string;
    color: string;
    count: number;
  };
}

// Tipe untuk hasil fetch Pokémon
interface PokemonFetchResult {
  id: number;
  data?: any;
  error?: any;
}

// Custom hook untuk favorites
const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites dari AsyncStorage
  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (pokemonId: number) => {
    try {
      const newFavorites = favorites.includes(pokemonId)
        ? favorites.filter(id => id !== pokemonId)
        : [...favorites, pokemonId];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(async () => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem(FAVORITES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }, []);

  // Check if a Pokémon is favorite
  const isFavorite = useCallback((pokemonId: number) => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    clearFavorites,
    isFavorite,
    refreshFavorites,
    loadFavorites,
  };
};

// Komponen untuk menangani pengambilan data per kartu
const FavoritePokemonCard = memo(({ 
  pokemon, 
  onToggleFavorite,
  isOnline 
}: { 
  pokemon: any;
  onToggleFavorite: (pokemonId: number, isFavorite: boolean) => Promise<boolean>;
  isOnline: boolean;
}) => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();

  const handlePress = useCallback(() => {
    if (pokemon) {
      navigation.navigate('PokemonDetail', {
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
      });
    }
  }, [navigation, pokemon]);

  const handleToggleFavorite = useCallback(async () => {
    // Jika offline, tampilkan pesan error
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot modify wishlist while offline. Please check your internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    const success = await onToggleFavorite(pokemon.id, true);
    if (success === false) {
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  }, [pokemon.id, onToggleFavorite, isOnline]);

  const listItem: PokemonListItem = {
    name: pokemon.name,
    url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
    id: pokemon.id,
  };

  return (
    <View style={styles.cardContainer}>
      <PokemonCard
        pokemon={listItem}
        pokemonId={pokemon.id}
        types={pokemon.types.map((t: any) => t.type.name)}
        onPress={handlePress}
        isFavorite={true}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
});

// Komponen untuk section header
const SectionHeader = memo(({ title, color, count }: { title: string; color: string; count: number }) => {
  return (
    <View style={[styles.sectionHeader, { backgroundColor: color }]}>
      <View style={styles.sectionHeaderContent}>
        <Text style={styles.sectionHeaderText}>
          {title.toUpperCase()}
        </Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{count}</Text>
        </View>
      </View>
    </View>
  );
});

const Favorites: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const isFocused = useIsFocused();
  
  const { 
    favorites, 
    isLoading: favoritesLoading, 
    clearFavorites, 
    toggleFavorite,
    refreshFavorites 
  } = useFavorites();
  
  const [bounceValue] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pokemonDetails, setPokemonDetails] = useState<{ [key: number]: any }>({});
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Monitor koneksi internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Load favorites dan details ketika screen focus
  useEffect(() => {
    if (isFocused) {
      refreshFavorites().catch(err => {
        setError('Failed to load favorites');
      });
    }
  }, [isFocused, refreshFavorites]);

  // Load details untuk semua favorites
  useEffect(() => {
    if (favorites.length > 0 && isOnline) {
      loadPokemonDetails();
    }
  }, [favorites, isOnline]);

  const loadPokemonDetails = async () => {
    if (!isOnline) return;

    setLoadingDetails(true);
    try {
      const details: { [key: number]: any } = {};
      
      // Load details untuk setiap Pokémon yang belum dimuat
      const pokemonToLoad = favorites.filter(id => !pokemonDetails[id]);
      
      if (pokemonToLoad.length === 0) {
        setLoadingDetails(false);
        return;
      }

      // Load details secara paralel dengan batasan
      const batchSize = 10;
      for (let i = 0; i < pokemonToLoad.length; i += batchSize) {
        const batch = pokemonToLoad.slice(i, i + batchSize);
        const promises = batch.map(async (id): Promise<PokemonFetchResult> => {
          try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            return { id, data };
          } catch (error) {
            return { id, error };
          }
        });

        const results = await Promise.all(promises);
        
        results.forEach(result => {
          // Perbaikan: Gunakan type guard untuk memeriksa apakah ada error
          if ('data' in result && result.data) {
            details[result.id] = result.data;
          }
        });

        // Update state secara bertahap untuk menghindari blocking
        setPokemonDetails(prev => ({ ...prev, ...details }));
        
        // Delay kecil antara batch untuk menghindari rate limiting
        if (i + batchSize < pokemonToLoad.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error loading Pokémon details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Kelompokkan Pokémon berdasarkan type
  const groupedPokemon: GroupedPokemon[] = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    Object.values(pokemonDetails).forEach(pokemon => {
      if (pokemon && pokemon.types) {
        pokemon.types.forEach((typeInfo: any) => {
          const typeName = typeInfo.type.name;
          if (!groups[typeName]) {
            groups[typeName] = [];
          }
          groups[typeName].push(pokemon);
        });
      }
    });

    // Konversi ke array dan urutkan berdasarkan nama type
    return Object.entries(groups)
      .map(([type, data]) => ({
        type,
        data: data.sort((a, b) => a.id - b.id), // Urutkan berdasarkan ID
        color: getTypeColor(type)
      }))
      .sort((a, b) => a.type.localeCompare(b.type)); // Urutkan berdasarkan nama type
  }, [pokemonDetails]);

  // Format data untuk FlatList dengan header dan Pokémon
  const flatListData: FlatListItem[] = React.useMemo(() => {
    const data: FlatListItem[] = [];
    
    groupedPokemon.forEach(group => {
      // Tambahkan header
      data.push({
        type: 'header',
        data: group,
        section: {
          title: group.type,
          color: group.color,
          count: group.data.length
        }
      });
      
      // Tambahkan Pokémon dalam grid (2 kolom)
      const pokemonPairs = [];
      for (let i = 0; i < group.data.length; i += 2) {
        pokemonPairs.push(group.data.slice(i, i + 2));
      }
      
      pokemonPairs.forEach(pair => {
        data.push({
          type: 'pokemon',
          data: pair
        });
      });
    });
    
    return data;
  }, [groupedPokemon]);

  useEffect(() => {
    if (isFocused && favorites.length > 0) {
      startBounceAnimation();
      startFadeAnimation();
    }
  }, [isFocused, favorites.length]);

  const startBounceAnimation = () => {
    bounceValue.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const handleClearFavorites = () => {
    // Cek koneksi internet
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot clear wishlist while offline. Please check your internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Clear All Wishlist',
      'Are you sure you want to remove all Pokémon from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearFavorites();
              setPokemonDetails({});
              setError(null);
            } catch (err) {
              setError('Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    // Cek koneksi internet
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot refresh while offline. Please check your internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    setRefreshing(true);
    try {
      await refreshFavorites();
      setError(null);
    } catch (err) {
      setError('Failed to refresh wishlist');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot retry while offline. Please check your internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }
    handleRefresh();
  };

  const handleToggleFavorite = useCallback(async (pokemonId: number, isFavorite: boolean): Promise<boolean> => {
    // Cek koneksi internet
    if (!isOnline) {
      return false;
    }
    const success = await toggleFavorite(pokemonId);
    if (success) {
      // Hapus dari pokemonDetails jika berhasil dihapus
      setPokemonDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[pokemonId];
        return newDetails;
      });
    }
    return success;
  }, [toggleFavorite, isOnline]);

  // Navigate to PokemonList
  const handleExplorePokemon = () => {
    navigation.navigate('Main', { 
      screen: 'PokemonList' 
    } as any);
  };

  // Render item untuk FlatList
  const renderItem = useCallback(({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return (
        <SectionHeader 
          title={item.section!.title} 
          color={item.section!.color}
          count={item.section!.count}
        />
      );
    } else {
      return (
        <View style={styles.pokemonRow}>
          {item.data.map((pokemon: any, index: number) => (
            <View 
              key={pokemon.id} 
              style={[
                styles.pokemonCardWrapper,
                index === 0 && styles.firstCard,
                index === 1 && styles.secondCard
              ]}
            >
              <FavoritePokemonCard 
                pokemon={pokemon} 
                onToggleFavorite={handleToggleFavorite}
                isOnline={isOnline}
              />
            </View>
          ))}
          {/* Jika jumlah ganjil, tambahkan placeholder */}
          {item.data.length === 1 && (
            <View style={styles.placeholderCard} />
          )}
        </View>
      );
    }
  }, [handleToggleFavorite, isOnline]);

  // Loading state
  if (favoritesLoading && favorites.length === 0) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Loading text="Loading your wishlist..." type="spinner" />
          {!isOnline && (
            <Text style={styles.offlineText}>
              Offline Mode - Loading cached data
            </Text>
          )}
        </View>
      </Container>
    );
  }

  // Error state
  if (error && favorites.length === 0) {
    return (
      <Container>
        <ErrorScreen
          title={isOnline ? "Error Loading Wishlist" : "Offline Mode"}
          message={isOnline ? error : "You are currently offline. Some features may be limited."}
          onRetry={isOnline ? handleRetry : undefined}
          retryButtonText="Try Again"
          icon={isOnline ? "heart-crack" : "wifi"}
        />
      </Container>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <Container>
        <Animated.View 
          style={[
            styles.emptyContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View style={{ transform: [{ translateY: bounce }] }}>
            <FontAwesome6 
              name={isOnline ? "heart-crack" : "wifi"} 
              size={80} 
              color="#94A3B8" 
              iconStyle='solid' 
            />
          </Animated.View>
          <Text style={styles.emptyTitle}>
            {isOnline ? "Your Wishlist is Empty" : "Offline Mode"}
          </Text>
          <Text style={styles.emptyMessage}>
            {isOnline 
              ? "Start building your Pokémon collection! Tap the heart icon on any Pokémon to add it to your wishlist."
              : "You are currently offline. Wishlist modifications are disabled until you reconnect to the internet."
            }
          </Text>
          {isOnline && (
            <Button
              title="Explore Pokémon"
              onPress={handleExplorePokemon}
              variant="primary"
              style={styles.exploreButton}
              icon="dragon"
              iconPosition="left"
            />
          )}
        </Animated.View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <FontAwesome6 name="wifi" size={16} color="#FFFFFF" iconStyle='solid' />
          <Text style={styles.offlineBannerText}>
            Offline Mode - Read only
          </Text>
        </View>
      )}

      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            backgroundColor: isOnline ? '#1E3A8A' : '#6B7280'
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <FontAwesome6 
              name={isOnline ? "heart" : "heart-circle-exclamation"} 
              size={32} 
              color="#FFFFFF" 
              iconStyle='solid' 
            />
            <Text style={styles.title}>My Wishlist</Text>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>OFFLINE</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {favorites.length} {favorites.length === 1 ? 'Pokémon' : 'Pokémon'} in your collection
            {!isOnline && ' (Offline)'}
          </Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[
                styles.clearButton,
                !isOnline && styles.disabledButton
              ]}
              onPress={handleClearFavorites}
              disabled={!isOnline}
            >
              <FontAwesome6 
                name="trash" 
                size={16} 
                color={isOnline ? "#FFFFFF" : "#9CA3AF"} 
                iconStyle='solid' 
              />
              <Text style={[
                styles.clearButtonText,
                !isOnline && styles.disabledButtonText
              ]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Loading indicator untuk details */}
      {(loadingDetails && isOnline) && (
        <View style={styles.detailsLoading}>
          <ActivityIndicator size="small" color="#1E3A8A" />
          <Text style={styles.detailsLoadingText}>Loading Pokémon details...</Text>
        </View>
      )}

      <FlatList
        data={flatListData}
        keyExtractor={(item, index) => {
          if (item.type === 'header') {
            return `header-${item.section!.title}-${index}`;
          } else {
            return `pokemon-${item.data.map((p: any) => p.id).join('-')}-${index}`;
          }
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            enabled={isOnline}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              {isOnline ? "Loading Pokémon details..." : "No Pokémon details available offline"}
            </Text>
          </View>
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  exploreButton: {
    minWidth: 200,
    backgroundColor: '#1E3A8A',
    borderColor: '#FFD700',
  },
  header: {
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#FFD700',
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#9CA3AF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  // Section Header Styles
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Pokemon Grid Styles
  cardContainer: {
    flex: 1,
  },
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pokemonCardWrapper: {
    flex: 1,
  },
  firstCard: {
    marginRight: 8,
  },
  secondCard: {
    marginLeft: 8,
  },
  placeholderCard: {
    flex: 1,
    marginLeft: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyListText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  // Offline styles
  offlineBanner: {
    backgroundColor: '#EF4444',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  offlineBadge: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  offlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  offlineText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Details loading
  detailsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  detailsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});

export default Favorites;