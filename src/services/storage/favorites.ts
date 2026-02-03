import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constans';

class FavoritesStorageService {
  private key = STORAGE_KEYS.FAVORITES;

  async getFavorites(): Promise<number[]> {
    try {
      const favorites = await AsyncStorage.getItem(this.key);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async addFavorite(pokemonId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(pokemonId)) {
        favorites.push(pokemonId);
        await AsyncStorage.setItem(this.key, JSON.stringify(favorites));
      }
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  async removeFavorite(pokemonId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== pokemonId);
      await AsyncStorage.setItem(this.key, JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  async isFavorite(pokemonId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(pokemonId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  async clearFavorites(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }
}

export default new FavoritesStorageService();