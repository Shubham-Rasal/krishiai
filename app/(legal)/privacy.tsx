import { View, Text, StyleSheet } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      {/* Add privacy policy content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
}); 