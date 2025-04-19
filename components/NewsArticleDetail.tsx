import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/utils/LanguageContext';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  date: string;
  url: string;
}

interface NewsArticleDetailProps {
  article: NewsArticle;
  onClose: () => void;
}

const NewsArticleDetail = ({ article, onClose }: NewsArticleDetailProps) => {
  const { i18n } = useLanguage();

  const handleReadMore = () => {
    if (article.url && article.url !== '#') {
      Linking.openURL(article.url).catch(err => {
        console.error('Error opening URL:', err);
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title} - ${article.summary} #KrishiAI`,
        url: article.url !== '#' ? article.url : undefined,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{article.title}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        <View style={styles.articleInfo}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.date}>{article.date}</Text>
        </View>
        
        <Text style={styles.title}>{article.title}</Text>
        
        <Text style={styles.summary}>{article.summary}</Text>
        
        {/* Generate a fake article body with placeholder text */}
        <Text style={styles.bodyParagraph}>
          Agriculture plays a vital role in the global economy, with farmers working tirelessly to produce the food we consume every day. The industry faces numerous challenges, from climate change and water scarcity to pest management and market fluctuations.
        </Text>
        
        <Text style={styles.bodyParagraph}>
          Modern agricultural techniques are constantly evolving, with technology playing an increasingly important role. From precision farming and IoT sensors to drone monitoring and AI-driven analytics, farmers now have access to tools that can significantly increase yield while reducing resource usage.
        </Text>
        
        <Text style={styles.bodyParagraph}>
          Sustainable agriculture practices are gaining prominence as well, with a focus on minimizing environmental impact while maintaining productivity. Organic farming, regenerative agriculture, and conservation tillage are just some of the approaches that farmers are adopting to ensure the long-term health of their land.
        </Text>
        
        <TouchableOpacity 
          style={styles.readMoreButton}
          onPress={handleReadMore}
        >
          <Text style={styles.readMoreText}>{i18n.t('readMore') || 'Read More'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  articleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 24,
  },
  bodyParagraph: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 22,
  },
  readMoreButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginVertical: 24,
    marginBottom: 40, // Extra padding at bottom for scroll
  },
  readMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsArticleDetail; 