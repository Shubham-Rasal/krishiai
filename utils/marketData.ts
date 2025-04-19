import { getPreferences } from './preferences';

// Feature flag to control preference-based content
const USE_USER_PREFERENCES = false;

export interface MarketPrice {
  id: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

/**
 * Fetches market prices for crops
 * In a real app, this would call an API
 */
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  try {
    // In a real app, we would use user preferences to filter the data
    let userCrops: string[] = [];
    
    if (USE_USER_PREFERENCES) {
      const prefs = await getPreferences();
      userCrops = prefs.crops || [];
    }
    
    // Mock data for crop prices
    const mockPrices: MarketPrice[] = [
      {
        id: '1',
        name: 'Rice',
        price: '₹2,450/q',
        change: '2.5%',
        isUp: true
      },
      {
        id: '2',
        name: 'Wheat',
        price: '₹2,100/q',
        change: '1.8%',
        isUp: true
      },
      {
        id: '3',
        name: 'Corn',
        price: '₹1,850/q',
        change: '0.7%',
        isUp: false
      },
      {
        id: '4',
        name: 'Soybean',
        price: '₹4,200/q',
        change: '3.2%',
        isUp: true
      },
      {
        id: '5',
        name: 'Cotton',
        price: '₹6,300/q',
        change: '1.3%',
        isUp: false
      },
      {
        id: '6',
        name: 'Sugarcane',
        price: '₹280/q',
        change: '0.5%',
        isUp: true
      },
      {
        id: '7',
        name: 'Potato',
        price: '₹1,250/q',
        change: '4.1%',
        isUp: true
      },
      {
        id: '8',
        name: 'Tomato',
        price: '₹1,800/q',
        change: '5.3%',
        isUp: false
      }
    ];
    
    // If user has specified crops in preferences and feature flag is enabled, filter to prioritize those
    if (USE_USER_PREFERENCES && userCrops.length > 0) {
      // Sort the prices so user's crops come first
      return mockPrices.sort((a, b) => {
        const aIsUserCrop = userCrops.some(crop => 
          a.name.toLowerCase().includes(crop.toLowerCase())
        );
        const bIsUserCrop = userCrops.some(crop => 
          b.name.toLowerCase().includes(crop.toLowerCase())
        );
        
        if (aIsUserCrop && !bIsUserCrop) return -1;
        if (!aIsUserCrop && bIsUserCrop) return 1;
        return 0;
      });
    }
    
    return mockPrices;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return [];
  }
} 