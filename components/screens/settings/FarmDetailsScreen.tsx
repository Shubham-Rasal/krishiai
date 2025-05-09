import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useLanguage } from '@/utils/LanguageContext';
import { getPreferences, savePreferences, FarmPreferences } from '@/utils/preferences';

interface FarmDetailsScreenProps {
  onClose: () => void;
  onSave: () => void;
}

export default function FarmDetailsScreen({ onClose, onSave }: FarmDetailsScreenProps) {
  const { i18n } = useLanguage();
  const [preferences, setPreferences] = useState<FarmPreferences>({});
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setPreferences(prefs);
      
      // Load saved values from preferences if available
      if (prefs.farmDetails?.location) {
        setFarmLocation(prefs.farmDetails.location);
      }
      if (prefs.farmDetails?.size) {
        setFarmSize(prefs.farmDetails.size);
      }
      if (prefs.farmDetails?.soilType) {
        setSoilType(prefs.farmDetails.soilType);
      }
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
        farmDetails: {
          ...preferences.farmDetails,
          location: farmLocation,
          size: farmSize,
          soilType: soilType
        }
      };
      
      await savePreferences(updatedPreferences);
      onSave();
    } catch (error) {
      console.error('Error saving farm details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with Save button */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n.t('farmDetails')}</Text>
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
        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Farm Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('farmLocation')}</Text>
            <TextInput
              style={styles.input}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="e.g. Punjab"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Farm Size */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('farmSize')}</Text>
            <TextInput
              style={styles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              placeholder="e.g. 5 acres"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Soil Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('soilType')}</Text>
            <TextInput
              style={styles.input}
              value={soilType}
              onChangeText={setSoilType}
              placeholder="e.g. Clay, Loam"
              placeholderTextColor="#AAAAAA"
            />
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
}); 