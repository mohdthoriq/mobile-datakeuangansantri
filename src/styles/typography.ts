import { Platform } from 'react-native';

export const Typography = {
  family: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
    display: 48,
  },
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  styles: {
    display: {
      fontSize: 40,
      lineHeight: 48,
      fontFamily: 'bold',
      fontWeight: '700',
    },
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontFamily: 'bold',
      fontWeight: '700',
    },
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'bold',
      fontWeight: '700',
    },
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontFamily: 'bold',
      fontWeight: '700',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'regular',
      fontWeight: '400',
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'regular',
      fontWeight: '400',
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'regular',
      fontWeight: '400',
    },
  },
};