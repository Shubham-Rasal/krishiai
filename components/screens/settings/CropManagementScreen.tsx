import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useLanguage } from '@/utils/LanguageContext';
import { getPreferences, savePreferences, FarmPreferences } from '@/utils/preferences';

interface CropManagementScreenProps {
  onClose: () => void;
  onSave: () => void;
}

export default function CropManagementScreen({ onClose, onSave }: CropManagementScreenProps) {
  const { i18n } = useLanguage();
  const [preferences, setPreferences] = useState<FarmPreferences>({});
  const [cropText, setCropText] = useState('');
  const [cropsList, setCropsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setPreferences(prefs);
      
      // Load saved crops from preferences if available
      if (prefs.crops && Array.isArray(prefs.crops) && prefs.crops.length > 0) {
        setCropsList(prefs.crops);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleAddCrop = () => {
    if (cropText.trim() === '') return;
    
    setCropsList([...cropsList, cropText.trim()]);
    setCropText('');
  };

  const handleRemoveCrop = (index: number) => {
    const updatedCrops = [...cropsList];
    updatedCrops.splice(index, 1);
    setCropsList(updatedCrops);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update preferences with crops list
      const updatedPreferences = { 
        ...preferences,
        crops: cropsList
      };
      
      await savePreferences(updatedPreferences);
      onSave();
    } catch (error) {
      console.error('Error saving crops:', error);
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
        <Text style={styles.headerTitle}>{i18n.t('cropManagement')}</Text>
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
          <Text style={styles.sectionTitle}>{i18n.t('manageCrops')}</Text>
          
          {/* Add new crop */}
          <View style={styles.addCropContainer}>
            <TextInput
              style={styles.input}
              value={cropText}
              onChangeText={setCropText}
              placeholder={i18n.t('enterCropName')}
              placeholderTextColor="#AAAAAA"
              returnKeyType="done"
              onSubmitEditing={handleAddCrop}
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddCrop}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Crops list */}
          <View style={styles.cropsListContainer}>
            <Text style={styles.cropsListTitle}>{i18n.t('yourCrops')}</Text>
            
            {cropsList.length === 0 ? (
              <Text style={styles.emptyListText}>{i18n.t('noCropsAdded')}</Text>
            ) : (
              cropsList.map((crop, index) => (
                <View key={index} style={styles.cropItem}>
                  <MaterialCommunityIcons name="sprout" size={20} color="#4CAF50" style={styles.cropIcon} />
                  <Text style={styles.cropText}>{crop}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveCrop(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              ))
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addCropContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#1E1B4B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropsListContainer: {
    marginTop: 8,
  },
  cropsListTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  cropIcon: {
    marginRight: 10,
  },
  cropText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  emptyListText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(158, 158, 158, 0.4)',
  },
}); 