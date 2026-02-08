import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../../services/OpenAIService';
import { useUserData } from '../../context/UserDataContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AICoachScreen() {
  const { userData } = useUserData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy Iron Assistant, tu entrenador personal con IA. ¿En qué puedo ayudarte hoy? 💪',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize AI service with user profile when component mounts
    if (userData) {
      aiService.setUserProfile(userData);
    }
  }, [userData]);

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      // Get real AI response from OpenAI
      const aiResponse = await aiService.sendMessage(userMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, tengo problemas para conectarme ahora. ¿Puedes intentar de nuevo? 🤔',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      Alert.alert('Error', 'No se pudo conectar con el asistente IA');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "¿Qué ejercicios debo hacer hoy?",
    "¿Cómo mejorar mi técnica de sentadillas?",
    "¿Qué comer después del entrenamiento?",
    "¿Cuánto descanso necesito entre series?",
    "Crea una rutina de 30 minutos",
    "¿Cómo evitar lesiones?",
  ];

  return (
    <View className="flex-1 bg-dark-100">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e1e1e', '#2d2d2d', '#1a1a1a']}
        className="absolute inset-0"
      />

      {/* Header */}
      <View className="pt-16 px-6 pb-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-3">
            <Ionicons name="flash" size={24} color="#fff" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">
              Coach IA
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-green-400 text-sm">En línea</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.isUser
                  ? 'bg-primary-500'
                  : 'bg-gray-800'
              }`}
            >
              <Text className="text-white text-base">
                {message.text}
              </Text>
            </View>
            
            <Text className="text-gray-500 text-xs mt-1">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
        
        {/* Quick Questions */}
        {messages.length === 1 && (
          <View className="mb-6">
            <Text className="text-gray-400 text-sm mb-3">Preguntas frecuentes:</Text>
            <View className="space-y-2">
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(question)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3"
                >
                  <Text className="text-gray-300">{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="px-6 pb-8">
        <View className="flex-row items-center bg-gray-800 rounded-2xl px-4 py-2">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Pregúntale a tu coach..."
            placeholderTextColor="#666"
            className="flex-1 text-white text-base py-2"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isLoading}
            className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${
              inputText.trim() && !isLoading ? 'bg-primary-500' : 'bg-gray-700'
            }`}
          >
            {isLoading ? (
              <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? '#fff' : '#666'} 
              />
            )}
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-500 text-xs text-center mt-2">
          🤖 Potenciado por OpenAI • El Coach IA puede cometer errores
        </Text>
      </View>
    </View>
  );
}