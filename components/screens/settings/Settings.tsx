import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch, ImageBackground, StatusBar, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { List, Button, Modal, TextInput, Divider } from 'react-native-paper';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { savePreferences, getPreferences, FarmPreferences } from '@/utils/preferences';
import { useLanguage } from '@/utils/LanguageContext';
import { usePushNotifications } from '@/utils/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import PersonalInfoScreen from './PersonalInfoScreen';
import FarmDetailsScreen from './FarmDetailsScreen';
import FarmingExperienceScreen from './FarmingExperienceScreen';
import WaterSourceScreen from './WaterSourceScreen';
import CropManagementScreen from './CropManagementScreen';
import ChatHistoryScreen from './ChatHistoryScreen';

interface SettingsProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function Settings({ onClose, isModal = false }: SettingsProps) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams<{ showChatHistory?: string }>();
  const [preferences, setPreferences] = useState<FarmPreferences>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'location' | 'crops' | 'personal' | 'language' | 'experience'>();
  const [tempInput, setTempInput] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const { i18n, changeLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const { registerCurrentUser, sendLocalTestNotification, sendServerTestNotification } = usePushNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPersonalInfoScreen, setShowPersonalInfoScreen] = useState(false);
  const [showFarmDetailsScreen, setShowFarmDetailsScreen] = useState(false);
  const [showFarmingExperienceScreen, setShowFarmingExperienceScreen] = useState(false);
  const [showWaterSourceScreen, setShowWaterSourceScreen] = useState(false);
  const [showCropManagementScreen, setShowCropManagementScreen] = useState(false);
  const [showChatHistoryScreen, setShowChatHistoryScreen] = useState(false);

  // State for tracking whether any full-screen component is visible
  const isFullScreenVisible = showPersonalInfoScreen || showFarmDetailsScreen || 
                              showFarmingExperienceScreen || showWaterSourceScreen || 
                              showCropManagementScreen || showChatHistoryScreen;
  
  // Effect to handle status bar and tab bar visibility
  useEffect(() => {
    if (isFullScreenVisible) {
      StatusBar.setBackgroundColor('#1E1B4B');
      StatusBar.setBarStyle('light-content');
    } else {
      // Reset status bar to default
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');
    }
  }, [isFullScreenVisible]);

  useEffect(() => {
    loadPreferences();
  }, []);
  
  useEffect(() => {
    // Check if we should show chat history based on URL parameter
    if (params.showChatHistory === 'true') {
      setShowChatHistoryScreen(true);
    }
  }, [params.showChatHistory]);

  const loadPreferences = async () => {
    const prefs = await getPreferences();
    setPreferences(prefs);
    if (prefs.personalDetails?.experience) {
      setExperienceInput(prefs.personalDetails.experience);
    }
    if (prefs.notificationsEnabled !== undefined) {
      setNotificationsEnabled(prefs.notificationsEnabled);
    }
  };

  const handleShowPersonalInfo = () => {
    setShowPersonalInfoScreen(true);
  };

  const handleClosePersonalInfo = () => {
    setShowPersonalInfoScreen(false);
    loadPreferences();
  };

  const handleShowFarmDetails = () => {
    setShowFarmDetailsScreen(true);
  };

  const handleCloseFarmDetails = () => {
    setShowFarmDetailsScreen(false);
    loadPreferences();
  };

  const handleShowFarmingExperience = () => {
    setShowFarmingExperienceScreen(true);
  };

  const handleCloseFarmingExperience = () => {
    setShowFarmingExperienceScreen(false);
    loadPreferences();
  };

  const handleShowWaterSource = () => {
    setShowWaterSourceScreen(true);
  };

  const handleCloseWaterSource = () => {
    setShowWaterSourceScreen(false);
    loadPreferences();
  };

  const handleShowCropManagement = () => {
    setShowCropManagementScreen(true);
  };

  const handleCloseCropManagement = () => {
    setShowCropManagementScreen(false);
    loadPreferences();
  };

  const handleShowChatHistory = () => {
    setShowChatHistoryScreen(true);
  };

  const handleCloseChatHistory = () => {
    setShowChatHistoryScreen(false);
  };

  const handleSavePreference = async () => {
    let updatedPreferences = { ...preferences };
    
    if (modalType === 'location') {
      updatedPreferences.location = tempInput;
    } else if (modalType === 'crops') {
      updatedPreferences.crops = cropInput.split(',').map(crop => crop.trim());
    } else if (modalType === 'personal') {
      updatedPreferences.personalDetails = {
        ...updatedPreferences.personalDetails,
        name: tempInput
      };
    } else if (modalType === 'experience') {
      updatedPreferences.personalDetails = {
        ...updatedPreferences.personalDetails,
        experience: experienceInput
      };
    } else if (modalType === 'language') {
      updatedPreferences.language = selectedLanguage;
      changeLanguage(selectedLanguage);
    }

    await savePreferences(updatedPreferences);
    setPreferences(updatedPreferences);
    setModalVisible(false);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    const updatedPreferences = { ...preferences, notificationsEnabled: value };
    await savePreferences(updatedPreferences);
    setPreferences(updatedPreferences);
    
    if (value) {
      // Register for push notifications if enabled
      await registerCurrentUser();
      Alert.alert(
        i18n.t('notificationsEnabled'),
        i18n.t('notificationsEnabledMessage')
      );
    }
  };

  const handleTestLocalNotification = async () => {
    try {
      await sendLocalTestNotification();
      Alert.alert(
        i18n.t('testNotificationSent') || 'Test Notification Sent',
        i18n.t('checkNotification') || 'Check your device for the notification.'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        i18n.t('error') || 'Error',
        i18n.t('errorSendingNotification') || 'There was an error sending the notification.'
      );
    }
  };

  const handleTestServerNotification = async () => {
    try {
      await sendServerTestNotification();
      Alert.alert(
        i18n.t('serverNotificationSent') || 'Server Notification Sent',
        i18n.t('checkServerNotification') || 'A notification will be sent from the server.'
      );
    } catch (error) {
      console.error('Error sending server notification:', error);
      Alert.alert(
        i18n.t('error') || 'Error',
        i18n.t('errorSendingServerNotification') || 'There was an error sending the server notification.'
      );
    }
  };

  const openModal = (type: 'location' | 'crops' | 'personal' | 'language' | 'experience') => {
    setModalType(type);
    if (type === 'location') {
      setTempInput(preferences.location || '');
    } else if (type === 'crops') {
      setCropInput(preferences.crops?.join(', ') || '');
    } else if (type === 'personal') {
      setTempInput(preferences.personalDetails?.name || '');
    } else if (type === 'experience') {
      setExperienceInput(preferences.personalDetails?.experience || '');
    } else if (type === 'language') {
      setSelectedLanguage(currentLanguage);
    }
    setModalVisible(true);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Full screen forms
  const renderFullScreenForms = () => {
    if (showPersonalInfoScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <PersonalInfoScreen
            onClose={handleClosePersonalInfo}
            onSave={handleClosePersonalInfo}
          />
        </View>
      );
    }
    
    if (showFarmingExperienceScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <FarmingExperienceScreen
            onClose={handleCloseFarmingExperience}
            onSave={handleCloseFarmingExperience}
          />
        </View>
      );
    }
    
    if (showFarmDetailsScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <FarmDetailsScreen
            onClose={handleCloseFarmDetails}
            onSave={handleCloseFarmDetails}
          />
        </View>
      );
    }
    
    if (showWaterSourceScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <WaterSourceScreen
            onClose={handleCloseWaterSource}
            onSave={handleCloseWaterSource}
          />
        </View>
      );
    }
    
    if (showCropManagementScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <CropManagementScreen
            onClose={handleCloseCropManagement}
            onSave={handleCloseCropManagement}
          />
        </View>
      );
    }
    
    if (showChatHistoryScreen) {
      return (
        <View style={styles.fullScreenContainer}>
          <ChatHistoryScreen
            onClose={handleCloseChatHistory}
          />
        </View>
      );
    }
    
    return null;
  };

  // Determine container component based on whether it's rendered as a modal or a full screen
  const Container = isModal ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {isModal && (
        <View style={styles.modalHeader}>
          <Text style={styles.title}>{i18n.t('settings')}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </Pressable>
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isModal && (
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('settings')}</Text>
          </View>
        )}

        {/* Profile Header Section */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.displayName}>
            {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
          </Text>
          <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || i18n.t('noEmail')}</Text>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleShowPersonalInfo}>
            <Text style={styles.editProfileButtonText}>{i18n.t('edit')} profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Categories */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>{i18n.t("farmProfile")}</Text>
          <View style={styles.cardContainer}>
            <Pressable 
              style={styles.settingsCard} 
              onPress={handleShowFarmDetails}
            >
              <View style={styles.settingsCardContent}>
                <Ionicons name="location-outline" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('farmDetails')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>

            <Pressable 
              style={styles.settingsCard} 
              onPress={handleShowFarmingExperience}
            >
              <View style={styles.settingsCardContent}>
                <Ionicons name="calendar-outline" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('farmingExperience')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>

            <Pressable 
              style={styles.settingsCard} 
              onPress={handleShowWaterSource}
            >
              <View style={styles.settingsCardContent}>
                <Ionicons name="water-outline" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('waterSources')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>

            <Pressable 
              style={styles.settingsCard} 
              onPress={handleShowCropManagement}
            >
              <View style={styles.settingsCardContent}>
                <MaterialCommunityIcons name="sprout" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('cropManagement')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>{i18n.t("preferences")}</Text>
          <View style={styles.cardContainer}>
            <View style={styles.settingsCard}>
              <View style={styles.settingsCardContent}>
                <Ionicons name="notifications-outline" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('notifications')}</Text>
              </View>
              <Switch 
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: "#E0E0E0", true: "#1E1B4B" }}
                thumbColor={notificationsEnabled ? "#FFFFFF" : "#f5f5f5"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
            
            <Pressable 
              style={styles.settingsCard}
              onPress={handleShowChatHistory}
            >
              <View style={styles.settingsCardContent}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#1E1B4B" style={styles.settingsIcon} />
                <Text style={styles.settingsLabel}>{i18n.t('chatHistory') || 'Chat History'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>{i18n.t('signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Render the full screen forms */}
      {renderFullScreenForms()}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingsValue: {
    fontSize: 16,
    color: '#666',
  },
  signOutButton: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
  preferencesSection: {
    marginBottom: 20,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F7FA',
    zIndex: 9999,
  },
}); 