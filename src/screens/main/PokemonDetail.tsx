import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import Container from '../../components/layout/Container';
import Loading from '../../components/common/Loading';
import ErrorScreen from '../../components/common/ErrorScreen';
import Button from '../../components/common/Button';
import { Theme } from '../../styles/themes';
import { usePokemon } from '../../hooks/usePokemon';
import { useFavorites } from '../../hooks/useFavorites';
import { RootStackParamList } from '../../types/navigation';
import { capitalizeFirst, formatNumber, formatHeight, formatWeight, getTypeColor } from '../../utils/helpers';

type PokemonDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PokemonDetail'>;
type PokemonDetailScreenRouteProp = RouteProp<RootStackParamList, 'PokemonDetail'>;

const PokemonDetail: React.FC = () => {
  const navigation = useNavigation<PokemonDetailScreenNavigationProp>();
  const route = useRoute<PokemonDetailScreenRouteProp>();
  const { pokemonId, pokemonName } = route.params;
  
  const { fetchPokemonDetail, selectedPokemon, isLoading, error } = usePokemon();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [favorite, setFavorite] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isConnectionLoading, setIsConnectionLoading] = useState(true);
  const spinValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  // NetInfo setup
  useEffect(() => {
    // Check initial network state
    const checkInitialConnection = async () => {
      const netInfoState = await NetInfo.fetch();
      setIsConnected(netInfoState.isConnected);
      setIsConnectionLoading(false);
    };

    checkInitialConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isConnected && !isConnectionLoading) {
      loadPokemonDetail();
      checkFavoriteStatus();
    }
  }, [pokemonId, isConnected, isConnectionLoading]);

  useEffect(() => {
    if (selectedPokemon) {
      startAnimations();
    }
  }, [selectedPokemon]);

  const startAnimations = () => {
    // Spin animation for pokeball
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getImageUrl = () => {
    if (!selectedPokemon) return '';
    
    // Prefer official artwork, fallback to default sprite
    return selectedPokemon.sprites.other['official-artwork'].front_default ||
           selectedPokemon.sprites.front_default ||
           `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadPokemonDetail = async () => {
    if (!isConnected) return;
    await fetchPokemonDetail(pokemonId);
  };

  const checkFavoriteStatus = async () => {
    if (!isConnected) return;
    const favoriteStatus = await isFavorite(pokemonId);
    setFavorite(favoriteStatus);
  };

  const handleToggleFavorite = async () => {
    if (!isConnected) {
      // Show offline message
      return;
    }
    const success = await toggleFavorite(pokemonId);
    if (success) {
      setFavorite(!favorite);
    }
  };

  const handleRetry = () => {
    if (isConnected) {
      loadPokemonDetail();
    }
  };

  const handleCheckConnection = async () => {
    setIsConnectionLoading(true);
    const netInfoState = await NetInfo.fetch();
    setIsConnected(netInfoState.isConnected);
    setIsConnectionLoading(false);
    
    if (netInfoState.isConnected) {
      loadPokemonDetail();
    }
  };

  // Show connection loading
  if (isConnectionLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Checking connection...</Text>
        </View>
      </Container>
    );
  }

  // Show offline state
  if (!isConnected) {
    return (
      <Container>
        <View style={styles.offlineContainer}>
          <View style={styles.offlineContent}>
            <Text style={styles.offlineIcon}>📶</Text>
            <Text style={styles.offlineTitle}>No Internet Connection</Text>
            <Text style={styles.offlineMessage}>
              Please check your internet connection and try again.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleCheckConnection}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    );
  }

  if (isLoading && !selectedPokemon) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Animated.Image
            style={[styles.loadingIcon, { transform: [{ rotate: spin }] }]}
          />
          <Text style={styles.loadingText}>Loading {capitalizeFirst(pokemonName)}...</Text>
        </View>
      </Container>
    );
  }

  if (error && !selectedPokemon) {
    return (
      <Container>
        <ErrorScreen
          title="Pokémon Not Found"
          message={error}
          onRetry={handleRetry}
          retryButtonText="Try Again"
        />
      </Container>
    );
  }

  if (!selectedPokemon) {
    return null;
  }

  const primaryType = selectedPokemon.types[0]?.type.name || 'normal';
  const primaryColor = getTypeColor(primaryType);

  return (
    <Container>
      {/* Connection Status Banner */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Text style={styles.connectionBannerText}>
            📶 You are currently offline
          </Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header Section */}
          <View style={[styles.header, { backgroundColor: primaryColor }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.number}>
                  {formatNumber(selectedPokemon.id)}
                </Text>
                <Text style={styles.name}>
                  {capitalizeFirst(selectedPokemon.name)}
                </Text>
                <View style={styles.typesContainer}>
                  {selectedPokemon.types.map((typeInfo, index) => (
                    <View
                      key={index}
                      style={[
                        styles.typeBadge,
                        { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                      ]}
                    >
                      <Text style={styles.typeText}>
                        {capitalizeFirst(typeInfo.type.name)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.favoriteButton,
                  !isConnected && styles.favoriteButtonDisabled
                ]}
                onPress={handleToggleFavorite}
                disabled={!isConnected}
              >
                <Animated.Image
                  style={[styles.favoriteIcon, { transform: [{ rotate: spin }] }]}
                />
                {!isConnected && (
                  <View style={styles.offlineOverlay} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl() }}
              style={styles.image}
              resizeMode="contain"
            />
            {!isConnected && (
              <View style={styles.offlineImageOverlay}>
                <Text style={styles.offlineImageText}>Offline</Text>
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Base Stats</Text>
            <View style={styles.statsContainer}>
              {selectedPokemon.stats.map((stat, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.statName}>
                    {capitalizeFirst(stat.stat.name.replace('-', ' '))}
                  </Text>
                  <View style={styles.statBarContainer}>
                    <View
                      style={[
                        styles.statBar,
                        {
                          width: `${(stat.base_stat / 255) * 100}%`,
                          backgroundColor: primaryColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.base_stat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>
                  {formatHeight(selectedPokemon.height)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>
                  {formatWeight(selectedPokemon.weight)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Base Exp</Text>
                <Text style={styles.infoValue}>
                  {selectedPokemon.base_experience}
                </Text>
              </View>
            </View>
          </View>

          {/* Abilities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abilities</Text>
            <View style={styles.abilitiesContainer}>
              {selectedPokemon.abilities.map((ability, index) => (
                <View
                  key={index}
                  style={[
                    styles.abilityBadge,
                    { backgroundColor: primaryColor },
                  ]}
                >
                  <Text style={styles.abilityText}>
                    {capitalizeFirst(ability.ability.name.replace('-', ' '))}
                    {ability.is_hidden && ' (Hidden)'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Offline Warning */}
          {!isConnected && (
            <View style={styles.offlineWarning}>
              <Text style={styles.offlineWarningText}>
                Some features may be limited while offline
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F9FF',
  },
  loadingIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1E3A8A',
  },
  // Offline Styles
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F9FF',
  },
  offlineContent: {
    alignItems: 'center',
    padding: 24,
  },
  offlineIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  offlineMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionBanner: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    alignItems: 'center',
  },
  connectionBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  offlineImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  offlineImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offlineWarning: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  offlineWarningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Existing styles remain the same...
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  favoriteIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: -80,
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  section: {
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    width: 100,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
    width: 30,
    textAlign: 'right',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  abilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  abilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PokemonDetail;