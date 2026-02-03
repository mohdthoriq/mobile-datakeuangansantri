import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
  PokemonDetail: { pokemonId: number; pokemonName: string };
  NotFound: { error?: string };
  BiometricSetup: undefined;
  LocationSetup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  PokemonList: undefined;
  Favorites: undefined;
  Settings: undefined;
  BiometricSetup: undefined;
  LocationSetup: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
  BiometricSettings: undefined;
  LocationSettings: undefined;
};

export type MainStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonId: number; pokemonName: string };
  Favorites: undefined;
  Settings: undefined;
  BiometricSettings: undefined;
  LocationSettings: undefined;
};

export type PokemonDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PokemonDetail'
>;

export type PokemonDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'PokemonDetail'
>;