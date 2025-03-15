import { StyleSheet, Image, Platform, View, Pressable, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { analyzePesticideImage } from '../../utils/openai';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue, 
  withSequence 
} from 'react-native-reanimated';

interface PesticideResult {
  name: string;
  activeIngredients: string[];
  usageQuantity: string;
  applicationInterval: string;
  targetPests: string[];
  applicationMethod: string;
  remarks: string;
  targetCrops: string[];
  confidenceScore: number;
}

export default function PesticideScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PesticideResult | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzePesticideLabel(result.assets[0].uri);
    }
  };

  const analyzePesticideLabel = async (imageUri: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const pesticideData = await analyzePesticideImage(imageUri);
      setResult(pesticideData);
    } catch (error) {
      alert('Failed to analyze the pesticide label. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isAnalyzing) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 1000 })
        ),
        -1
      );
    } else {
      rotation.value = 0;
    }
  }, [isAnalyzing]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Pesticide Label</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.labelImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="text-recognition" size={48} color="#666" />
              <Text style={styles.placeholderText}>Scan pesticide label</Text>
            </View>
          )}
        </View>

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <Animated.View style={animatedStyle}>
              <MaterialCommunityIcons name="loading" size={32} color="#D32F2F" />
            </Animated.View>
            <Text style={styles.loadingText}>Analyzing label...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.pesticideTitle}>{result.name}</Text>
            <Text style={styles.confidenceText}>
              Confidence: {(result.confidenceScore * 100).toFixed(1)}%
            </Text>

            <View style={styles.infoSection}>
              <MaterialCommunityIcons name="flask" size={24} color="#2E7D32" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Active Ingredients</Text>
                {result.activeIngredients.map((ingredient, index) => (
                  <Text key={index} style={styles.infoText}>• {ingredient}</Text>
                ))}
              </View>
            </View>

            <View style={styles.infoSection}>
              <MaterialCommunityIcons name="spray" size={24} color="#1565C0" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Application</Text>
                <Text style={styles.infoText}>Quantity: {result.usageQuantity}</Text>
                <Text style={styles.infoText}>Interval: {result.applicationInterval}</Text>
                <Text style={styles.infoText}>Method: {result.applicationMethod}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <MaterialCommunityIcons name="bug" size={24} color="#D32F2F" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Target Pests</Text>
                {result.targetPests.map((pest, index) => (
                  <Text key={index} style={styles.infoText}>• {pest}</Text>
                ))}
              </View>
            </View>

            <View style={styles.infoSection}>
              <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Target Crops</Text>
                {result.targetCrops.map((crop, index) => (
                  <Text key={index} style={styles.infoText}>• {crop}</Text>
                ))}
              </View>
            </View>

            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.remarksContainer}
            >
              <MaterialCommunityIcons name="information" size={24} color="#2E7D32" />
              <Text style={styles.remarksText}>{result.remarks}</Text>
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
            <MaterialCommunityIcons name="image" size={24} color="#1B1B1B" />
          </View>
          <Text style={styles.actionButtonText}>Gallery</Text>
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
    color: '#D32F2F',
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
  labelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
  pesticideTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  remarksText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
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
