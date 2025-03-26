import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Button, Modal, TextInput, Divider } from 'react-native-paper';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { savePreferences, getPreferences, FarmPreferences } from '@/utils/preferences';
import { useLanguage } from '@/utils/LanguageContext';
import { usePushNotifications } from '@/utils/notifications';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
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

  useEffect(() => {
    loadPreferences();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t('settings')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('farmProfile')}</Text>
          <Pressable style={styles.menuItem} onPress={() => openModal('personal')}>
            <MaterialCommunityIcons name="account" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('personalDetails')}</Text>
              <Text style={styles.menuSubText}>{preferences.personalDetails?.name || i18n.t('notSet')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          
          <Pressable style={styles.menuItem} onPress={() => openModal('experience')}>
            <MaterialCommunityIcons name="account-clock" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('farmingExperience')}</Text>
              <Text style={styles.menuSubText}>{preferences.personalDetails?.experience || i18n.t('notSet')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          
          <Pressable style={styles.menuItem} onPress={() => openModal('location')}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('farmLocation')}</Text>
              <Text style={styles.menuSubText}>{preferences.location || i18n.t('notSet')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          
          <Pressable style={styles.menuItem} onPress={() => openModal('crops')}>
            <MaterialCommunityIcons name="sprout" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('cropManagement')}</Text>
              <Text style={styles.menuSubText}>
                {preferences.crops?.join(', ') || i18n.t('noCropsAdded')}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('preferences')}</Text>
          <Pressable style={styles.menuItem} onPress={() => openModal('language')}>
            <MaterialCommunityIcons name="translate" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('language')}</Text>
              <Text style={styles.menuSubText}>
                {currentLanguage === 'hi' ? 'हिंदी' : 'English'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          
          {/* Push Notification settings */}
          {/* <View style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('notifications') || 'Notifications'}</Text>
              <Text style={styles.menuSubText}>
                {notificationsEnabled 
                  ? (i18n.t('notificationsEnabled') || 'Enabled') 
                  : (i18n.t('notificationsDisabled') || 'Disabled')}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#81c784' }}
              thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View> */}
          
          {/* Only show test notification button if notifications are enabled */}
          {/* {notificationsEnabled && (
            <View style={styles.notificationTestContainer}>
              <Button
                mode="outlined"
                onPress={handleTestLocalNotification}
                style={styles.testButton}
                icon="bell-ring"
                textColor="#4CAF50"
              >
                {i18n.t('testLocalNotification') || 'Test Local Notification'}
              </Button>
              <Text style={styles.notificationHelpText}>
                {i18n.t('testLocalNotificationHelp') || 'Send a test notification from the app to your device.'}
              </Text>
              
              <Button
                mode="outlined"
                onPress={handleTestServerNotification}
                style={[styles.testButton, { marginTop: 16 }]}
                icon="server"
                textColor="#4CAF50"
              >
                {i18n.t('testServerNotification') || 'Test Server Notification'}
              </Button>
              <Text style={styles.notificationHelpText}>
                {i18n.t('testServerNotificationHelp') || 'Send a test notification from the Supabase server.'}
              </Text>
            </View>
          )} */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('dataPrivacy')}</Text>
          {/* Commenting out unimplemented features
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="database" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('offlineStorage')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-lock" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('privacySettings')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          */}
          <Text style={styles.menuSubText}>{i18n.t('comingSoon')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support')}</Text>
          {/* Commenting out unimplemented features
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('help')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="information" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('aboutKrishiAI')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          */}
          <Text style={styles.menuSubText}>{i18n.t('comingSoon')}</Text>
        </View>

        <List.Section>
          <List.Subheader style={styles.listSubheader}>{i18n.t('account')}</List.Subheader>
          <Divider style={styles.divider} />
          <List.Item
            title={user?.primaryEmailAddress?.emailAddress || i18n.t('noEmail')}
            description={i18n.t('email')}
            left={props => <List.Icon {...props} icon="email" color="#4CAF50" />}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
          <List.Item
            title={user?.fullName || i18n.t('noName')}
            description={i18n.t('name')}
            left={props => <List.Icon {...props} icon="account" color="#4CAF50" />}
            style={styles.listItem}
          />
          <Divider style={styles.divider} />
        </List.Section>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('accountActions')}</Text>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#ff4444"
            icon="logout-variant"
          >
            {i18n.t('signOut')}
          </Button>
        </View>

        {/* Add bottom spacing to prevent the logout button from being hidden */}
        <View style={styles.bottomSpacing}></View>

        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            {modalType === 'location' ? i18n.t('farmLocation') : 
             modalType === 'crops' ? i18n.t('cropManagement') :
             modalType === 'personal' ? i18n.t('personalDetails') :
             modalType === 'experience' ? i18n.t('farmingExperience') :
             modalType === 'language' ? i18n.t('language') : ''}
          </Text>
          
          {modalType === 'location' && (
            <TextInput
              mode="outlined"
              label={i18n.t('enterLocation')}
              value={tempInput}
              onChangeText={setTempInput}
              style={styles.modalInput}
              outlineColor="#4CAF50"
              activeOutlineColor="#4CAF50"
            />
          )}
          
          {modalType === 'crops' && (
            <TextInput
              mode="outlined"
              label={i18n.t('enterCrops')}
              value={cropInput}
              onChangeText={setCropInput}
              style={styles.modalInput}
              placeholder={i18n.t('cropInputPlaceholder')}
              outlineColor="#4CAF50"
              activeOutlineColor="#4CAF50"
            />
          )}
          
          {modalType === 'personal' && (
            <TextInput
              mode="outlined"
              label={i18n.t('enterName')}
              value={tempInput}
              onChangeText={setTempInput}
              style={styles.modalInput}
              outlineColor="#4CAF50"
              activeOutlineColor="#4CAF50"
            />
          )}
          
          {modalType === 'experience' && (
            <>
              <TextInput
                mode="outlined"
                label={i18n.t('yearsOfExperience')}
                value={experienceInput}
                onChangeText={setExperienceInput}
                style={styles.modalInput}
                keyboardType="numeric"
                outlineColor="#4CAF50"
                activeOutlineColor="#4CAF50"
              />
            </>
          )}
          
          {modalType === 'language' && (
            <View style={styles.languageOptions}>
              <Pressable 
                style={[
                  styles.languageOption, 
                  selectedLanguage === 'en' && styles.languageOptionSelected
                ]} 
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === 'en' && styles.languageTextSelected
                ]}>English</Text>
              </Pressable>
              <Pressable 
                style={[
                  styles.languageOption, 
                  selectedLanguage === 'hi' && styles.languageOptionSelected
                ]} 
                onPress={() => handleLanguageChange('hi')}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === 'hi' && styles.languageTextSelected
                ]}>हिंदी</Text>
              </Pressable>
            </View>
          )}
          
          <View style={styles.modalButtonsContainer}>
            <Button 
              mode="text" 
              onPress={() => setModalVisible(false)}
              textColor="#4CAF50"
            >
              {i18n.t('cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSavePreference}
              buttonColor="#4CAF50"
            >
              {i18n.t('save')}
            </Button>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listSubheader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  listItem: {
    paddingVertical: 8,
  },
  signOutButton: {
    marginTop: 10,
  },
  bottomSpacing: {
    height: 80,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  languageOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  languageText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  languageTextSelected: {
    color: '#fff',
  },
  notificationTestContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  testButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  notificationHelpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
}); 