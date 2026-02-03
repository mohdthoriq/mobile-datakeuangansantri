import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PokemonDetail from '../screens/main/PokemonDetail';
import NotFound from '../screens/main/NotFound';
import { RootStackParamList } from '../types/navigation';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Main"
    >
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFound}
        options={{ title: 'Not Found' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;