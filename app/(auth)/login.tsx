import { View, Text, StyleSheet, Pressable, Image, Alert, Platform } from 'react-native';
import { router, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';
import { Button } from 'react-native-paper';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { startOAuthFlow } = useOAuth({ 
    strategy: "oauth_google",
    redirectUrl: Platform.select({
      native: 'com.bluequbit.krishiai://oauth/google',
      default: 'http://localhost:8081/oauth/google',
    }),
  });

  const onGoogleLogin = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      
      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
        router.push('/(tabs)/home');
      }
    } catch (err) {
      console.error("OAuth error:", err);
      Alert.alert(
        "Login Error",
        "There was a problem signing in with Google. Please try again."
      );
    }
  }, []);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image 
        source={require('../../assets/images/farm-background.jpg')}
        style={styles.backgroundImage}
      />

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>KrishiAI</Text>
        <Text style={styles.subtitleText}>AI-Powered Farm Assistant</Text>
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={onGoogleLogin}
          style={styles.googleButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="google"
        >
          Continue with Google
        </Button>
      </View>

      {/* Footer Links */}
      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/(legal)/privacy')}>
          <Text style={styles.footerText}>Privacy policy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(legal)/terms')}>
          <Text style={styles.footerText}>Terms of service</Text>
        </Pressable>
      </View>

      {/* Skip Button */}
      {/* <Pressable style={styles.skipButton} onPress={() => router.push('/(tabs)/home')}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginBottom: 12,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 40,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen; 