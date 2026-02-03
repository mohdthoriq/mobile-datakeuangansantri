import { useState, useEffect, useCallback } from 'react';
import { Pokemon, PokemonListItem } from '../types/pokemon';
import PokeApiService from '../services/api/pokeapi';

export const usePokemon = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPokemonList = useCallback(async (loadMore: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentOffset = loadMore ? offset : 0;
      const response = await PokeApiService.getPokemonList(20, currentOffset);

      if (loadMore) {
        setPokemonList(prev => [...prev, ...response.results]);
      } else {
        setPokemonList(response.results);
      }

      setOffset(currentOffset + 20);
      setHasMore(!!response.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon list');
    } finally {
      setIsLoading(false);
    }
  }, [offset]);
  
  const fetchPokemonDetail = useCallback(async (idOrName: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      const pokemon = await PokeApiService.getPokemonDetail(idOrName);
      setSelectedPokemon(pokemon);
      return pokemon;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon detail');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshList = useCallback(() => {
    setOffset(0);
    fetchPokemonList(false);
  }, [fetchPokemonList]);

  useEffect(() => {
    fetchPokemonList(false);
  }, []);

  return {
    pokemonList,
    selectedPokemon,
    isLoading,
    error,
    hasMore,
    fetchPokemonList: () => fetchPokemonList(true),
    fetchPokemonDetail,
    clearError,
    refreshList,
  };
};