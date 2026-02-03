import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { LocationData } from '../../types/common';

class LocationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message: 'Aplikasi membutuhkan akses lokasi untuk menampilkan koordinat Anda.',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Tolak',
            buttonPositive: 'Izinkan',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
      }
    }
    
    // For iOS, ensure you have NSLocationWhenInUseUsageDescription in Info.plist
    return true;
  }

  async getCurrentLocation(): Promise<LocationData> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          distanceFilter: 10,
        }
      );
    });
  }

  async getCurrentAddress(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      return data.display_name || 'Address not available';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Address not available';
    }
  }
}

export default new LocationService();