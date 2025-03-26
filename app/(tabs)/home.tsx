import { View, Text, StyleSheet, ScrollView, Pressable, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface Task {
  id: string;
  title: string;
  time: string;
  status: 'On-Progress' | 'Not-Started';
  fieldCode: string;
}

interface Field {
  id: string;
  name: string;
  status: string;
  location: string;
  coordinates: string;
  hectares: number;
  activityCount: number;
}

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mock data for tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Watering of fields',
      time: '7:30 AM',
      status: 'On-Progress',
      fieldCode: 'CD5'
    },
    {
      id: '2',
      title: 'Planting of fields',
      time: '8:00 AM',
      status: 'Not-Started',
      fieldCode: 'CD5'
    },
    {
      id: '3',
      title: 'Watering of fields',
      time: '8:30 AM',
      status: 'Not-Started',
      fieldCode: 'CD7'
    }
  ]);
  
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
    
    return () => clearInterval(timer);
  }, []);
  
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

  return (
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
              <Text style={styles.locationText}>Yogyakarta, Indonesia</Text>
            </View>
            <Pressable style={styles.profileButton}>
              <View style={styles.profileRing}>
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.profilePlaceholderText}>
                      {user?.firstName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
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
      
      {/* Tasks section */}
      <View style={styles.tasksContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tasksScroll}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={styles.taskTime}>{task.time}</Text>
              <Text style={styles.taskTitle}>{task.title} {task.fieldCode}</Text>
              <View style={[
                styles.taskStatusBadge, 
                task.status === 'On-Progress' ? styles.statusProgress : styles.statusNotStarted
              ]}>
                <Text style={styles.taskStatusText}>{task.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Fields section */}
      <View style={styles.fieldsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our agriculture field</Text>
          <Pressable>
            <Text style={styles.viewMapText}>View Map</Text>
          </Pressable>
        </View>
        
        {/* Field cards */}
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
      </View>
      
      {/* Navigation Footer */}
      <View style={styles.navFooter}>
        <Pressable style={[styles.navButton, styles.activeNavButton]}>
          <Ionicons name="home" size={24} color="white" />
          <Text style={styles.activeNavText}>Home</Text>
        </Pressable>
        <Pressable style={styles.navButton}>
          <Ionicons name="book-outline" size={24} color="#333" />
        </Pressable>
        <Pressable style={styles.navButton}>
          <Ionicons name="document-text-outline" size={24} color="#333" />
        </Pressable>
        <Pressable style={styles.navButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    paddingBottom: 80,
  },
  headerBackground: {
    height: 400,
    width: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.85, // Make the image lighter
    backgroundColor: '#000',
  },
  gradientOverlay: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 13,
  },
  profileButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  profileRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#2ecc71', // Bright green color
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'white', // This creates a white border inside
    padding: 2, // Space between green ring and profile image
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  profilePlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 50,
  },
  temperature: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  conditionText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tasksContainer: {
    marginTop: -40,
    paddingLeft: 16,
  },
  tasksScroll: {
    flexDirection: 'row',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  taskTime: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  taskStatusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusProgress: {
    backgroundColor: '#e3f2e3',
  },
  statusNotStarted: {
    backgroundColor: '#f0f0f0',
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  fieldsSection: {
    padding: 16,
    marginTop: 20,
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
    color: '#000',
  },
  viewMapText: {
    fontSize: 13,
    color: '#0f772f',
    fontWeight: '500',
  },
  fieldCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  fieldImage: {
    width: '100%',
    height: 120,
  },
  fieldImageStyle: {
    opacity: 0.85,
  },
  fieldImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fieldContent: {
    padding: 12,
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  fieldCoordinates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  fieldStatusBadge: {
    backgroundColor: '#e3f2e3',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  fieldStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  fieldStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  navFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  activeNavButton: {
    backgroundColor: '#0f772f',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  activeNavText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
}); 