import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { getConversations, Conversation } from '@/utils/conversations';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { user } = useUser();
  const [inputText, setInputText] = useState('');
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load saved conversations when component mounts
    loadRecentConversations();
  }, []);

  const loadRecentConversations = async () => {
    try {
      const conversations = await getConversations();
      // Sort by updatedAt date, newest first
      const sortedConversations = conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      // Get only the most recent 3 conversations
      setRecentConversations(sortedConversations.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent conversations:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    try {
      const now = new Date();
      const conversationDate = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - conversationDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return format(conversationDate, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Navigate to conversation details
  const viewConversation = (conversation: Conversation) => {
    router.push({
      pathname: '/(tabs)/conversations',
      params: { id: conversation.id }
    });
  };

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
              onPress={() => router.push('/(tabs)/voice')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="mic-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.itemTitle}>Voice Chat</Text>
              <Text style={styles.itemDescription}>Talk to your assistant</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/(tabs)/pesticide-scan')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="scan-outline" size={24} color="#1565C0" />
              </View>
              <Text style={styles.itemTitle}>Pesticide Scan</Text>
              <Text style={styles.itemDescription}>Analyze pesticides</Text>
            </Pressable>

            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="settings-outline" size={24} color="#6A1B9A" />
              </View>
              <Text style={styles.itemTitle}>Settings</Text>
              <Text style={styles.itemDescription}>Update preferences</Text>
            </Pressable>

            <Pressable 
              style={styles.quickAccessItem}
              onPress={() => router.push('/(tabs)/conversations')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time-outline" size={24} color="#E65100" />
              </View>
              <Text style={styles.itemTitle}>History</Text>
              <Text style={styles.itemDescription}>View past conversations</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.recentPrompts}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          <View style={styles.conversationList}>
            {recentConversations.length === 0 ? (
              <View style={styles.emptyConversations}>
                <Text style={styles.emptyText}>No recent conversations</Text>
                <Pressable
                  style={styles.startChatButton}
                  onPress={() => router.push('/(tabs)/voice')}
                >
                  <Text style={styles.startChatText}>Start a chat</Text>
                </Pressable>
              </View>
            ) : (
              recentConversations.map((conversation) => (
                <Pressable 
                  key={conversation.id}
                  style={styles.conversationItem}
                  onPress={() => viewConversation(conversation)}
                >
                  <View style={styles.conversationIcon}>
                    <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  </View>
                  <View style={styles.conversationContent}>
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                      {conversation.title}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTimeAgo(conversation.updatedAt)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
            {recentConversations.length > 0 && (
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/conversations')}
              >
                <Text style={styles.viewAllText}>View all conversations</Text>
                <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
              </Pressable>
            )}
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
    marginBottom: 20,
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
  emptyConversations: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  startChatButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  startChatText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginRight: 4,
  },
}); 