import { Platform } from 'react-native';

const API_URL = Platform.select({
  // Use localhost for iOS simulator
  ios: 'http://localhost:5000',
  // Use 10.0.2.2 for Android emulator (special alias to host loopback interface)
  android: 'http://43.204.227.45:5000',
  default: 'http://localhost:5000'
});

export async function analyzeCropDisease(imageUri: string) {
  try {
    const formData = new FormData();
    const fileName = imageUri.split('/').pop();
    
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg'
    } as any);

    console.log(API_URL); 

    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in disease analysis:', error);
    throw error;
  }
} 