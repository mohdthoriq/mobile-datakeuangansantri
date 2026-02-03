import { useState, useCallback } from 'react';
import { LocationData } from '../types/common';
import LocationService from '../services/location/geolocation';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);

      // Get address from coordinates
      const address = await LocationService.getCurrentAddress(
        location.latitude,
        location.longitude
      );
      setCurrentAddress(address);

      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setCurrentLocation(null);
    setCurrentAddress('');
    setError(null);
  }, []);

  const refreshLocation = useCallback(async (): Promise<LocationData | null> => {
    return await getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    currentLocation,
    currentAddress,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation,
    refreshLocation,
  };
};