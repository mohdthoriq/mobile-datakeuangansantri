import { Colors } from '../styles/colors';

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getTypeColor = (type: string): string => {
  const typeColors: { [key: string]: string } = Colors.types;
  return typeColors[type] || Colors.gray[400];
};

export const formatNumber = (num: number): string => {
  return `#${num.toString().padStart(3, '0')}`;
};

export const formatHeight = (height: number): string => {
  return `${(height / 10).toFixed(1)} m`;
};

export const formatWeight = (weight: number): string => {
  return `${(weight / 10).toFixed(1)} kg`;
};