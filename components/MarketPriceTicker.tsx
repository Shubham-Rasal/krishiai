import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/utils/LanguageContext';

interface CropPrice {
  id: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

interface MarketPriceTickerProps {
  prices: CropPrice[];
}

const MarketPriceTicker = ({ prices }: MarketPriceTickerProps) => {
  const { i18n } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a ticker effect by animating the X position
    const tickerWidth = prices.length * 150; // Approximate width of all items
    const screenWidth = 400; // Approximate screen width

    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -tickerWidth,
        duration: prices.length * 5000, // Duration based on number of items
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      // Clean up animation when component unmounts
      scrollX.stopAnimation();
    };
  }, [prices]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={16} color="#555" />
        <Text style={styles.headerText}>{i18n.t('marketPrices') || 'Market Prices'}</Text>
      </View>
      <View style={styles.tickerContainer}>
        <Animated.View 
          style={[
            styles.tickerContent,
            { transform: [{ translateX: scrollX }] }
          ]}
        >
          {/* Duplicate the prices array to create a seamless loop effect */}
          {[...prices, ...prices].map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.priceItem}>
              <Text style={styles.cropName}>{item.name}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
              <View style={styles.changeContainer}>
                <Ionicons 
                  name={item.isUp ? "caret-up" : "caret-down"} 
                  size={12} 
                  color={item.isUp ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.changeText, 
                  { color: item.isUp ? "#4CAF50" : "#F44336" }
                ]}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginLeft: 4,
  },
  tickerContainer: {
    height: 50,
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  priceItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    width: 150,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    marginLeft: 2,
  },
});

export default MarketPriceTicker; 