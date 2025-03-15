import { StyleSheet, Image, Platform, View, Pressable, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { analyzeCropDisease } from '../../services/ai/disease-detector';

export default function CropScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
  } | null>(null);

  const handleAnalysis = async (imageUri: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeCropDisease(imageUri);
      setResult({
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Failed to analyze crop disease. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleAnalysis(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analyze Crop</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.cropImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="image-plus" size={48} color="#666" />
              <Text style={styles.placeholderText}>Upload crop image</Text>
            </View>
          )}
        </View>

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={32} color="#2E7D32" />
            <Text style={styles.loadingText}>Analyzing crop...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.diseaseTitle}>{result.prediction}</Text>
            <Text style={styles.confidenceText}>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </Text>
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.treatmentContainer}
            >
              <Text style={styles.treatmentTitle}>Recommended Treatment</Text>
              <Text style={styles.treatmentText}>
                1. Apply copper-based fungicide{'\n'}
                2. Ensure proper drainage{'\n'}
                3. Remove infected leaves{'\n'}
                4. Maintain field hygiene
              </Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.actionButton} 
          onPress={pickImage}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="camera" size={24} color="#1B1B1B" />
          </View>
          <Text style={styles.actionButtonText}>
            {image ? 'Retake Photo' : 'Take Photo'}
          </Text>
        </Pressable>
        
        <View style={styles.divider} />
        
        <Pressable 
          style={styles.actionButton} 
          onPress={pickImage}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="image-multiple" size={24} color="#1B1B1B" />
          </View>
          <Text style={styles.actionButtonText}>Variations</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2E7D32',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  treatmentContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1B1B1B',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 12,
  },
});
