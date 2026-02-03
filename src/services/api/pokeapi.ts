import { Pokemon, PokemonListResponse, PokemonListItem } from '../../types/pokemon';
import { API_BASE_URL } from '../../utils/constans';

class PokeApiService {
  private baseUrl: string = API_BASE_URL;

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the results to include id
      const processedResults = data.results.map((item: PokemonListItem, index: number) => ({
        ...item,
        id: offset + index + 1
      }));

      return {
        ...data,
        results: processedResults
      };
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw error;
    }
  }

  async getPokemonDetail(idOrName: string | number): Promise<Pokemon> {
    try {
      const response = await fetch(`${this.baseUrl}/pokemon/${idOrName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformPokemonData(data);
    } catch (error) {
      console.error('Error fetching Pokemon detail:', error);
      throw error;
    }
  }

  private transformPokemonData(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
      types: data.types,
      stats: data.stats,
      abilities: data.abilities,
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      sprites: {
        front_default: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
        back_default: data.sprites.back_default,
        back_shiny: data.sprites.back_shiny,
        other: {
          'official-artwork': {
            front_default: data.sprites.other['official-artwork'].front_default
          }
        }
      }
    };
  }

  async getPokemonBatch(ids: number[]): Promise<Pokemon[]> {
    try {
      const promises = ids.map(id => this.getPokemonDetail(id));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching Pokemon batch:', error);
      throw error;
    }
  }
}

export default new PokeApiService();