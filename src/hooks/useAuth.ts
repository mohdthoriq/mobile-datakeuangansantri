import { useState, useEffect, useCallback } from 'react';
import { User, AuthCredentials, RegisterData } from '../types/auth';
import AuthStorageService from '../services/storage/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userData, isLoggedIn] = await Promise.all([
        AuthStorageService.getUserData(),
        AuthStorageService.isUserLoggedIn(),
      ]);
      
      setUser(userData);
      setIsAuthenticated(isLoggedIn);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    try {
      // Simulate API login - replace with actual API call
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        username: credentials.email.split('@')[0],
        createdAt: new Date(),
      };

      const success = await AuthStorageService.saveUserCredentials(credentials, mockUser);
      
      if (success) {
        setUser(mockUser);
        setIsAuthenticated(true);
      }
      
      return success;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      // Simulate API registration - replace with actual API call
      const mockUser: User = {
        id: Date.now().toString(),
        email: data.email,
        username: data.username,
        createdAt: new Date(),
      };

      const success = await AuthStorageService.saveUserCredentials(data, mockUser);
      
      if (success) {
        setUser(mockUser);
        setIsAuthenticated(true);
      }
      
      return success;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      const success = await AuthStorageService.clearUserData();
      
      if (success) {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      return success;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };
};