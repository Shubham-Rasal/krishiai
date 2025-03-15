import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Button, Modal, TextInput } from 'react-native-paper';
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
  const [modalType, setModalType] = useState<'location' | 'crops' | 'personal' | 'language'>();
  const [tempInput, setTempInput] = useState('');
  const [cropInput, setCropInput] = useState('');
  const { i18n, changeLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getPreferences();
    setPreferences(prefs);
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
    } else if (modalType === 'language') {
      updatedPreferences.language = selectedLanguage;
      changeLanguage(selectedLanguage);
    }

    await savePreferences(updatedPreferences);
    setPreferences(updatedPreferences);
    setModalVisible(false);
  };

  const openModal = (type: 'location' | 'crops' | 'personal' | 'language') => {
    setModalType(type);
    if (type === 'location') {
      setTempInput(preferences.location || '');
    } else if (type === 'crops') {
      setCropInput(preferences.crops?.join(', ') || '');
    } else if (type === 'personal') {
      setTempInput(preferences.personalDetails?.name || '');
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
            <MaterialCommunityIcons name="account" size={24} color="#333" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('personalDetails')}</Text>
              <Text style={styles.menuSubText}>{preferences.personalDetails?.name || i18n.t('notSet')}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => openModal('location')}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#333" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('farmLocation')}</Text>
              <Text style={styles.menuSubText}>{preferences.location || i18n.t('notSet')}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => openModal('crops')}>
            <MaterialCommunityIcons name="sprout" size={24} color="#333" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('cropManagement')}</Text>
              <Text style={styles.menuSubText}>
                {preferences.crops?.join(', ') || i18n.t('noCropsAdded')}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('preferences')}</Text>
          <Pressable style={styles.menuItem} onPress={() => openModal('language')}>
            <MaterialCommunityIcons name="translate" size={24} color="#333" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuText}>{i18n.t('language')}</Text>
              <Text style={styles.menuSubText}>
                {currentLanguage === 'hi' ? 'हिंदी' : 'English'}
              </Text>
            </View>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="microphone" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('voiceSettings')}</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('notifications')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('dataPrivacy')}</Text>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="database" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('offlineStorage')}</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-lock" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('privacySettings')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support')}</Text>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('help')}</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="information" size={24} color="#333" />
            <Text style={styles.menuText}>{i18n.t('aboutKrishiAI')}</Text>
          </Pressable>
        </View>

        <List.Section>
          <List.Subheader>{i18n.t('account')}</List.Subheader>
          <List.Item
            title={user?.primaryEmailAddress?.emailAddress || i18n.t('noEmail')}
            description={i18n.t('email')}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title={user?.fullName || i18n.t('noName')}
            description={i18n.t('name')}
            left={props => <List.Icon {...props} icon="account" />}
          />
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
          <Text style={styles.modalTitle}>
            {modalType === 'location' ? i18n.t('farmLocation') : 
             modalType === 'crops' ? i18n.t('manageCrops') : 
             modalType === 'language' ? i18n.t('selectLanguage') : 
             i18n.t('personalDetails')}
          </Text>
          
          {modalType === 'language' ? (
            <View style={styles.languageOptions}>
              <Pressable 
                style={[styles.languageOption, selectedLanguage === 'en' && styles.selectedLanguage]} 
                onPress={() => handleLanguageChange('en')}>
                <Text style={styles.languageText}>English</Text>
              </Pressable>
              <Pressable 
                style={[styles.languageOption, selectedLanguage === 'hi' && styles.selectedLanguage]} 
                onPress={() => handleLanguageChange('hi')}>
                <Text style={styles.languageText}>हिंदी (Hindi)</Text>
              </Pressable>
            </View>
          ) : modalType === 'crops' ? (
            <TextInput
              value={cropInput}
              onChangeText={setCropInput}
              placeholder={i18n.t('enterCropsCommaSeparated')}
              style={styles.input}
            />
          ) : (
            <TextInput
              value={tempInput}
              onChangeText={setTempInput}
              placeholder={
                modalType === 'location' ? i18n.t('enterFarmLocation') : i18n.t('enterYourName')
              }
              style={styles.input}
            />
          )}
          <Button mode="contained" onPress={handleSavePreference}>
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
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
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
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  languageOptions: {
    marginBottom: 15,
  },
  languageOption: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedLanguage: {
    backgroundColor: '#e0f2f1',
    borderWidth: 1,
    borderColor: '#26a69a',
  },
  languageText: {
    fontSize: 16,
  },
}); 