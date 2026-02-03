import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PokemonList from '../screens/main/PokemonList';
import Favorites from '../screens/main/Favorites';
import { MainTabParamList } from '../types/navigation';
import BottomTabBar from '../components/layout/BottomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="PokemonList" 
        component={PokemonList}
        options={{ title: 'Pokémon' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={Favorites}
        options={{ title: 'Favorites' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;