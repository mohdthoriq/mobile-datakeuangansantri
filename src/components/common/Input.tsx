import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TouchableOpacity 
} from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { Theme } from '../../styles/themes';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: string;
  secureTextEntry?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  icon,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        {icon && (
          <FontAwesome6 
            name={icon as any} 
            size={20} 
            color={error ? Theme.colors.error : isFocused ? Theme.colors.primary : Theme.colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            secureTextEntry && styles.inputWithPassword,
            style,
          ]}
          placeholderTextColor={Theme.colors.gray[400]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.eyeButton}
          >
            <FontAwesome6 
              name={isPasswordVisible ? 'eye' : 'eye-slash'} 
              size={18} 
              color={Theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome6 name="circle-exclamation" size={14} color={Theme.colors.error} iconStyle='solid'/>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borders.radius.medium,
    backgroundColor: Theme.colors.surface,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: Theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: Theme.spacing.inputPadding.vertical,
    paddingHorizontal: Theme.spacing.inputPadding.horizontal,
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.primary,
  },
  inputWithIcon: {
    paddingLeft: Theme.spacing.sm,
  },
  inputWithPassword: {
    paddingRight: Theme.spacing.sm,
  },
  leftIcon: {
    marginLeft: Theme.spacing.md,
  },
  eyeButton: {
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  errorText: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.error,
    marginLeft: Theme.spacing.xs,
  },
});

export default Input;