import { useState, useEffect, useCallback } from 'react';
import FavoritesStorageService from '../services/storage/favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const favoriteIds = await FavoritesStorageService.getFavorites();
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (pokemonId: number): Promise<boolean> => {
    try {
      const success = await FavoritesStorageService.addFavorite(pokemonId);
      if (success) {
        setFavorites(prev => [...prev, pokemonId]);
      }
      return success;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }, []);

  const removeFavorite = useCallback(async (pokemonId: number): Promise<boolean> => {
    try {
      const success = await FavoritesStorageService.removeFavorite(pokemonId);
      if (success) {
        setFavorites(prev => prev.filter(id => id !== pokemonId));
      }
      return success;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }, []);

  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (pokemonId: number): Promise<boolean> => {
    if (isFavorite(pokemonId)) {
      return await removeFavorite(pokemonId);
    } else {
      return await addFavorite(pokemonId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  const clearFavorites = useCallback(async (): Promise<boolean> => {
    try {
      const success = await FavoritesStorageService.clearFavorites();
      if (success) {
        setFavorites([]);
      }
      return success;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }, []);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    refreshFavorites: loadFavorites,
  };
};