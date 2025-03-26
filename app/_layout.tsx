import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/providers/auth';
import { useAuth } from '@clerk/clerk-expo';
import { Provider as PaperProvider } from 'react-native-paper';
import { useRouter, useSegments } from 'expo-router';
import { LanguageProvider } from '@/utils/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, savePushToken } from '@/utils/notifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initial layout component
function InitialLayout() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Setup push notification listeners
    registerForNotifications();

    return () => {
      // Clean up notification listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   // Register push token when user is signed in
  //   if (isSignedIn && userId) {
  //     registerPushTokenForUser(userId);
  //   }
  // }, [isSignedIn, userId]);

  const registerPushTokenForUser = async (userId: string) => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushToken(userId, token);
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  const registerForNotifications = async () => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      const data = response.notification.request.content.data;
      
      // Handle notification tap here - e.g., navigate to a specific screen
      handleNotificationResponse(data);
    });
  };

  const handleNotificationResponse = (data: any) => {
    if (data.conversationId) {
      // Navigate to conversation detail screen
      router.navigate(`/(tabs)/conversations` as any);
    } else if (data.screen) {
      // Navigate to a specific screen based on the screen name
      const screenPath = `/(tabs)/${data.screen}` as any;
      router.navigate(screenPath);
    }
  };


    useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === '(auth)';

    // After onboarding, route based on auth status
    if (isSignedIn && !inTabsGroup) {
      router.replace('/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isSignedIn, segments, isLoaded]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <InitialLayout />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
