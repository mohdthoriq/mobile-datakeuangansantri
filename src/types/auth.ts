export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
  confirmPassword: string;
}

export interface BiometricData {
  isEnabled: boolean;
  type: 'faceId' | 'fingerprint' | 'none';
  enrolled: boolean;
}