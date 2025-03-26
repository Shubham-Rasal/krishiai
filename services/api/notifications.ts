import { supabase } from '@/utils/supabase';

interface SendNotificationParams {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send a push notification to a specific user or users
 */
export async function sendPushNotification({
  userId,
  userIds,
  title,
  body,
  data = {}
}: SendNotificationParams) {
  try {
    // Call the Supabase Edge Function
    const { data: response, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        userIds,
        title,
        body,
        data
      }
    });

    if (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send a push notification to all registered devices
 */
export async function sendBroadcastNotification({
  title,
  body,
  data = {}
}: Omit<SendNotificationParams, 'userId' | 'userIds'>) {
  return sendPushNotification({ title, body, data });
}

/**
 * Send a notification to a specific user about a crop update
 */
export async function sendCropUpdateNotification(userId: string, cropName: string, updateType: string) {
  return sendPushNotification({
    userId,
    title: 'Crop Update',
    body: `Your ${cropName} crop ${updateType}.`,
    data: {
      screen: 'home',
      cropName,
      updateType
    }
  });
}

/**
 * Send a weather alert notification
 */
export async function sendWeatherAlertNotification(userId: string, alertType: string, details: string) {
  return sendPushNotification({
    userId,
    title: 'Weather Alert',
    body: `${alertType}: ${details}`,
    data: {
      screen: 'home',
      alertType
    }
  });
} 