import OpenAI from 'openai';

// OpenAI API Key
const OPENAI_API_KEY = 'AIzaSyByhea_GN8ntNBcmLvAt4t6lDJD3SHsuh4';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for mobile apps
});

// AI Coach System Prompt
const SYSTEM_PROMPT = `Eres un entrenador personal experto llamado "Iron Assistant". 

CARACTERÍSTICAS:
- Especialista en fitness, nutrición y bienestar
- Personalidad motivacional, amigable y profesional
- Respondes en español
- Adaptas respuestas según el perfil del usuario
- Das consejos específicos y prácticos

FORMATO DE RESPUESTAS:
- Máximo 200 palabras por respuesta
- Usa emojis relevantes (💪, 🔥, 💯, etc.)
- Estructura clara con puntos o pasos
- Incluye motivación positiva

ÁREAS DE EXPERTISE:
- Rutinas de ejercicio personalizadas
- Técnicas de levantamiento
- Nutrición deportiva
- Recuperación y descanso
- Prevención de lesiones
- Establecimiento de metas

TONO: Motivacional pero profesional, como un entrenador experimentado que realmente se preocupa por el progreso de sus clientes.`;

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal?: 'lose_weight' | 'gain_muscle' | 'maintain_fitness' | 'get_stronger';
  workoutFrequency?: number;
  preferredWorkoutTypes?: string[];
  healthConditions?: string[];
}

class OpenAIService {
  private conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
  ];

  // Initialize with user profile
  setUserProfile(profile: UserProfile) {
    const profileContext = `
PERFIL DEL USUARIO:
- Edad: ${profile.age || 'No especificada'}
- Peso: ${profile.weight || 'No especificado'} kg
- Altura: ${profile.height || 'No especificada'} cm
- Nivel: ${this.translateFitnessLevel(profile.fitnessLevel) || 'No especificado'}
- Objetivo: ${this.translateGoal(profile.primaryGoal) || 'No especificado'}
- Frecuencia: ${profile.workoutFrequency || 'No especificada'} veces por semana
- Ejercicios preferidos: ${profile.preferredWorkoutTypes?.join(', ') || 'No especificados'}
- Condiciones de salud: ${profile.healthConditions?.join(', ') || 'Ninguna'}

Usa esta información para personalizar tus respuestas.`;

    this.conversationHistory.push({
      role: 'system',
      content: profileContext,
    });
  }

  // Send message to AI and get response
  async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      // Get AI response
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content || 
        'Lo siento, no pude procesar tu pregunta. ¿Puedes reformularla? 🤔';

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
      });

      return aiResponse;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Generate workout plan
  async generateWorkoutPlan(profile: UserProfile, duration: number = 30): Promise<string> {
    const prompt = `Crea una rutina de ejercicios de ${duration} minutos personalizada para este perfil. 
    Incluye:
    - Calentamiento (5 min)
    - Ejercicios principales con series y repeticiones
    - Enfriamiento (5 min)
    - Tips específicos
    
    Formato: Ejercicio | Series x Reps | Descanso | Tips`;

    return await this.sendMessage(prompt);
  }

  // Get nutrition advice
  async getNutritionAdvice(goal: string, preferences?: string[]): Promise<string> {
    const prompt = `Dame consejos nutricionales específicos para ${goal}. 
    ${preferences ? `Preferencias: ${preferences.join(', ')}` : ''}
    
    Incluye:
    - Macronutrientes clave
    - Alimentos recomendados
    - Horarios de comida
    - Hidratación`;

    return await this.sendMessage(prompt);
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];
  }

  // Fallback responses when API fails
  private getFallbackResponse(message: string): string {
    const fallbacks = [
      '💪 ¡Gran pregunta! Como entrenador, te recomendaría enfocarte en la constancia y progresión gradual.',
      '🔥 Basándome en mi experiencia, lo más importante es mantener una rutina equilibrada.',
      '🎯 Excelente consulta. Cada persona es única, pero siempre sugiero comenzar con lo básico.',
      '💯 Me encanta tu motivación. Recuerda que el descanso es tan importante como el entrenamiento.',
      '⚡ ¡Perfecta pregunta! La clave está en encontrar el equilibrio entre intensidad y recuperación.',
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Helper methods
  private translateFitnessLevel(level?: string): string {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'No especificado';
    }
  }

  private translateGoal(goal?: string): string {
    switch (goal) {
      case 'lose_weight': return 'Perder peso';
      case 'gain_muscle': return 'Ganar músculo';
      case 'maintain_fitness': return 'Mantener forma física';
      case 'get_stronger': return 'Ser más fuerte';
      default: return 'No especificado';
    }
  }
}

// Export singleton instance
export const aiService = new OpenAIService();
export default OpenAIService;