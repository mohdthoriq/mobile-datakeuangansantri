import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import { Theme } from '../../styles/themes';
import { RootStackParamList } from '../../types/navigation';

type NotFoundScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NotFound: React.FC = () => {
  const navigation = useNavigation<NotFoundScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as { error?: string };

  const error = params?.error || 'The page you are looking for does not exist.';
  
  const bounceValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const handleGoHome = () => {
    navigation.navigate('Main');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.Text
          style={[
            styles.errorCode,
            { transform: [{ translateY: bounce }] }
          ]}
        >
          404
        </Animated.Text>
        
        <Text style={styles.title}>Page Not Found</Text>
        
        <Text style={styles.message}>
          {error}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Go Home"
            onPress={handleGoHome}
            variant="primary"
            size="large"
            style={styles.button}
          />
          
          <Button
            title="Go Back"
            onPress={handleGoBack}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>

        <Animated.Image
          style={[
            styles.pokemonImage,
            { transform: [{ translateY: bounce }] }
          ]}
        />
      </Animated.View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorCode: {
    fontSize: 120,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.size.xxxl,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
    lineHeight: Theme.typography.lineHeight.md,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: Theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  pokemonImage: {
    width: 200,
    height: 200,
    marginTop: Theme.spacing.xxl,
    opacity: 0.7,
  },
});

export default NotFound;