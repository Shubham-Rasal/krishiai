import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons size={24} {...props} />
  );
}

function MaterialTabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <MaterialCommunityIcons size={24} {...props} />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#FFFFFF';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  // Shadow styles based on theme
  const shadowStyle = colorScheme === 'dark' 
    ? { 
        shadowColor: '#000',
        shadowOpacity: 0.25,
      } 
    : { 
        shadowColor: '#000',
        shadowOpacity: 0.1,
      };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: [styles.tabBar, { backgroundColor }, shadowStyle],
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
              <TabBarIcon name="home" color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: 'Voice',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
              <TabBarIcon name="mic" color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="crop-scan"
        options={{
          title: 'Crop Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
              <MaterialTabBarIcon name="leaf" color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pesticide-scan"
        options={{
          title: 'Pesticides',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
              <MaterialTabBarIcon name="flask" color={color} focused={focused} />
            </View>
          ),
        }}
        />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
    opacity: 0.7,
  },
  tabBarLabelActive: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 0,
    marginLeft: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    flexDirection: 'row',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
