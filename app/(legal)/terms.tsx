import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function TermsOfService() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Terms of Service' }} />
      <ScrollView>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: June 15, 2024</Text>
        
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using KrishiAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          KrishiAI provides users with a platform to [brief description of app functionality]. The specific features and functionality may change over time.
        </Text>
        
        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use certain features of our application, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </Text>
        
        <Text style={styles.sectionTitle}>4. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Use the service for any illegal purpose</Text>
        <Text style={styles.bulletPoint}>• Violate any laws in your jurisdiction</Text>
        <Text style={styles.bulletPoint}>• Interfere with or disrupt the service</Text>
        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any part of the service</Text>
        <Text style={styles.bulletPoint}>• Use the service to transmit harmful code or content</Text>
        
        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of our application are owned by KrishiAI and are protected by copyright, trademark, and other intellectual property laws.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, KrishiAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          support@KrishiAI.com
        </Text>
      </ScrollView>
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
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    marginLeft: 15,
  },
}); 