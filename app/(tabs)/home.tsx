import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useUser();
  const [inputText, setInputText] = useState('');
  const router = useRouter();

  const handleSend = () => {
    if (inputText.trim()) {
      // Handle chat interaction
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>KrishiAI</Text>
        <Pressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.assistantTitle}>AI Assistant</Text>
          <View style={styles.greetingCard}>
            <Text style={styles.greeting}>
              Hey, {user?.firstName || 'Farmer'}! 👋
            </Text>
            <Text style={styles.subGreeting}>
              I'm your farming assistant,{'\n'}How can I assist you today?
            </Text>
            
          </View>
        </View>

        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/voice')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="mic-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.itemTitle}>Voice Chat</Text>
              <Text style={styles.itemDescription}>Talk to your assistant</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/pesticide-scan')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="scan-outline" size={24} color="#1565C0" />
              </View>
              <Text style={styles.itemTitle}>Pesticide Scan</Text>
              <Text style={styles.itemDescription}>Analyze pesticides</Text>
            </Pressable>

           

            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/settings')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="settings-outline" size={24} color="#6A1B9A" />
              </View>
              <Text style={styles.itemTitle}>Settings</Text>
              <Text style={styles.itemDescription}>Update preferences</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.recentPrompts}>
          <Text style={styles.sectionTitle}>Recent Prompts</Text>
          <View style={styles.conversationList}>
            <Pressable 
              style={styles.conversationItem}
              onPress={() => router.push('/voice')}
            >
              <View style={styles.conversationIcon}>
                <Ionicons name="chatbubble-outline" size={20} color="#666" />
              </View>
              <View style={styles.conversationContent}>
                <Text style={styles.conversationTitle}>When should I harvest wheat?</Text>
                <Text style={styles.conversationTime}>2 hours ago</Text>
              </View>
            </Pressable>

            <Pressable 
              style={styles.conversationItem}
              onPress={() => router.push('/crop-scan')}
            >
              <View style={styles.conversationIcon}>
                <Ionicons name="scan-outline" size={20} color="#666" />
              </View>
              <View style={styles.conversationContent}>
                <Text style={styles.conversationTitle}>Analyzed crop disease in wheat field</Text>
                <Text style={styles.conversationTime}>Yesterday</Text>
              </View>
            </Pressable>

            <Pressable 
              style={styles.conversationItem}
              onPress={() => router.push('/voice')}
            >
              <View style={styles.conversationIcon}>
                <Ionicons name="mic-outline" size={20} color="#666" />
              </View>
              <View style={styles.conversationContent}>
                <Text style={styles.conversationTitle}>Voice: Weather forecast for next week</Text>
                <Text style={styles.conversationTime}>2 days ago</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
  },
  assistantTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  voiceChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 25,
    marginRight: 50,
  },
  voiceChatText: {
    marginLeft: 8,
    color: '#666',
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccess: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickAccessItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  recentPrompts: {
    padding: 16,
  },
  conversationList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
}); 