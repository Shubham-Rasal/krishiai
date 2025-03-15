import { View, Text, StyleSheet } from 'react-native';

export default function TermsOfService() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      {/* Add terms of service content */}
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