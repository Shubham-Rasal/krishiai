# Push Notifications in KrishiAI

This document outlines how push notifications are implemented in the KrishiAI application.

## Overview

KrishiAI uses Expo's push notification system integrated with Clerk for user identity management and Supabase for backend storage of push tokens.

## Technical Components

### Client-Side Components

1. **Expo Notifications Setup**
   - Added `expo-notifications` and `expo-device` packages
   - Configured app.json with notification settings
   - Created a notification utility module for handling push notifications

2. **User Registration for Push Notifications**
   - Automatically registers users for push notifications on app startup
   - Stores push tokens in Supabase, linked to the user's Clerk ID
   - Allows users to enable/disable notifications in settings

3. **Notification UI**
   - Added notification toggle in settings
   - Added a test button to send local notifications

### Server-Side Components

1. **Supabase Database**
   - Created `push_tokens` table to store user push tokens
   - Added RLS policies for security

2. **Supabase Edge Function**
   - Created `send-notification` Edge Function to send notifications
   - The function uses Expo's Push API to deliver notifications

3. **API Utilities**
   - Created client-side utilities for sending different types of notifications

## How It Works

1. **Token Registration**
   - When a user signs in, the app automatically registers for push notifications
   - The push token is stored in Supabase with the user's Clerk ID

2. **Sending Notifications**
   - Notifications can be sent to:
     - A specific user
     - Multiple users
     - All registered devices (broadcast)
   - Custom notification types for various app features

3. **Notification Handling**
   - Notifications show alerts when the app is in the foreground
   - When tapped, notifications can navigate to specific app screens

## Usage Examples

### Sending a Notification to a Specific User

```typescript
import { sendPushNotification } from '@/services/api/notifications';

// Send to a specific user
await sendPushNotification({
  userId: 'clerk_user_id',
  title: 'New Crop Update',
  body: 'Your wheat crop is due for irrigation.',
  data: {
    screen: 'home',
    cropId: '123'
  }
});
```

### Sending a Broadcast Notification

```typescript
import { sendBroadcastNotification } from '@/services/api/notifications';

// Send to all registered devices
await sendBroadcastNotification({
  title: 'Weather Alert',
  body: 'Heavy rain expected in your region in the next 24 hours.',
  data: {
    screen: 'weather'
  }
});
```

## Testing

You can test push notifications by:

1. Using the test button in the app settings
2. Using the Expo Push API directly
3. Using the notification API utilities in the app

## Debugging

If notifications aren't working:

1. Check that the user has granted permission
2. Verify the push token is saved in Supabase
3. Check device capabilities (physical device required)
4. Review logs from the send-notification Edge Function

## Future Improvements

- Add scheduled notifications
- Implement notification categories
- Support rich notifications with images
- Add notification history view 