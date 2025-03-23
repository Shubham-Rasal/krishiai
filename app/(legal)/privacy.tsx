import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: June 15, 2024</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to KrishiAI. We respect your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect information that you provide directly to us, including:
        </Text>
        <Text style={styles.bulletPoint}>• Account information: When you register, we collect your name, email address, and password.</Text>
        <Text style={styles.bulletPoint}>• Profile information: Information you add to your profile such as a profile picture, bio, and preferences.</Text>
        <Text style={styles.bulletPoint}>• Communications: Information you provide when you contact us for support.</Text>
        
        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
        <Text style={styles.bulletPoint}>• Process and complete transactions</Text>
        <Text style={styles.bulletPoint}>• Send you technical notices and support messages</Text>
        <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
        <Text style={styles.bulletPoint}>• Develop new products and services</Text>
        
        <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information. We may share information in the following situations:
        </Text>
        <Text style={styles.bulletPoint}>• With service providers who perform services on our behalf</Text>
        <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
        <Text style={styles.bulletPoint}>• To protect the rights and safety of our users and third parties</Text>
        
        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have rights regarding your personal information, such as the right to access, correct, or delete your data.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
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