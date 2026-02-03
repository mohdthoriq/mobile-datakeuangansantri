import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { enableScreens } from 'react-native-screens';
import BottomTabNavigator from './BottomTabNavigator';
import { DrawerParamList } from '../types/navigation';
import DrawerContent from '../components/layout/DrawerContent';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

enableScreens();

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Header dihilangkan
        drawerStyle: {
          width: 280,
        },
        drawerActiveTintColor: '#1E3A8A', // Biru
        drawerInactiveTintColor: '#333',
        drawerActiveBackgroundColor: 'rgba(30, 58, 138, 0.1)', // Biru transparan
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={BottomTabNavigator}
        options={{ 
          title: 'Pokémon',
          drawerIcon: ({ color, size }) => (
            <FontAwesome6 name="dragon" size={size} color={color} iconStyle='solid' />
          )
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;