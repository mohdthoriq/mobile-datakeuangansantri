import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { Theme } from '../../styles/themes';
import { DrawerParamList } from '../../types/navigation';

type DrawerContentNavigationProp = DrawerNavigationProp<DrawerParamList>;

const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {

  const menuItems = [
    { label: 'Pokémon List', screen: 'MainTabs' },
    { label: 'Settings', screen: 'Settings' },
    { label: 'Biometric Settings', screen: 'BiometricSettings' },
    { label: 'Location Settings', screen: 'LocationSettings' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokedex App</Text>
        <Text style={styles.subtitle}>Gotta Catch 'Em All!</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as never)}
          >
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
    backgroundColor: Theme.colors.primary,
  },
  title: {
    fontSize: Theme.typography.size.xl,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.white,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.white,
    opacity: 0.8,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
  },
  menuItem: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  menuItemText: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.medium,
    color: Theme.colors.text.primary,
  },
  footer: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  footerText: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default DrawerContent;