import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Button, Modal, TextInput, Divider } from 'react-native-paper';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { savePreferences, getPreferences, FarmPreferences } from '@/utils/preferences';
import { useLanguage } from '@/utils/LanguageContext';

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

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getPreferences();
    setPreferences(prefs);
    if (prefs.personalDetails?.experience) {
      setExperienceInput(prefs.personalDetails.experience);
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
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="microphone" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('voiceSettings')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#4CAF50" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('notifications')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('dataPrivacy')}</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support')}</Text>
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

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#ff4444"
          >
            {i18n.t('signOut')}
          </Button>
        </View>

        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === 'location' ? i18n.t('farmLocation') : 
               modalType === 'crops' ? i18n.t('manageCrops') : 
               modalType === 'language' ? i18n.t('selectLanguage') : 
               modalType === 'experience' ? i18n.t('farmingExperience') : 
               i18n.t('personalDetails')}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>
          <Divider style={styles.modalDivider} />
          
          {modalType === 'language' ? (
            <View style={styles.languageOptions}>
              <Pressable 
                style={[styles.languageOption, selectedLanguage === 'en' && styles.selectedLanguage]} 
                onPress={() => handleLanguageChange('en')}>
                <MaterialCommunityIcons 
                  name={selectedLanguage === 'en' ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                  size={24} 
                  color={selectedLanguage === 'en' ? "#4CAF50" : "#666"} 
                  style={styles.languageIcon}
                />
                <Text style={styles.languageText}>English</Text>
              </Pressable>
              <Pressable 
                style={[styles.languageOption, selectedLanguage === 'hi' && styles.selectedLanguage]} 
                onPress={() => handleLanguageChange('hi')}>
                <MaterialCommunityIcons 
                  name={selectedLanguage === 'hi' ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                  size={24} 
                  color={selectedLanguage === 'hi' ? "#4CAF50" : "#666"} 
                  style={styles.languageIcon}
                />
                <Text style={styles.languageText}>हिंदी (Hindi)</Text>
              </Pressable>
            </View>
          ) : modalType === 'crops' ? (
            <TextInput
              value={cropInput}
              onChangeText={setCropInput}
              placeholder={i18n.t('enterCropsCommaSeparated')}
              style={styles.input}
              mode="outlined"
              activeOutlineColor="#4CAF50"
              outlineColor="#E0E0E0"
              multiline
            />
          ) : modalType === 'experience' ? (
            <TextInput
              value={experienceInput}
              onChangeText={setExperienceInput}
              placeholder={i18n.t('enterYourFarmingExperience')}
              style={styles.input}
              mode="outlined"
              activeOutlineColor="#4CAF50"
              outlineColor="#E0E0E0"
              multiline
            />
          ) : (
            <TextInput
              value={tempInput}
              onChangeText={setTempInput}
              placeholder={
                modalType === 'location' ? i18n.t('enterFarmLocation') : i18n.t('enterYourName')
              }
              style={styles.input}
              mode="outlined"
              activeOutlineColor="#4CAF50"
              outlineColor="#E0E0E0"
            />
          )}
          
          <Button 
            mode="contained" 
            onPress={handleSavePreference}
            style={styles.saveButton}
            buttonColor="#4CAF50"
          >
            {i18n.t('save')}
          </Button>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#4CAF50',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 16,
  },
  signOutButton: {
    marginTop: 20,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    position: 'absolute',
    top: '25%', // Center vertically
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  modalDivider: {
    backgroundColor: '#E0E0E0',
    height: 1,
  },
  input: {
    margin: 16,
    backgroundColor: 'white',
  },
  languageOptions: {
    margin: 16,
  },
  languageOption: {
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIcon: {
    marginRight: 10,
  },
  selectedLanguage: {
    backgroundColor: '#E8F5E9',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    margin: 16,
    borderRadius: 8,
  },
  listSubheader: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 8,
  },
  divider: {
    backgroundColor: '#f0f0f0',
    height: 1,
  },
}); 