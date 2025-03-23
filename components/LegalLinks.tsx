import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function LegalLinks() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        By continuing, you agree to our{' '}
        <Link href="/(legal)/terms" asChild>
          <Pressable>
            <Text style={styles.link}>Terms of Service</Text>
          </Pressable>
        </Link>
        {' '}and{' '}
        <Link href="/(legal)/privacy" asChild>
          <Pressable>
            <Text style={styles.link}>Privacy Policy</Text>
          </Pressable>
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 