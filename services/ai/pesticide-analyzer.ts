import { uploadImage } from '../storage/imageUpload';
import { supabase } from '../supabase';

export async function analyzePesticideLabel(imageUri: string) {
  try {
    // Upload image to storage
    const imageUrl = await uploadImage(imageUri);

    // Call your AI service endpoint
    const response = await fetch('YOUR_AI_SERVICE_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const results = await response.json();

    // Store the results in the database
    await supabase.from('pesticide_scans').insert({
      image_url: imageUrl,
      ocr_text: results.ocrText,
      active_ingredients: results.activeIngredients,
      hazard_level: results.hazardLevel,
      safety_guidelines: results.safetyGuidelines,
      usage_instructions: results.usageInstructions,
      storage_guidelines: results.storageGuidelines,
      environmental_warnings: results.environmentalWarnings,
      first_aid_measures: results.firstAidMeasures,
      ai_confidence_score: results.confidenceScore,
    });

    return results;
  } catch (error) {
    console.error('Error in pesticide analysis:', error);
    throw error;
  }
} 