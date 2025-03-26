# Supabase Push Notifications Setup Guide

This guide explains how to set up push notifications using Supabase Edge Functions and Database Webhooks in KrishiAI.

## Overview

KrishiAI uses a Supabase-based approach for push notifications:

1. When a user registers for push notifications, their Expo push token is stored in their profile
2. A Supabase Edge Function handles sending push notifications via Expo's push service
3. A Database Webhook triggers the Edge Function when a new notification is added to the database

## Setup Steps

### 1. Database Migration Setup

Run the following commands to create the necessary database tables:

```bash
# Link your project (if not already done)
supabase link --project-ref your-supabase-project-ref

# Apply the database migrations
supabase db push
```

This creates:
- A `notifications` table to store notification records
- Adds an `expo_push_token` column to the `profiles` table

### 2. Deploy the Supabase Edge Function

Navigate to the root of your project and run:

```bash
# Deploy the push notification edge function
supabase functions deploy push

# Set the Expo Access Token (optional for enhanced security)
supabase secrets set EXPO_ACCESS_TOKEN=your-expo-access-token
```

To get an Expo Access Token (recommended for enhanced security):
1. Go to your [Expo Access Token Settings](https://expo.dev/accounts/[account]/settings/access-tokens)
2. Create a new token for use with Supabase
3. Enable "Enhanced Security for Push Notifications"

### 3. Create the Database Webhook

1. In your Supabase dashboard, go to **Database** → **Webhooks**
2. Click **Create a new Webhook**
3. Configure the webhook:
   - **Name**: `push-notifications`
   - **Table**: `notifications`
   - **Events**: Select only `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://<your-project-ref>.supabase.co/functions/v1/push`
   - **Headers**: Add `Authorization: Bearer <your-supabase-anon-key>`

4. Click **Save**

## Testing the Setup

1. Build and run the KrishiAI app on a physical device
2. Login and go to the Settings screen
3. Ensure Push Notifications are enabled
4. Tap "Test Server Notification" to test the full flow

If successful, you should receive a push notification sent from your Supabase Edge Function.

## Troubleshooting

If push notifications are not working:

1. **Check app logs**: Look for any errors when registering for push notifications
2. **Check token registration**: Verify that the `expo_push_token` is saved in the user's profile
3. **Check Supabase function logs**: In the Supabase dashboard, go to Edge Functions and check the logs for the `push` function
4. **Check the webhook**: Ensure the webhook is configured correctly and is being triggered
5. **Test with a direct insert**: Insert a record directly into the `notifications` table via the Supabase dashboard

## Security Considerations

- The Edge Function uses your Supabase service role key, which has full permissions
- The notifications table has Row Level Security (RLS) enabled:
  - Users can only insert notifications for themselves
  - Users can only read their own notifications
- Using an Expo Access Token with enhanced security is recommended for production

## Additional Resources

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions) 