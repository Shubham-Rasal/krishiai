import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, View, Pressable, ScrollView, Dimensions, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { analyzePesticideImage } from '../../utils/openai';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue, 
  withSequence,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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

interface IngredientBadgeProps {
  name: string;
  value: string;
  position: {
    top: number;
    left?: number;
    right?: number;
  };
}

const IngredientBadge = ({ name, value, position }: IngredientBadgeProps) => {
  return (
    <Animated.View 
      entering={FadeIn.delay(300).duration(500)}
      style={[styles.ingredientBadge, position]}
    >
      <Text style={styles.ingredientName}>{name}</Text>
      <Text style={styles.ingredientValue}>{value}</Text>
    </Animated.View>
  );
};

export default function PesticideScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PesticideResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      // Flash mode is only available on native platforms
      // We'll keep track of the state but handling might differ by platform
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzePesticideLabel(result.assets[0].uri);
    }
  };

  const analyzePesticideLabel = async (imageUri: string) => {
    setIsAnalyzing(true);
    setScanFailed(false);
    setResult(null);

    try {
      const pesticideData = await analyzePesticideImage(imageUri);
      
      if (pesticideData) {
        setResult(pesticideData);
        // After analysis is complete, show the results screen
        setShowResults(true);
      } else {
        setScanFailed(true);
      }
    } catch (error) {
      console.error(error);
      setScanFailed(true);
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

  const resetScan = () => {
    setShowResults(false);
    setImage(null);
    setResult(null);
    setScanFailed(false);
  };

  const retryScan = () => {
    if (image) {
      // If we're in results view, go back to scanner before retrying
      if (showResults) {
        setShowResults(false);
      }
      // Reset scan failure state
      setScanFailed(false);
      // Short delay to allow UI to update before restarting analysis
      setTimeout(() => {
        analyzePesticideLabel(image);
      }, 300);
    } else {
      setScanFailed(false);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Generate some random positions for the floating labels
  const generateBadges = () => {
    if (!result) return [];

    return [
      { 
        name: 'Active Ingredient', 
        value: result.activeIngredients[0] || 'N/A', 
        position: { top: height * 0.05, left: width * 0.12 }
      },
      { 
        name: 'Application', 
        value: result.usageQuantity, 
        position: { top: height * 0.12, right: width * 0.12 }
      },
      { 
        name: 'Target Pest', 
        value: result.targetPests[0] || 'N/A', 
        position: { top: height * 0.22, left: width * 0.18 }
      },
      { 
        name: 'Interval', 
        value: result.applicationInterval, 
        position: { top: height * 0.18, right: width * 0.18 }
      },
    ];
  };

  const renderScannerScreen = () => {
    return (
      <>
        <View style={styles.scannerHeader}>
          <TouchableOpacity style={styles.backButton} onPress={resetScan}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pesticide Scanner</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scannerWrapper}>
          <View style={styles.scannerContainer}>
            {image ? (
              <View style={styles.capturedImageContainer}>
                <Image source={{ uri: image }} style={styles.capturedImage} />
                
                {isAnalyzing && (
                  <View style={styles.loadingOverlay}>
                    <Animated.View style={animatedStyle}>
                      <MaterialCommunityIcons name="loading" size={40} color="#fff" />
                    </Animated.View>
                    <Text style={styles.loadingText}>Analyzing pesticide...</Text>
                  </View>
                )}
                
                {scanFailed && (
                  <View style={styles.errorOverlay}>
                    <FontAwesome5 name="exclamation-triangle" size={40} color="white" />
                    <Text style={styles.errorText}>Scan failed</Text>
                    <Text style={styles.errorSubText}>Unable to analyze the image</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={retryScan}
                      >
                        <FontAwesome5 name="redo" size={18} color="#2E7D32" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.scanButton}
                        onPress={resetScan}
                      >
                        <FontAwesome5 name="camera" size={18} color="white" />
                        <Text style={styles.scanButtonText}>New Scan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <>
                <View style={styles.scanFrame}>
                  <View style={styles.scannerCorner} />
                  <View style={[styles.scannerCorner, { top: 0, right: 0, transform: [{ rotate: '90deg' }] }]} />
                  <View style={[styles.scannerCorner, { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] }]} />
                  <View style={[styles.scannerCorner, { bottom: 0, left: 0, transform: [{ rotate: '270deg' }] }]} />
                </View>
                <Text style={styles.scannerInstructionText}>Position pesticide label in frame</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.scannerFooter}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionIconButton} onPress={pickImage}>
              <FontAwesome5 name="images" size={22} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mainCaptureButton} onPress={takePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionIconButton, 
                flashEnabled && styles.actionIconButtonActive
              ]} 
              onPress={toggleFlash}
            >
              <MaterialCommunityIcons 
                name={flashEnabled ? "flash" : "flash-off"} 
                size={24} 
                color={flashEnabled ? "#4CAF50" : "#666"} 
              />
            </TouchableOpacity>
          </View>
          
        </View>
      </>
    );
  };

  const renderResultsScreen = () => {
    if (!result) return null;

    // Generate badges for result details
    const badges = generateBadges();

    return (
      <Animated.View 
        style={styles.resultsContainer}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
      >
        <View style={styles.resultsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={resetScan}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pesticide Details</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsImageContainer}>
          {image && <Image source={{ uri: image }} style={styles.resultsImage} />}
          
         
        </View>
        
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.resultTitle}>{result.name}</Text>
            
           
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <FontAwesome5 name="flask" size={18} color="#D32F2F" />
              <Text style={styles.statsLabel}>Active Ingr.</Text>
              <Text style={styles.statsValue}>{result.activeIngredients.length}</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="tint" size={18} color="#1565C0" />
              <Text style={styles.statsLabel}>Quantity</Text>
              <Text style={styles.statsValue}>{result.usageQuantity}</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="bug" size={18} color="#2E7D32" />
              <Text style={styles.statsLabel}>Pests</Text>
              <Text style={styles.statsValue}>{result.targetPests.length}</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="seedling" size={18} color="#F57C00" />
              <Text style={styles.statsLabel}>Crops</Text>
              <Text style={styles.statsValue}>{result.targetCrops.length}</Text>
            </View>
          </View>
          
          <View style={styles.safetyScore}>
            <Text style={styles.safetyScoreLabel}>Safety score</Text>
            <View style={styles.safetyScoreBar}>
              <View style={[styles.safetyScoreFill, { width: `${result.confidenceScore * 100}%` }]} />
            </View>
            <Text style={styles.safetyScoreValue}>{(result.confidenceScore * 10).toFixed(1)}/10</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Active Ingredients</Text>
            {result.activeIngredients.map((ingredient, index) => (
              <Text key={index} style={styles.sectionItem}>• {ingredient}</Text>
            ))}
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Application Method</Text>
            <Text style={styles.sectionText}>{result.applicationMethod}</Text>
            <Text style={styles.sectionSubtitle}>Interval: {result.applicationInterval}</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Target Pests</Text>
            <View style={styles.tagsContainer}>
              {result.targetPests.map((pest, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{pest}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Target Crops</Text>
            <View style={styles.tagsContainer}>
              {result.targetCrops.map((crop, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{crop}</Text>
                </View>
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
        </ScrollView>
        
        <View style={styles.resultsFooter}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={retryScan}
            >
              <FontAwesome5 name="redo" size={18} color="#2E7D32" />
              <Text style={styles.secondaryButtonText}>Retry Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={resetScan}
            >
              <FontAwesome5 name="check" size={18} color="white" />
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {showResults ? renderResultsScreen() : renderScannerScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 16,
  },
  // Scanner Screen Styles
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scannerContainer: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32', // Darker green for better contrast
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: 0,
    left: 0,
  },
  capturedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 20,
  },
  errorSubText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scanButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 56,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  resultsImageContainer: {
    height: height * 0.3,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  resultsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ingredientBadge: {
    position: 'absolute',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 100,
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ingredientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 120,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  safetyScore: {
    marginVertical: 16,
  },
  safetyScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  safetyScoreBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginVertical: 8,
    overflow: 'hidden',
  },
  safetyScoreFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  safetyScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'flex-end',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  remarksText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  resultsFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginBottom: 90,
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  scannerInstructionText: {
    position: 'absolute',
    bottom: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCaptureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32', // Match the green theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2E7D32', // Match the green theme
  },
  actionIconButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  scannerFooter: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
