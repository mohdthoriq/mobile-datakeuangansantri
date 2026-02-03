import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import Button from './Button';
import { Theme } from '../../styles/themes';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  icon?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
  retryButtonText = 'Try Again',
  icon = 'circle-exclamation',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome6 
          name={icon as any} 
          size={80} 
          color={Theme.colors.error} 
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <Button
          title={retryButtonText}
          onPress={onRetry}
          variant="primary"
          style={styles.button}
          icon="rotate-right"
          iconPosition="left"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.background,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderRadius: 50,
  },
  title: {
    fontSize: Theme.typography.size.xxl,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: Theme.typography.lineHeight.md,
  },
  button: {
    minWidth: 120,
  },
});

export default ErrorScreen;