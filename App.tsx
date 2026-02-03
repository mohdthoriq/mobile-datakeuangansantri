/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
          <StatusBar 
            backgroundColor='#3a6bbbff' 
            barStyle="light-content" 
            translucent={false}
          />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;