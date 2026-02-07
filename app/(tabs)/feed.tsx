import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface feedItem {
  id: string;
  title: string;
  author: string;
  duration: string;
  likes: number;
  category: 'motivation' | 'workout' | 'nutrition' | 'tips';
  thumbnail: string;
}

const mockFeedData: feedItem[] = [
  {
    id: '1',
    title: '💪 TRANSFORMA TU CUERPO EN 30 DÍAS',
    author: 'FitnessGuru',
    duration: '2:45',
    likes: 1250,
    category: 'motivation',
    thumbnail: 'workout1',
  },
  {
    id: '2',
    title: '🔥 HIIT EXTREMO - QUEMA 500 CALORÍAS',
    author: 'CoachMaria',
    duration: '15:30',
    likes: 890,
    category: 'workout',
    thumbnail: 'hiit1',
  },
  {
    id: '3',
    title: '🥗 RECETA: PROTEÍNA POST-ENTRENO',
    author: 'NutriPro',
    duration: '4:12',
    likes: 567,
    category: 'nutrition',
    thumbnail: 'nutrition1',
  },
  {
    id: '4',
    title: '⚡ 5 ERRORES QUE TE IMPIDEN CRECER',
    author: 'ExpertTrainer',
    duration: '8:20',
    likes: 2100,
    category: 'tips',
    thumbnail: 'tips1',
  },
];

export default function FeedScreen() {
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todo', icon: 'grid' },
    { id: 'motivation', name: 'Motivación', icon: 'flash' },
    { id: 'workout', name: 'Rutinas', icon: 'fitness' },
    { id: 'nutrition', name: 'Nutrición', icon: 'restaurant' },
    { id: 'tips', name: 'Tips', icon: 'bulb' },
  ];

  const handleLike = (itemId: string) => {
    setLikedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFeed = activeCategory === 'all' 
    ? mockFeedData 
    : mockFeedData.filter(item => item.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return '💪';
      case 'workout': return '🔥';
      case 'nutrition': return '🥗';
      case 'tips': return '⚡';
      default: return '📱';
    }
  };

  return (
    <View className="flex-1 bg-dark-100">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e1e1e', '#2d2d2d', '#1a1a1a']}
        className="absolute inset-0"
      />

      {/* Header */}
      <View className="pt-16 px-6 pb-4">
        <Text className="text-3xl font-bold text-white mb-4">
          Feed Motivacional
        </Text>
        
        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  activeCategory === category.id 
                    ? 'bg-primary-500' 
                    : 'bg-gray-800'
                }`}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={activeCategory === category.id ? '#fff' : '#666'} 
                />
                <Text className={`ml-2 font-medium ${
                  activeCategory === category.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Feed Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="space-y-4 pb-8">
          {filteredFeed.map((item) => (
            <TouchableOpacity key={item.id} className="relative">
              {/* Video Card */}
              <View className="bg-gray-800 rounded-2xl overflow-hidden">
                {/* Placeholder for video thumbnail */}
                <View className="w-full h-48 bg-gray-700 items-center justify-center relative">
                  <LinearGradient
                    colors={['rgba(249, 115, 22, 0.3)', 'rgba(234, 88, 12, 0.5)']}
                    className="absolute inset-0"
                  />
                  
                  <View className="items-center">
                    <Ionicons name="play-circle" size={64} color="#f97316" />
                    <Text className="text-white font-bold text-lg mt-2 text-center px-4">
                      {item.title}
                    </Text>
                  </View>
                  
                  {/* Duration Badge */}
                  <View className="absolute top-3 right-3 bg-black/70 rounded-lg px-2 py-1">
                    <Text className="text-white text-xs font-medium">
                      {item.duration}
                    </Text>
                  </View>
                  
                  {/* Category Badge */}
                  <View className="absolute top-3 left-3 bg-primary-500/20 rounded-lg px-2 py-1">
                    <Text className="text-primary-400 text-xs font-medium">
                      {getCategoryIcon(item.category)} {item.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                {/* Video Info */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base mb-1">
                        @{item.author}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {item.likes.toLocaleString()} me gusta
                      </Text>
                    </View>
                    
                    {/* Action Buttons */}
                    <View className="flex-row space-x-4">
                      <TouchableOpacity 
                        onPress={() => handleLike(item.id)}
                        className="flex-row items-center"
                      >
                        <Ionicons 
                          name={likedItems.includes(item.id) ? "heart" : "heart-outline"} 
                          size={24} 
                          color={likedItems.includes(item.id) ? "#ef4444" : "#666"} 
                        />
                        <Text className="text-gray-400 text-sm ml-1">
                          {likedItems.includes(item.id) ? item.likes + 1 : item.likes}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity>
                        <Ionicons name="share-outline" size={24} color="#666" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity>
                        <Ionicons name="bookmark-outline" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Load More */}
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-6 items-center">
            <Ionicons name="refresh" size={32} color="#f97316" />
            <Text className="text-white font-semibold text-lg mt-2">
              Cargar más contenido
            </Text>
            <Text className="text-gray-400 text-sm">
              Descubre más videos motivacionales
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}