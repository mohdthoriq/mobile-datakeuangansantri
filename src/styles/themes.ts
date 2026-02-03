import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  shadows: {
    small: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  borders: {
    radius: {
      small: 4,
      medium: 8,
      large: 12,
      xlarge: 16,
      round: 50,
    },
    width: {
      thin: 1,
      medium: 2,
      thick: 3,
    },
  },
};