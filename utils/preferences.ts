import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FarmPreferences {
  location?: string;
  crops?: string[];
  personalDetails?: {
    name?: string;
    language?: string;
    experience?: string;
  };
  language?: string;
  notificationsEnabled?: boolean;
}

const PREFERENCES_KEY = 'farm_preferences';

export const savePreferences = async (preferences: FarmPreferences) => {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

export const getPreferences = async (): Promise<FarmPreferences> => {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting preferences:', error);
    return {};
  }
}; 