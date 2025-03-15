import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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

// Define the Zod schema for pesticide analysis
const PesticideSchema = z.object({
  name: z.string(),
  activeIngredients: z.array(z.string()),
  usageQuantity: z.string(),
  applicationInterval: z.string(),
  targetPests: z.array(z.string()),
  applicationMethod: z.string(),
  remarks: z.string(),
  targetCrops: z.array(z.string()),
  confidenceScore: z.number()
});

export async function analyzePesticideImage(imageUri: string): Promise<z.infer<typeof PesticideSchema>> {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log(process.env.EXPO_PUBLIC_OPENAI_API_KEY);

    const openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
    });

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this pesticide label and extract the required information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      response_format: zodResponseFormat(PesticideSchema, "pesticide"),
      max_tokens: 500,
    });

    if (!completion.choices[0].message.parsed) {
      throw new Error('No parsed data found');
    }

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error('Error analyzing pesticide image:', error);
    throw error;
  }
} 