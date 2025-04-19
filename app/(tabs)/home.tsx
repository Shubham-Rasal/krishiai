import { View, Text, StyleSheet, ScrollView, Pressable, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Portal, Provider } from 'react-native-paper';
import { Settings } from '@/components/screens/settings';
import MarketPriceTicker from '@/components/MarketPriceTicker';
import NewsFeed from '@/components/NewsFeed';
import NewsArticleDetail from '@/components/NewsArticleDetail';
import { fetchMarketPrices, MarketPrice } from '@/utils/marketData';
import { useLanguage } from '@/utils/LanguageContext';

interface Field {
  id: string;
  name: string;
  status: string;
  location: string;
  coordinates: string;
  hectares: number;
  activityCount: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  date: string;
  url: string;
}

// Default market prices as fallback
const DEFAULT_MARKET_PRICES: MarketPrice[] = [
  {
    id: 'default-1',
    name: 'Rice',
    price: '₹2,450/q',
    change: '2.5%',
    isUp: true
  },
  {
    id: 'default-2',
    name: 'Wheat',
    price: '₹2,100/q',
    change: '1.8%',
    isUp: true
  },
  {
    id: 'default-3',
    name: 'Corn',
    price: '₹1,850/q',
    change: '0.7%',
    isUp: false
  }
];

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { i18n } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(DEFAULT_MARKET_PRICES);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Mock data for fields
  const [fields, setFields] = useState<Field[]>([
    {
      id: '1',
      name: 'Rice Field Premium Plot R8',
      status: 'Towards Harvest',
      location: 'Main Area',
      coordinates: "7°47'44.1\"S, 110°22'02.1\"E",
      hectares: 5.2,
      activityCount: 12
    },
    {
      id: '2',
      name: 'Corn Field Plot R8',
      status: 'Early Growth',
      location: 'North Area',
      coordinates: "7°47'50.3\"S, 110°22'10.5\"E",
      hectares: 3.8,
      activityCount: 8
    }
  ]);
  
  // Weather data
  const [weather, setWeather] = useState({
    temperature: '16°C',
    condition: 'Partly Cloudy',
    windSpeed: '2.4 km/h',
    humidity: '72.5%',
    date: 'Dec 24',
    time: '7:30 AM'
  });
  
  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Load market prices
    loadMarketPrices();
    
    return () => clearInterval(timer);
  }, []);
  
  const loadMarketPrices = async () => {
    try {
      setPricesLoading(true);
      const prices = await fetchMarketPrices();
      if (prices && prices.length > 0) {
        setMarketPrices(prices);
      }
    } catch (error) {
      console.error('Error loading market prices:', error);
      // Keep the default prices if there's an error
    } finally {
      setPricesLoading(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSettingsPress = () => {
    setSettingsVisible(true);
  };
  
  const handleCloseSettings = () => {
    setSettingsVisible(false);
  };
  
  const handleArticlePress = (article: NewsArticle) => {
    setSelectedArticle(article);
  };
  
  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  return (
    <Provider>
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={handleCloseSettings}
          contentContainerStyle={styles.settingsModal}
        >
          <Settings onClose={handleCloseSettings} isModal={true} />
        </Modal>
        
        {selectedArticle && (
          <Modal
            visible={!!selectedArticle}
            onDismiss={handleCloseArticle}
            contentContainerStyle={styles.articleModal}
          >
            <NewsArticleDetail article={selectedArticle} onClose={handleCloseArticle} />
          </Modal>
        )}
      </Portal>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header with background image */}
        <ImageBackground
          source={require('@/assets/images/homebg.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.backgroundImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)']}
            style={styles.gradientOverlay}
          >
            {/* Location and profile */}
            <View style={styles.topBar}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="white" />
                <Text style={styles.locationText}>sdfd</Text>
              </View>
              <View style={styles.profileSection}>
                <Pressable 
                  style={styles.settingsButton}
                  onPress={handleSettingsPress}
                >
                  <View style={styles.settingsIconContainer}>
                    <Ionicons name="settings-outline" size={22} color="white" style={styles.settingsIcon} />
                  </View>
                </Pressable>
              </View>
            </View>
            
            {/* Greeting and Weather */}
            <View style={styles.weatherContainer}>
              <View>
                <Text style={styles.greeting}>Hi, Good Morning!</Text>
                <Text style={styles.temperature}>{weather.temperature}</Text>
                <View style={styles.weatherDetailRow}>
                  <View style={styles.weatherDetail}>
                    <MaterialCommunityIcons name="weather-windy" size={14} color="white" />
                    <Text style={styles.weatherDetailText}>{weather.windSpeed}</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="water-outline" size={14} color="white" />
                    <Text style={styles.weatherDetailText}>{weather.humidity}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <View style={styles.weatherCondition}>
                  <Ionicons name="partly-sunny-outline" size={20} color="white" />
                  <Text style={styles.conditionText}>{weather.condition}</Text>
                </View>
                <Text style={styles.dateText}>{formatTime(currentTime)} | {formatDate(currentTime)}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        
        {/* Market Price Ticker */}
        <MarketPriceTicker prices={marketPrices} />
        
        {/* Fields Section */}
        {/* <View style={styles.fieldsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('ourAgricultureField') || 'Our agriculture field'}</Text>
            <Pressable>
              <Text style={styles.viewMapText}>{i18n.t('viewMap') || 'View Map'}</Text>
            </Pressable>
          </View>
          
          {fields.map((field) => (
            <View key={field.id} style={styles.fieldCard}>
              <ImageBackground 
                source={require('@/assets/images/farm-background.jpg')} 
                style={styles.fieldImage}
                imageStyle={styles.fieldImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
                  style={styles.fieldImageOverlay}
                />
              </ImageBackground>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldName}>{field.name}</Text>
                <Text style={styles.fieldCoordinates}>{field.coordinates}</Text>
                <View style={styles.fieldStatusBadge}>
                  <Text style={styles.fieldStatusText}>{field.status}</Text>
                </View>
                <View style={styles.fieldStats}>
                  <View style={styles.fieldStat}>
                    <Ionicons name="resize-outline" size={16} color="#666" />
                    <Text style={styles.fieldStatText}>{field.hectares} ha</Text>
                  </View>
                  <View style={styles.fieldStat}>
                    <Ionicons name="list-outline" size={16} color="#666" />
                    <Text style={styles.fieldStatText}>{field.activityCount} Activity</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View> */}
        
        {/* News Feed */}
        <NewsFeed onArticlePress={handleArticlePress} isNestedInScrollView={true} />
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  headerBackground: {
    height: 220,
    width: '100%',
  },
  backgroundImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginRight: 8,
  },
  settingsIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
  },
  settingsIcon: {
    
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  temperature: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  weatherDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherDetailText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  conditionText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
  },
  fieldsSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewMapText: {
    fontSize: 12,
    color: '#1976D2',
  },
  fieldCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  fieldImage: {
    height: 100,
    width: '100%',
  },
  fieldImageStyle: {
    
  },
  fieldImageOverlay: {
    height: '100%',
    width: '100%',
  },
  fieldContent: {
    padding: 16,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fieldCoordinates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  fieldStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  fieldStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  fieldStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  settingsModal: {
    flex: 1,
    backgroundColor: 'white',
    margin: 0,
    borderRadius: 0,
  },
  articleModal: {
    flex: 1,
    backgroundColor: 'white',
    margin: 0,
    borderRadius: 0,
  },
}); 