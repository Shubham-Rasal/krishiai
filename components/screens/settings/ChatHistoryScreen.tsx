import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Conversation, ConversationMessage, getConversations, deleteConversation } from '@/utils/conversations';

interface ChatHistoryScreenProps {
  onClose: () => void;
}

export default function ChatHistoryScreen({ onClose }: ChatHistoryScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load conversations when screen is mounted
  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch conversations from storage
  const loadConversations = async () => {
    try {
      setRefreshing(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (id: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(id);
              // Refresh the list
              loadConversations();
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    try {
      const dateObj = new Date(date);
      return format(dateObj, 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format message date for display
  const formatMessageDate = (date: Date) => {
    try {
      const dateObj = new Date(date);
      return format(dateObj, 'h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // View conversation details
  const viewConversationDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#E8F3D6', '#F9F7F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Saved Conversations</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Conversations List */}
        <ScrollView
          style={styles.conversationsList}
          contentContainerStyle={styles.conversationsContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadConversations} />
          }
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chat-remove-outline" size={64} color="#8BC34A" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Conversations Yet</Text>
              <Text style={styles.emptySubtitle}>Your saved voice conversations will appear here</Text>
            </View>
          ) : (
            conversations.map((conversation) => (
              <Pressable
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => viewConversationDetails(conversation)}
              >
                <View style={styles.conversationContent}>
                  <Text style={styles.conversationTitle} numberOfLines={1}>
                    {conversation.title}
                  </Text>
                  <Text style={styles.conversationDate}>
                    {formatDate(conversation.updatedAt)}
                  </Text>
                  <Text style={styles.messageCount}>
                    {conversation.messages.length} messages
                  </Text>
                </View>
                <View style={styles.conversationActions}>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteConversation(conversation.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF5722" />
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Conversation Detail Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </Pressable>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedConversation?.title || 'Conversation'}
              </Text>
              <View style={styles.headerSpacer} />
            </View>
            
            <ScrollView 
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {selectedConversation?.messages.length ? (
                selectedConversation.messages.map((message, index) => (
                  <View key={index} style={styles.messageWrapper}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.roleName}>
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </Text>
                      <Text style={styles.timestamp}>
                        {formatMessageDate(message.timestamp)}
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.chatBubble,
                        message.type === 'user' ? styles.userBubble : styles.assistantBubble
                      ]}
                    >
                      <Text style={[
                        styles.chatText,
                        message.type === 'user' ? styles.userText : styles.assistantText
                      ]}>
                        {message.message}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No messages found</Text>
                  <Text style={styles.emptySubtitle}>This conversation appears to be empty</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  placeholder: {
    width: 40,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    padding: 16,
  },
  conversationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#4CAF50',
  },
  conversationActions: {
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 32,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#1B5E20',
  },
  assistantText: {
    color: '#333',
  },
}); 