import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, Platform, View, Pressable, ScrollView, Alert, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { analyzeCropDisease } from '../../services/ai/disease-detector';
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

// Feature flags
const CROP_SCAN_ENABLED = false; // Set to false for production
const DEV_TEST_ENABLED = false; // Toggle this during development to test the feature

// Add the interface for IngredientBadge props
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

export default function CropScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
  } | null>(null);

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

  const handleAnalysis = async (imageUri: string) => {
    setIsAnalyzing(true);
    setScanFailed(false);
    setResult(null);

    try {
      const analysisResult = await analyzeCropDisease(imageUri);
      setResult({
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      setScanFailed(true);
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
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleAnalysis(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleAnalysis(result.assets[0].uri);
    }
  };

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
        handleAnalysis(image);
      }, 300);
    } else {
      setScanFailed(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Generate some random positions for the floating labels
  const generateBadges = () => {
    if (!result) return [];

    return [
      { 
        name: 'Disease', 
        value: result.prediction.split(' ')[0] || 'N/A', 
        position: { top: height * 0.05, left: width * 0.12 }
      },
      { 
        name: 'Confidence', 
        value: `${(result.confidence * 100).toFixed(0)}%`, 
        position: { top: height * 0.12, right: width * 0.12 }
      },
      { 
        name: 'Treatment', 
        value: 'Fungicide', 
        position: { top: height * 0.22, left: width * 0.18 }
      },
      { 
        name: 'Severity', 
        value: result.confidence > 0.7 ? 'High' : 'Medium', 
        position: { top: height * 0.18, right: width * 0.18 }
      },
    ];
  };

  // Render Coming Soon screen when feature is disabled
  const renderComingSoon = () => {
    return (
      <View style={styles.comingSoonContainer}>
        <FontAwesome5 name="seedling" size={60} color="#2E7D32" />
        <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
        <Text style={styles.comingSoonText}>
          Our crop disease analysis feature is currently under development.
          Check back soon for intelligent crop health diagnosis.
        </Text>
      </View>
    );
  };

  const renderScannerScreen = () => {
    return (
      <>
        <View style={styles.scannerHeader}>
          <TouchableOpacity style={styles.backButton} onPress={resetScan}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crop Disease Scanner</Text>
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
                    <Text style={styles.loadingText}>Analyzing crop disease...</Text>
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
                  <View style={styles.scannerFrameSquare} />
                </View>
                <View style={styles.instructionContainer}>
                  <Text style={styles.scannerInstructionText}>Position crop leaf in frame</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.scannerFooter}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionIconButton} onPress={pickImage}>
              <FontAwesome5 name="images" size={22} color="#2E7D32" />
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
              <FontAwesome5 
                name={flashEnabled ? "bolt" : "bolt-slash"} 
                size={22} 
                color={flashEnabled ? "#2E7D32" : "#666"} 
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
          <Text style={styles.headerTitle}>Disease Details</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsImageContainer}>
          {image && <Image source={{ uri: image }} style={styles.resultsImage} />}
          
          {/* Add floating badges */}
          {badges.map((badge, index) => (
            <IngredientBadge
              key={index}
              name={badge.name}
              value={badge.value}
              position={badge.position}
            />
          ))}
        </View>
        
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.resultTitle}>{result.prediction}</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <FontAwesome5 name="disease" size={18} color="#D32F2F" />
              <Text style={styles.statsLabel}>Disease Type</Text>
              <Text style={styles.statsValue}>Fungal</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="tint" size={18} color="#1565C0" />
              <Text style={styles.statsLabel}>Spread</Text>
              <Text style={styles.statsValue}>Moderate</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="calendar-alt" size={18} color="#2E7D32" />
              <Text style={styles.statsLabel}>Treatment</Text>
              <Text style={styles.statsValue}>7-14 days</Text>
            </View>
            
            <View style={styles.statsItem}>
              <FontAwesome5 name="seedling" size={18} color="#F57C00" />
              <Text style={styles.statsLabel}>Recovery</Text>
              <Text style={styles.statsValue}>Likely</Text>
            </View>
          </View>
          
          <View style={styles.safetyScore}>
            <Text style={styles.safetyScoreLabel}>Confidence level</Text>
            <View style={styles.safetyScoreBar}>
              <View style={[styles.safetyScoreFill, { width: `${result.confidence * 100}%` }]} />
            </View>
            <Text style={styles.safetyScoreValue}>{(result.confidence * 10).toFixed(1)}/10</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            <Text style={styles.sectionItem}>• Yellowing or browning of leaves</Text>
            <Text style={styles.sectionItem}>• Spots on leaves and stems</Text>
            <Text style={styles.sectionItem}>• Wilting despite adequate watering</Text>
            <Text style={styles.sectionItem}>• Stunted growth or deformation</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Recommended Treatment</Text>
            <Text style={styles.sectionItem}>• Apply copper-based fungicide</Text>
            <Text style={styles.sectionItem}>• Ensure proper drainage</Text>
            <Text style={styles.sectionItem}>• Remove infected leaves</Text>
            <Text style={styles.sectionItem}>• Maintain field hygiene</Text>
          </View>
          
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.remarksContainer}
          >
            <MaterialCommunityIcons name="information" size={24} color="#2E7D32" />
            <Text style={styles.remarksText}>
              Early detection and treatment can save up to 80% of your crop yield.
              For serious infections, consider consulting with an agricultural expert.
            </Text>
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
      {!CROP_SCAN_ENABLED && !DEV_TEST_ENABLED ? renderComingSoon() : (
        showResults ? renderResultsScreen() : renderScannerScreen()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 16,
  },
  // Coming Soon styles
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 24,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#2E7D32', // Match the screenshot exactly
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrameSquare: {
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
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
  detailsContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
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
    marginBottom: 16,
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
  instructionContainer: {
    position: 'absolute',
    bottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerInstructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
  },
  actionIconButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  scannerFooter: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
});
