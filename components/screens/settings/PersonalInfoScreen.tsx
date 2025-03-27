import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useLanguage } from '@/utils/LanguageContext';
import { getPreferences, savePreferences, FarmPreferences } from '@/utils/preferences';
import { LinearGradient } from 'expo-linear-gradient';

interface PersonalInfoScreenProps {
  onClose: () => void;
  onSave: () => void;
}

export default function PersonalInfoScreen({ onClose, onSave }: PersonalInfoScreenProps) {
  const { user } = useUser();
  const { i18n } = useLanguage();
  const [preferences, setPreferences] = useState<FarmPreferences>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
    
    // Initialize with user data from Clerk if available
    if (user?.firstName) {
      setFirstName(user.firstName);
    }
    if (user?.lastName) {
      setLastName(user.lastName);
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setPreferences(prefs);
      
      // Load saved values from preferences if available
    //   if (prefs.personalDetails?.firstName) {
    //     setFirstName(prefs.personalDetails.firstName);
    //   }
    //   if (prefs.personalDetails?.lastName) {
    //     setLastName(prefs.personalDetails.lastName);
    //   }
    //   if (prefs.personalDetails?.dateOfBirth) {
    //     setDateOfBirth(prefs.personalDetails.dateOfBirth);
    //   }
    //   if (prefs.personalDetails?.gender) {
    //     setGender(prefs.personalDetails.gender);
    //   }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update preferences with form values
      const updatedPreferences = { 
        ...preferences,
        personalDetails: {
          ...preferences.personalDetails,
          firstName,
          lastName,
          dateOfBirth,
          gender
        }
      };
      
      await savePreferences(updatedPreferences);
      onSave();
    } catch (error) {
      console.error('Error saving personal information:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGenderSelector = () => {
    // This would typically open a selector or dropdown
    // For now, we're just cycling through some options as an example
    const options = ['Male', 'Female', 'Other', 'Prefer not to say'];
    const currentIndex = options.indexOf(gender);
    const nextIndex = (currentIndex + 1) % options.length;
    setGender(options[nextIndex] || 'Male');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with Save button */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity 
          style={[styles.headerSaveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.headerSaveButtonText}>{i18n.t('save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Image Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#AAAAAA"
              keyboardType="numeric"
            />
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <Pressable onPress={openGenderSelector} style={styles.selectInput}>
              <Text style={styles.selectInputText}>
                {gender || "Select gender"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
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
    backgroundColor: '#1E1B4B',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 16,
  },
  headerSaveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  headerSaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(158, 158, 158, 0.4)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    paddingBottom: 24,
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  editProfileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editProfileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 16,
    color: '#333',
  },
}); 