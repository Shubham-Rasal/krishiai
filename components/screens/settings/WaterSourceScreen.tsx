import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useLanguage } from '@/utils/LanguageContext';
import { getPreferences, savePreferences, FarmPreferences } from '@/utils/preferences';

interface WaterSourceScreenProps {
  onClose: () => void;
  onSave: () => void;
}

export default function WaterSourceScreen({ onClose, onSave }: WaterSourceScreenProps) {
  const { i18n } = useLanguage();
  const [preferences, setPreferences] = useState<FarmPreferences>({});
  const [primaryWaterSource, setPrimaryWaterSource] = useState('');
  const [secondaryWaterSource, setSecondaryWaterSource] = useState('');
  const [irrigationSystem, setIrrigationSystem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setPreferences(prefs);
      
      // Load saved values from preferences if available
      if (prefs.waterDetails?.primarySource) {
        setPrimaryWaterSource(prefs.waterDetails.primarySource);
      }
      if (prefs.waterDetails?.secondarySource) {
        setSecondaryWaterSource(prefs.waterDetails.secondarySource);
      }
      if (prefs.waterDetails?.irrigationSystem) {
        setIrrigationSystem(prefs.waterDetails.irrigationSystem);
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
        waterDetails: {
          ...preferences.waterDetails,
          primarySource: primaryWaterSource,
          secondarySource: secondaryWaterSource,
          irrigationSystem: irrigationSystem
        }
      };
      
      await savePreferences(updatedPreferences);
      onSave();
    } catch (error) {
      console.error('Error saving water source details:', error);
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
        <Text style={styles.headerTitle}>{i18n.t('waterSources')}</Text>
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
          {/* Primary Water Source */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('primaryWaterSource')}</Text>
            <TextInput
              style={styles.input}
              value={primaryWaterSource}
              onChangeText={setPrimaryWaterSource}
              placeholder="e.g. Well, Canal"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Secondary Water Source */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('secondaryWaterSource')}</Text>
            <TextInput
              style={styles.input}
              value={secondaryWaterSource}
              onChangeText={setSecondaryWaterSource}
              placeholder="e.g. Rain water harvesting"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          {/* Irrigation System */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{i18n.t('irrigationSystem')}</Text>
            <TextInput
              style={styles.input}
              value={irrigationSystem}
              onChangeText={setIrrigationSystem}
              placeholder="e.g. Drip irrigation, Sprinkler"
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