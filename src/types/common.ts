export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: number;
}

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}