import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../../styles/themes';
import { RootStackParamList } from '../../types/navigation';
import PokemonCard from '../../components/common/PokemonCard';
import { PokemonListItem } from '../../types/pokemon';
import PokemonHeader from '../../components/common/PokemonHeader';

// Definisikan tipe untuk respons API
interface ApiPokemonType {
  name: string;
  url: string;
}

interface TypeApiResponse {
  results: ApiPokemonType[];
}

interface PokemonFromTypeApi {
  pokemon: {
    name: string;
    url: string;
  };
}

interface PokemonApiResponse {
  pokemon: PokemonFromTypeApi[];
}

const Tab = createMaterialTopTabNavigator();
const { width: screenWidth } = Dimensions.get('window');

type PokemonListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PokemonDetail'>;

// Function to get icon name based on type
const getTypeIcon = (typeName: string): string => {
  const iconMap: { [key: string]: string } = {
    normal: 'circle',
    fire: 'fire',
    water: 'droplet',
    electric: 'bolt',
    grass: 'leaf',
    ice: 'snowflake',
    fighting: 'hand-fist',
    poison: 'skull',
    ground: 'mountain',
    flying: 'dove',
    psychic: 'brain',
    bug: 'bug',
    rock: 'gem',
    ghost: 'ghost',
    dragon: 'dragon',
    dark: 'moon',
    steel: 'shield',
    fairy: 'sparkles',
  };
  return iconMap[typeName] || 'circle';
};

// Function to get type color
const getTypeColor = (typeName: string): string => {
  const colorMap: { [key: string]: string } = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colorMap[typeName] || '#A8A878';
};

// Props interface untuk PokemonTypeScreen
interface PokemonTypeScreenProps {
  typeUrl: string;
  typeName: string;
  favorites: number[];
  onToggleFavorite: (pokemonId: number, isFavorite: boolean) => void;
}

// --- Komponen untuk menampilkan daftar Pokémon per tipe ---
const PokemonTypeScreen: React.FC<PokemonTypeScreenProps> = ({ 
  typeUrl, 
  typeName, 
  favorites, 
  onToggleFavorite 
}) => {
  const navigation = useNavigation<PokemonListScreenNavigationProp>();
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonByType = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(typeUrl);
        const data: PokemonApiResponse = await response.json();
        const pokemons: PokemonListItem[] = data.pokemon.map(p => {
          const urlParts = p.pokemon.url.split('/');
          const id = parseInt(urlParts[urlParts.length - 2], 10);
          return {
            id,
            name: p.pokemon.name,
            url: p.pokemon.url,
          };
        });
        setPokemonList(pokemons);
      } catch (error) {
        console.error("Failed to fetch pokemon by type:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonByType();
  }, [typeUrl]);

  const handlePokemonPress = useCallback((pokemon: PokemonListItem) => {
    if (pokemon.id) {
      navigation.navigate('PokemonDetail', { 
        pokemonId: pokemon.id, 
        pokemonName: pokemon.name 
      });
    }
  }, [navigation]);

  const handleToggleFavorite = useCallback((pokemonId: number, isFavorite: boolean) => {
    onToggleFavorite(pokemonId, isFavorite);
  }, [onToggleFavorite]);

  const renderItem = useCallback(({ item }: { item: PokemonListItem }) => (
    <PokemonCard
      pokemon={item}
      pokemonId={item.id || 1}
      types={[typeName]}
      onPress={handlePokemonPress}
      isFavorite={favorites.includes(item.id || 0)}
      onToggleFavorite={handleToggleFavorite}
    />
  ), [handlePokemonPress, typeName, favorites, handleToggleFavorite]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={getTypeColor(typeName)} />
        <Text style={[styles.loadingText, { color: getTypeColor(typeName) }]}>
          Loading {typeName} Pokémon...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={pokemonList}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || item.name).toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="dragon" size={60} color={getTypeColor(typeName)} iconStyle='solid' />
            <Text style={[styles.emptyText, { color: getTypeColor(typeName) }]}>
              No {typeName} Pokémon found
            </Text>
          </View>
        }
      />
    </View>
  );
}; 

// Komponen wrapper untuk menampilkan header dan tab navigator
const PokemonListWithHeader: React.FC = () => {
  const [types, setTypes] = useState<ApiPokemonType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Key untuk AsyncStorage
  const FAVORITES_KEY = 'pokemon_favorites';

  // Load favorites dari AsyncStorage saat komponen mount
  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);

  // Fungsi untuk memuat favorit dari AsyncStorage
  const loadFavoritesFromStorage = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Fungsi untuk handle toggle favorite
  const handleToggleFavorite = useCallback(async (pokemonId: number, isFavorite: boolean) => {
    try {
      let newFavorites: number[];

      if (isFavorite) {
        // Tambah ke favorit
        newFavorites = [...favorites, pokemonId];
      } else {
        // Hapus dari favorit
        newFavorites = favorites.filter(id => id !== pokemonId);
      }

      setFavorites(newFavorites);
      
      // Simpan ke AsyncStorage
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));

    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  useEffect(() => {
    const fetchPokemonTypes = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data: TypeApiResponse = await response.json();
        const relevantTypes = data.results.filter(type => type.name !== 'unknown' && type.name !== 'shadow');
        setTypes(relevantTypes);
      } catch (error) {
        console.error("Failed to fetch pokemon types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonTypes();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PokemonHeader />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading Pokémon Types...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PokemonHeader />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarItemStyle: { 
            width: 'auto',
            minWidth: 100,
            paddingHorizontal: 8,
          },
          tabBarStyle: {
            backgroundColor: '#1E3A8A',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#FFD700',
            height: 3,
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#f5f8ffff',
        }}
      >
        {types.map(type => (
          <Tab.Screen
            key={type.name}
            name={type.name}
            options={{
              tabBarLabel: ({ focused, color }) => {
                const iconName = getTypeIcon(type.name);
                const displayName = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                
                return (
                  <View style={styles.tabLabelContainer}>
                    {focused && (
                      <FontAwesome6 
                        name={iconName as any} 
                        size={16} 
                        color={color}
                        iconStyle='solid'
                        style={styles.tabIcon}
                      />
                    )}
                    <Text style={[styles.tabLabelText, { color }]}>
                      {displayName}
                    </Text>
                  </View>
                );
              },
            }}
          >
            {() => (
              <PokemonTypeScreen 
                typeUrl={type.url}
                typeName={type.name}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1E3A8A',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#F0F9FF',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Styling untuk tab label
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabelText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  // Favorites indicator
  favoritesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  favoritesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginLeft: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default PokemonListWithHeader;