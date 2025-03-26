import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { useUser } from '@clerk/clerk-expo';

// Configuration for how notifications should appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and return the token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;
  
  // Check if the device is physical (not an emulator/simulator)
  if (Device.isDevice) {
    // Check and request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If we don't have permission, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If permission was denied, return undefined
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }
    
    // Get push token from Expo
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'd96e42cd-861e-4c1b-a53f-b99800992e87',
    })).data;
    
    console.log('Push token:', token);
  } else {
    console.log('Must use physical device for push notifications');
  }

  // Special handling for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });
  }

  return token;
}

/**
 * Save the push token to the user's profile in Supabase
 */
export async function savePushToken(userId: string, token: string): Promise<void> {
  if (!token) return;
  
  try {
    // Get or create profile for the user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching profile:', fetchError);
      return;
    }
    
    if (existingProfile) {
      // Update existing profile with push token
      const { error } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating profile with push token:', error);
      } else {
        console.log('Push token saved to existing profile');
      }
    } else {
      // Create new profile with push token
      const { error } = await supabase
        .from('profiles')
        .insert([
          { 
            id: userId, 
            expo_push_token: token,
            device: Device.modelName || 'Unknown',
            platform: Platform.OS,
          }
        ]);
      
      if (error) {
        console.error('Error creating profile with push token:', error);
      } else {
        console.log('Push token saved to new profile');
      }
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

/**
 * Send a test notification directly from the client
 */
export async function sendTestNotification(title: string, body: string): Promise<void> {
  // Use the simpler API for local notifications
  await Notifications.presentNotificationAsync({
    title,
    body,
    data: { data: 'This is test notification data' },
    sound: true,
  });
}

/**
 * Insert a notification record into Supabase to trigger a push notification
 */
export async function sendPushNotification(userId: string, title: string, body: string, data = {}): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        { 
          user_id: userId, 
          title, 
          body, 
          data 
        }
      ]);
    
    if (error) {
      console.error('Error creating notification record:', error);
      throw error;
    }
    
    console.log('Notification record created successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Custom hook to handle push notifications for the current user
 */
export function usePushNotifications() {
  const { user } = useUser();
  
  /**
   * Register the current user for push notifications
   */
  const registerCurrentUser = async (): Promise<void> => {
    if (!user) {
      console.log('No user is logged in');
      return;
    }
    
    try {
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        await savePushToken(user.id, token);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };
  
  /**
   * Send a test notification locally to the current device
   */
  const sendLocalTestNotification = async (): Promise<void> => {
    await sendTestNotification(
      'KrishiAI Test Notification',
      'This is a test notification from KrishiAI app!'
    );
  };
  
  /**
   * Send a test notification through Supabase
   */
  const sendServerTestNotification = async (): Promise<void> => {
    if (!user) {
      console.log('No user is logged in');
      return;
    }
    
    await sendPushNotification(
      user.id,
      'KrishiAI Server Test',
      'This notification came from the Supabase server!',
      { source: 'server_test' }
    );
  };
  
  return {
    registerCurrentUser,
    sendLocalTestNotification,
    sendServerTestNotification,
  };
} 