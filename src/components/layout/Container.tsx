import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewProps } from 'react-native';
import { Theme } from '../../styles/themes';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  safeArea?: boolean;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  safeArea = true, 
  style, 
  ...props 
}) => {
  const ContainerComponent = safeArea ? SafeAreaView : View;

  return (
    <ContainerComponent 
      style={[styles.container, style]} 
      {...props}
    >
      {children}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});

export default Container;