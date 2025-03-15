import { View, Text, StyleSheet, Pressable, Alert, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import {
  mediaDevices,
  RTCPeerConnection,
  MediaStream,
  RTCView,
} from 'react-native-webrtc-web-shim';
import { supabase } from '@/utils/supabase';
import { clientTools, clientToolsSchema } from '@/utils/tools';
import { getPreferences } from '@/utils/preferences';
// import voiceWaveAnimation from '@/assets/animations/voice-wave.json';

export default function VoiceScreen() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [transcript, setTranscript] = useState('');
  const [dataChannel, setDataChannel] = useState<null | ReturnType<
    RTCPeerConnection['createDataChannel']
  >>(null);
  const peerConnection = useRef<null | RTCPeerConnection>(null);
  const [localMediaStream, setLocalMediaStream] = useState<null | MediaStream>(null);
  const remoteMediaStream = useRef<MediaStream>(new MediaStream());
  const isVoiceOnly = true;

  // UI State
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Add new state for preferences
  const [preferences, setPreferences] = useState<any>(null);
  
  // Load preferences when component mounts
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getPreferences();
    setPreferences(prefs);
  };

  // Start realtime session
  const startSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('token');
      console.log('data', data);
      console.log('error', error);
      if (error) throw error;
      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('EPHEMERAL_KEY', EPHEMERAL_KEY);

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const pc = new RTCPeerConnection();
      
      pc.addEventListener('connectionstatechange', (event: Event) => {
        console.log('connectionstatechange', event);
      });
      
      pc.addEventListener('track', (event: RTCTrackEvent) => {
        if (event.track) remoteMediaStream.current.addTrack(event.track);
      });

      const ms = await mediaDevices.getUserMedia({
        audio: true,
      });
      
      if (isVoiceOnly) {
        const videoTrack = await ms.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = false;
      }

      setLocalMediaStream(ms);
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      setDataChannel(dc);

      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      const answer = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
      setIsSessionActive(true);

    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start voice session');
    }
  };

  // Stop session
  const stopSession = () => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  };

  // Handle data channel events
  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener('message', async (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        console.log('dataChannel message', data);
        setEvents((prev) => [data, ...prev]);
        
        if (data.type === 'response.audio_transcript.done') {
          setTranscript(data.transcript);
        }

        // Handle function calls
        if (data.type === 'response.function_call_arguments.done') {
          // TODO: improve types.
          const functionName: keyof typeof clientTools = data.name;
          const tool: any = clientTools[functionName];
          if (tool !== undefined) {
            console.log(
              `Calling local function ${data.name} with ${data.arguments}`
            );
            const args = JSON.parse(data.arguments);
            const result = await tool(args);
            console.log('result', result);
            // Let OpenAI know that the function has been called and share it's output
            const event = {
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: data.call_id, // call_id from the function_call message
                output: JSON.stringify(result), // result of the function
              },
            };
            dataChannel.send(JSON.stringify(event));
            // Force a response to the user
            dataChannel.send(
              JSON.stringify({
                type: 'response.create',
              })
            );
          }
        }

        // Handle AI response text
        if (data.type === 'response.message.done') {
          setResponseText(data.content);
          await speakResponse(data.content);
        }
      });

      dataChannel.addEventListener('open', () => {
        setIsSessionActive(true);
        setEvents([]);
        
        // Update session with preferences context
        const personalContext = preferences ? `
          Farm Context:
          - Location: ${preferences.location || 'Not specified'}
          - Crops: ${preferences.crops?.join(', ') || 'None specified'}
          - Farmer: ${preferences.personalDetails?.name || 'Not specified'}
        ` : '';

        const event = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are a helpful farming assistant for Indian farmers. ${personalContext}
            You have access to a knowledge base of farming information - use the searchKnowledgeBase function to find relevant information before responding. 
            You can also check device battery level and control screen brightness if asked. 
            Always provide practical, accurate advice based on the knowledge base results and the farmer's specific context.`,
            tools: clientToolsSchema
          },
        };
        dataChannel.send(JSON.stringify(event));
      });
    }
  }, [dataChannel, preferences]);

  // Recording configuration
  const recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: '.wav',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.wav',
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };

  // Get microphone permission
  const getMicrophonePermission = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please grant microphone access to use voice features"
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error getting microphone permission:', error);
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    const hasPermission = await getMicrophonePermission();
    if (!hasPermission) return;

    try {
      setIsRecording(true);
      await startSession();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Stop recording and process audio
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      stopSession();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  // Speak response
  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    try {
      await Speech.speak(text, {
        language: 'en-IN',
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error in text to speech:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking and session
  const stopEverything = async () => {
    try {
      // Stop the text-to-speech if it's speaking
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
      }
      
      // Stop the recording session
      if (isRecording) {
        setIsRecording(false);
      }

      // Close media stream tracks
      if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
        setLocalMediaStream(null);
      }

      // Close remote stream tracks
      if (remoteMediaStream.current) {
        remoteMediaStream.current.getTracks().forEach(track => track.stop());
        remoteMediaStream.current = new MediaStream();
      }
      
      // Stop WebRTC connection
      stopSession();
      
      // Clear states
      setResponseText('');
      setTranscript('');
      setLoading(false);
      setEvents([]);
    } catch (error) {
      console.error('Failed to stop everything:', error);
    }
  };

  // Add animation scale value

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1.2),
              withSpring(1)
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant',
    message: string,
    timestamp: Date
  }>>([]);
  
  const drawerAnimation = useSharedValue(0);

  // Update chat history when transcript or response changes
  useEffect(() => {
    if (transcript) {
      setChatHistory(prev => [...prev, {
        type: 'user',
        message: transcript,
        timestamp: new Date()
      }]);
    }
  }, [transcript]);

  useEffect(() => {
    if (responseText) {
      setChatHistory(prev => [...prev, {
        type: 'assistant',
        message: responseText,
        timestamp: new Date()
      }]);
    }
  }, [responseText]);

  const toggleChatDrawer = () => {
    const newValue = !isChatDrawerOpen;
    setIsChatDrawerOpen(newValue);
    drawerAnimation.value = withTiming(newValue ? 1 : 0);
  };

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(drawerAnimation.value * -300),
        },
      ],
    };
  });

  // Add this function to handle outside press
  const handleOutsidePress = () => {
    if (isChatDrawerOpen) {
      toggleChatDrawer();
    }
  };

  return (
    <LinearGradient
      colors={['#E8F3D6', '#F9F7F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Farm Assistant</Text>
          <Pressable 
            style={styles.menuButton}
            onPress={toggleChatDrawer}
          >
            <Ionicons 
              name={isChatDrawerOpen ? "close" : "chatbubble-ellipses-outline"} 
              size={24} 
              color="#000" 
            />
          </Pressable>
        </View>

        {/* Overlay and Chat Drawer */}
        {isChatDrawerOpen && (
          <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        
        <Animated.View style={[styles.chatDrawer, drawerStyle]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Conversation</Text>
          </View>
          <ScrollView 
            style={styles.chatHistory}
            showsVerticalScrollIndicator={false}
          >
            {chatHistory.map((chat, index) => (
              <View key={index} style={styles.messageWrapper}>
                <View style={styles.messageHeader}>
                  <Text style={styles.roleName}>
                    {chat.type === 'user' ? 'You' : 'AI Assistant'}
                  </Text>
                  <Text style={styles.timestamp}>
                    {chat.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <View 
                  style={[
                    styles.chatBubble,
                    chat.type === 'user' ? styles.userBubble : styles.assistantBubble
                  ]}
                >
                  <Text style={[
                    styles.chatText,
                    chat.type === 'user' ? styles.userText : styles.assistantText
                  ]}>
                    {chat.message}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Animated Circle */}
          <View style={styles.circleContainer}>
            <Animated.View 
              style={[
                styles.circle,
                isRecording && pulseStyle
              ]}
            >
              <View style={styles.innerCircle}>
                <View style={styles.glowDot} />
              </View>
            </Animated.View>
          </View>

          {/* Message Display */}
          {responseText || loading ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                {loading ? 'Processing...' : responseText}
              </Text>
              <Text style={styles.subText}>I'm curious to know!</Text>
            </View>
          ) : (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                Hey, what would you like to know?
              </Text>
              <Text style={styles.subText}>I'm here to help!</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.controls}>
            <Pressable 
              style={styles.controlButton}
              onPress={stopEverything}
            >
              <Ionicons name="stop-circle-outline" size={24} color="#000" />
            </Pressable>
            
            <Pressable 
              style={[styles.micButton, isRecording && styles.micButtonRecording]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MaterialCommunityIcons 
                name="microphone" 
                size={28} 
                color="#2E7D32"
              />
            </Pressable>

            <Pressable 
              style={styles.controlButton}
              onPress={stopEverything}
            >
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  circleContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowDot: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2E7D32',
    opacity: 0.8,
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#C8E6C9',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  chatDrawer: {
    position: 'absolute',
    top: 0,
    right: -300,
    width: 300,
    height: '100%',
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  chatHistory: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#1B5E20',
  },
  assistantText: {
    color: '#333',
  },
}); 