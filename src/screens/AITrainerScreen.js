import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AIAvatar from '../components/AIAvatar';

const AITrainerScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { state, actions } = useApp();

  const quickPrompts = [
    '¿Cómo puedo mejorar mi resistencia?',
    'Necesito motivación para entrenar',
    'Tengo dolor en la espalda',
    '¿Qué ejercicios me recomiendas?',
    'Me siento desmotivado',
    'Quiero ganar músculo',
  ];

  const aiResponses = {
    motivation: [
      '¡Recuerda por qué empezaste! Cada repetición te acerca a tu mejor versión.',
      '¡Tú puedes! La constancia es la clave del éxito. ¡Vamos por esa meta!',
      '💪 Los obstáculos son oportunidades disfrazadas. ¡Supéralos!',
    ],
    exercise: [
      'Para mejorar resistencia, te recomiendo ejercicios cardiovasculares progresivos.',
      'Los ejercicios compuestos como sentadillas y flexiones son excelentes para principiantes.',
      'La clave está en la progresión gradual. Aumenta intensidad poco a poco.',
    ],
    pain: [
      'Para dolor de espalda, te recomiendo estiramientos suaves y fortalecimiento del core.',
      'Es importante calentar antes y enfriar después del ejercicio.',
      'Si el dolor persiste, consulta con un profesional de la salud.',
    ],
    general: [
      'Estoy aquí para ayudarte en tu journey fitness. ¿En qué puedo apoyarte?',
      'Como tu entrenador personal, mi objetivo es motivarte y guiarte.',
      '¡Excelente pregunta! Vamos a resolver esto juntos.',
    ],
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    actions.addAIMessage(userMessage);
    setMessage('');
    setIsTyping(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const response = generateAIResponse(message);
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      actions.addAIMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('motivac') || lowerMessage.includes('animo') || lowerMessage.includes('desmotiv')) {
      return aiResponses.motivation[Math.floor(Math.random() * aiResponses.motivation.length)];
    } else if (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrena') || lowerMessage.includes('rutina')) {
      return aiResponses.exercise[Math.floor(Math.random() * aiResponses.exercise.length)];
    } else if (lowerMessage.includes('dolor') || lowerMessage.includes('lesion') || lowerMessage.includes('duele')) {
      return aiResponses.pain[Math.floor(Math.random() * aiResponses.pain.length)];
    } else {
      return aiResponses.general[Math.floor(Math.random() * aiResponses.general.length)];
    }
  };

  const sendQuickPrompt = (prompt) => {
    setMessage(prompt);
    setTimeout(sendMessage, 100);
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <AIAvatar isActive={isTyping} size={60} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Tu Entrenador IA</Text>
            <Text style={styles.subtitle}>
              {isTyping ? 'Escribiendo...' : 'Siempre aquí para ti'}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          style={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          ref={(ref) => { this.scrollView = ref; }}
          onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
        >
          {/* Initial greeting */}
          {state.aiConversation.length === 0 && (
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <Text style={styles.messageText}>
                ¡Hola {state.user?.name}! 👋 Soy tu entrenador personal con IA. 
                Estoy aquí para motivarte, resolver tus dudas sobre ejercicios y 
                ayudarte a alcanzar tus metas fitness. ¿En qué puedo ayudarte hoy?
              </Text>
              <Text style={styles.messageTime}>
                {new Date().toLocaleTimeString()}
              </Text>
            </View>
          )}

          {/* Chat messages */}
          {state.aiConversation.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>{msg.timestamp}</Text>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <View style={styles.typingIndicator}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        {state.aiConversation.length === 0 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Preguntas frecuentes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickPrompts}>
                {quickPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPromptButton}
                    onPress={() => sendQuickPrompt(prompt)}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#8E8E93"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
              onPress={sendMessage}
              disabled={!message.trim() || isTyping}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={message.trim() ? "#FFFFFF" : "#8E8E93"} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Voice and emotion buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="mic" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Estado Emocional', `Tu estado actual: ${state.emotionalState}`)}
            >
              <Ionicons name="heart" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageBubble: {
    marginBottom: 15,
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B35',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    opacity: 0.6,
  },
  quickPromptsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  quickPromptsTitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 10,
  },
  quickPrompts: {
    flexDirection: 'row',
    gap: 10,
  },
  quickPromptButton: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  quickPromptText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonActive: {
    backgroundColor: '#FF6B35',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
});

export default AITrainerScreen;