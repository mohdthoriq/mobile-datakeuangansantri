import Keychain from 'react-native-keychain';
import { User, AuthCredentials } from '../../types/auth';
import { STORAGE_KEYS } from '../../utils/constans';

class AuthStorageService {
    private serviceName = 'pokedex-app';

    async saveUserCredentials(credentials: AuthCredentials, user: User): Promise<boolean> {
        try {
            // Save credentials to keychain
            await Keychain.setGenericPassword(
                credentials.email,
                credentials.password,
                { service: this.serviceName }
            );

            // Save user data to secure storage
            await Keychain.setInternetCredentials(
                STORAGE_KEYS.USER_DATA,
                user.id,
                JSON.stringify(user),
                { service: this.serviceName }
            );

            return true;
        } catch (error) {
            console.error('Error saving user credentials:', error);
            return false;
        }
    }

    async getUserCredentials(): Promise<{ username: string; password: string } | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: this.serviceName });
            if (credentials) {
                return {
                    username: credentials.username,
                    password: credentials.password,
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting user credentials:', error);
            return null;
        }
    }

    async getUserData(): Promise<User | null> {
        try {
            const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.USER_DATA);
            if (credentials && credentials.password) {
                return JSON.parse(credentials.password);
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    async clearUserData(): Promise<boolean> {
        try {
            await Keychain.resetGenericPassword({ service: this.serviceName });
            await Keychain.resetInternetCredentials({
                service: STORAGE_KEYS.USER_DATA
            })
            return true;
        } catch (error) {
            console.error('Error clearing user data:', error);
            return false;
        }
    }

    async isUserLoggedIn(): Promise<boolean> {
        try {
            const credentials = await this.getUserCredentials();
            return !!credentials;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }
}

export default new AuthStorageService();