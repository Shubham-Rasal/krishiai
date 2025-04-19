import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/utils/LanguageContext';
import { getPreferences } from '@/utils/preferences';

// Feature flag to control preference-based content
const USE_USER_PREFERENCES = false;

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  date: string;
  url: string;
}

interface NewsFeedProps {
  onArticlePress: (article: NewsArticle) => void;
  isNestedInScrollView?: boolean;
}

const NewsFeed = ({ onArticlePress, isNestedInScrollView = false }: NewsFeedProps) => {
  const { i18n, currentLanguage } = useLanguage();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  useEffect(() => {
    // Fetch news when language changes or after preferences are loaded
    if (preferencesLoaded) {
      fetchNews();
    }
  }, [userPreferences, currentLanguage, preferencesLoaded]);

  const loadUserPreferences = async () => {
    try {
      if (USE_USER_PREFERENCES) {
        const prefs = await getPreferences();
        setUserPreferences(prefs);
      }
      // Mark preferences as loaded even if we're not using them
      setPreferencesLoaded(true);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setError('Failed to load preferences');
      // Still mark as loaded so we can show default content
      setPreferencesLoaded(true);
    }
  };

  const fetchNews = async () => {
    // This is where you would normally fetch news from an API
    // For now, let's use mock data based on user preferences
    setLoading(true);
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock news based on preferences if feature flag is enabled
      // Otherwise use default crops
      const crops = USE_USER_PREFERENCES && userPreferences.crops && userPreferences.crops.length > 0 
        ? userPreferences.crops 
        : ['rice', 'wheat', 'corn'];
      
      const mockNews = generateMockNews(crops, currentLanguage);
      
      setNews(mockNews);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const generateMockNews = (crops: string[], lang: string): NewsArticle[] => {
    // Create mock news articles based on user's preferred crops and language
    const mockArticles: NewsArticle[] = [];
    
    // Define article templates based on language
    const templates = {
      en: [
        { title: 'New farming techniques for %CROP%', summary: 'Latest research shows innovative ways to increase %CROP% yield by up to 30%.' },
        { title: '%CROP% market prices expected to rise', summary: 'Experts predict a significant increase in %CROP% prices due to supply chain issues.' },
        { title: 'Government announces subsidies for %CROP% farmers', summary: 'New policy aims to support %CROP% farmers with financial incentives.' },
        { title: 'Protecting %CROP% from climate change', summary: 'Scientists develop resistant %CROP% varieties to combat changing weather patterns.' },
        { title: 'Sustainable %CROP% farming practices', summary: 'Learn how organic methods can improve your %CROP% cultivation while helping the environment.' }
      ],
      hi: [
        { title: '%CROP% की खेती के लिए नई तकनीकें', summary: 'नवीनतम शोध से %CROP% की उपज 30% तक बढ़ाने के अभिनव तरीके दिखाए गए हैं।' },
        { title: '%CROP% के बाजार मूल्य में वृद्धि की उम्मीद', summary: 'विशेषज्ञों का अनुमान है कि आपूर्ति श्रृंखला की समस्याओं के कारण %CROP% की कीमतों में काफी वृद्धि होगी।' },
        { title: 'सरकार ने %CROP% किसानों के लिए सब्सिडी की घोषणा की', summary: 'नई नीति का उद्देश्य %CROP% किसानों को वित्तीय प्रोत्साहन के साथ समर्थन करना है।' },
        { title: 'जलवायु परिवर्तन से %CROP% की सुरक्षा', summary: 'वैज्ञानिकों ने बदलते मौसम के पैटर्न का मुकाबला करने के लिए प्रतिरोधी %CROP% किस्मों को विकसित किया है।' },
        { title: 'टिकाऊ %CROP% खेती प्रथाएं', summary: 'जानें कि जैविक तरीके आपकी %CROP% की खेती को कैसे सुधार सकते हैं और पर्यावरण की मदद कर सकते हैं।' }
      ]
    };
    
    // Use English as fallback if language not supported
    const articleTemplates = templates[lang as keyof typeof templates] || templates.en;
    
    // Generate a few articles for each crop
    crops.forEach(crop => {
      const cropCapitalized = crop.charAt(0).toUpperCase() + crop.slice(1);
      
      // Generate 2 random articles for this crop
      for (let i = 0; i < 2; i++) {
        const templateIndex = Math.floor(Math.random() * articleTemplates.length);
        const template = articleTemplates[templateIndex];
        
        mockArticles.push({
          id: `${crop}-${i}-${Date.now() + i}`,
          title: template.title.replace('%CROP%', cropCapitalized),
          summary: template.summary.replace('%CROP%', crop),
          imageUrl: `https://source.unsplash.com/featured/?${crop},farming&${Math.random()}`,
          source: 'KrishiAI News',
          date: new Date().toLocaleDateString(),
          url: '#'
        });
      }
    });
    
    return mockArticles.sort(() => Math.random() - 0.5); // Shuffle articles
  };

  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity 
      style={styles.newsItem} 
      onPress={() => onArticlePress(item)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.newsImage} 
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Rendering news item without FlatList's item structure
  const renderNewsItemDirect = (item: NewsArticle, index: number) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.newsItem} 
      onPress={() => onArticlePress(item)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.newsImage} 
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && news.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{i18n.t('loadingNews') || 'Loading News...'}</Text>
      </View>
    );
  }

  if (error && news.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>{i18n.t('retry') || 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="newspaper-outline" size={20} color="#333" />
        <Text style={styles.headerText}>{i18n.t('latestNews') || 'Latest News'}</Text>
      </View>
      
      {isNestedInScrollView ? (
        <View style={styles.newsList}>
          {news.map(renderNewsItemDirect)}
          {loading && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.newsList}
          onRefresh={fetchNews}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  newsList: {
    padding: 12,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImage: {
    width: 120,
    height: 120,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  newsSummary: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  newsDate: {
    fontSize: 10,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default NewsFeed; 