import * as Battery from "expo-battery";
import * as Brightness from "expo-brightness";
import { Index } from "@upstash/vector";

// Initialize Upstash Vector index
const vectorIndex = new Index({
  url: "https://crucial-rooster-59188-us1-vector.upstash.io",
  token: "ABkFMGNydWNpYWwtcm9vc3Rlci01OTE4OC11czFhZG1pbk5qZGlNekF6T0dRdE5HUXlaUzAwT1RBNExXRTFPR0V0T1RJMk5XSmtNemd5TUdJMA==",
});

const clientToolsSchema = [
  {
    type: "function",
    name: "getBatteryLevel",
    description: "Gets the device battery level as decimal point percentage.",
  },
  {
    type: "function",
    name: "searchCropRotation",
    description: "Searches the knowledge base for crop rotation information",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant farming information about crop rotation",
        },
        topK: {
          type: "number",
          description: "Number of results to return (default: 3)",
          default: 3
        }
      },
      required: ["query"]
    },
  },
  {
    type: "function",
    name: "searchSchemes",
    description: "Searches the knowledge base for crop rotation information",
    parameters: {
      type: "object",
      properties: {
        query: {  
          type: "string",
          description: "The search query to find relevant farming information about crop rotation",
        },
        topK: {
          type: "number",
          description: "Number of results to return (default: 3)",
          default: 3
        }
      },
      required: ["query"]
    },
  }
];

const clientTools: Record<string, any> = {
  getBatteryLevel: async () => {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel === -1) {
      return {
        success: false,
        error: "Device does not support retrieving the battery level.",
      };
    }
    return { success: true, batteryLevel };
  },

  searchCropRotation: async ({ query, topK = 3 }: { query: string; topK?: number }) => {
    try {
      const results = await vectorIndex.query({
        data: query,
        topK,
        includeMetadata: true,
        includeData: true
      }, {namespace: "crops"});
      
      console.log(results);

      return {
        success: true,
        results: results.map(result => ({
          content: result.data || '',
          score: result.score
        }))
        // results : "crop rotation is important for soil health"
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search knowledge base'
      };
    }
  },

  searchSchemes: async ({ query, topK = 3 }: { query: string; topK?: number }) => {
    try {
      const results = await vectorIndex.query({
        data: query,
        topK,
        includeMetadata: true,
        includeData: true
      }, {namespace: "schemes"});

      console.log(results);

      return {
        success: true,
        results: results.map(result => ({
          content: result.data || '',
          score: result.score
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search knowledge base'
      };
    }
  }
  

};



export { clientTools, clientToolsSchema };