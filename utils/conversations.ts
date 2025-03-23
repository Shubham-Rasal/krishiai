import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationMessage {
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const CONVERSATIONS_KEY = 'voice_conversations';

// Get all saved conversations
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Save a new conversation
export const saveConversation = async (conversation: Conversation): Promise<void> => {
  try {
    const existingConversations = await getConversations();
    const conversationExists = existingConversations.some(c => c.id === conversation.id);
    
    let updatedConversations;
    if (conversationExists) {
      // Update existing conversation
      updatedConversations = existingConversations.map(c => 
        c.id === conversation.id 
          ? { ...conversation, updatedAt: new Date() } 
          : c
      );
    } else {
      // Add new conversation
      updatedConversations = [
        { ...conversation, createdAt: new Date(), updatedAt: new Date() },
        ...existingConversations
      ];
    }
    
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

// Delete a conversation by ID
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const conversations = await getConversations();
    const updatedConversations = conversations.filter(c => c.id !== id);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
};

// Clear all conversations
export const clearConversations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CONVERSATIONS_KEY);
  } catch (error) {
    console.error('Error clearing conversations:', error);
  }
};

// Generate a unique ID for a conversation
export const generateConversationId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 