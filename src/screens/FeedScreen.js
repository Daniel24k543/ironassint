import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const FeedScreen = ({ navigation }) => {
  const { state } = useApp();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const feedContent = [
    {
      id: '1',
      type: 'motivation',
      title: '💪 Transformación Increíble',
      description: 'De 0 a héroe en 6 meses con constancia y dedicación',
      author: '@fitness_hero',
      likes: 12500,
      shares: 890,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      duration: '0:45',
      category: 'Motivación',
    },
    {
      id: '2',
      type: 'workout',
      title: '🔥 Rutina de 10 minutos',
      description: 'Ejercicios que puedes hacer en casa sin equipo',
      author: '@home_workouts',
      likes: 8900,
      shares: 567,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      duration: '10:15',
      category: 'Ejercicio',
    },
    {
      id: '3',
      type: 'nutrition',
      title: '🥗 Receta Post-Entreno',
      description: 'Smoothie de proteína delicioso y nutritivo',
      author: '@healthy_eats',
      likes: 5400,
      shares: 321,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      duration: '2:30',
      category: 'Nutrición',
    },
    {
      id: '4',
      type: 'success_story',
      title: '🌟 Historia de Éxito',
      description: 'Cómo perdí 30kg y cambié mi vida completamente',
      author: '@success_journey',
      likes: 15600,
      shares: 1200,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      duration: '3:45',
      category: 'Inspiración',
    },
    {
      id: '5',
      type: 'tips',
      title: '💡 5 Tips para Principiantes',
      description: 'Errores comunes que debes evitar en el gym',
      author: '@gym_coach',
      likes: 9800,
      shares: 678,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      duration: '4:20',
      category: 'Consejos',
    },
  ];

  const categories = ['Todos', 'Motivación', 'Ejercicio', 'Nutrición', 'Inspiración', 'Consejos'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredContent = selectedCategory === 'Todos' 
    ? feedContent 
    : feedContent.filter(item => item.category === selectedCategory);

  const handleVideoPress = (video) => {
    Alert.alert(
      video.title,
      video.description,
      [
        { text: 'Ver Video', onPress: () => playVideo(video) },
        { text: 'Cerrar', style: 'cancel' },
      ]
    );
  };

  const playVideo = (video) => {
    Alert.alert('🎥 Reproduciendo', `"${video.title}" por ${video.author}`);
  };

  const likeVideo = (videoId) => {
    Alert.alert('❤️', '¡Video marcado como favorito!');
  };

  const shareVideo = (video) => {
    Alert.alert(
      'Compartir Video',
      `¿Compartir "${video.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir', onPress: () => Alert.alert('📱', 'Video compartido') },
      ]
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Motivación': 'flame',
      'Ejercicio': 'fitness',
      'Nutrición': 'restaurant',
      'Inspiración': 'star',
      'Consejos': 'bulb',
    };
    return icons[category] || 'play';
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
        <Text style={styles.subtitle}>Contenido motivacional</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Feed Content */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        snapToInterval={height * 0.7}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {filteredContent.map((item, index) => (
          <View key={item.id} style={styles.videoContainer}>
            <TouchableOpacity 
              style={styles.videoCard}
              onPress={() => handleVideoPress(item)}
            >
              <ImageBackground 
                source={{ uri: item.thumbnail }}
                style={styles.videoBackground}
                imageStyle={styles.videoImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.videoOverlay}
                >
                  {/* Play Button */}
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={60} color="rgba(255,255,255,0.9)" />
                  </View>

                  {/* Category Badge */}
                  <View style={styles.categoryBadge}>
                    <Ionicons 
                      name={getCategoryIcon(item.category)} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>

                  {/* Duration Badge */}
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>

                  {/* Video Info */}
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle}>{item.title}</Text>
                    <Text style={styles.videoDescription}>{item.description}</Text>
                    <Text style={styles.videoAuthor}>{item.author}</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => likeVideo(item.id)}
              >
                <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionCount}>{(item.likes / 1000).toFixed(1)}k</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => shareVideo(item)}
              >
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionCount}>{item.shares}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Load More */}
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Cargar más contenido</Text>
            <Ionicons name="refresh" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Live Indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    position: 'absolute',
    bottom: -5,
    left: 20,
  },
  searchButton: {
    padding: 5,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categories: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF8E53',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: 'bold',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  videoContainer: {
    height: height * 0.7,
    marginBottom: 15,
    flexDirection: 'row',
  },
  videoCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
  },
  videoBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoImage: {
    borderRadius: 20,
  },
  videoOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    zIndex: 2,
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  videoAuthor: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    width: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 8,
  },
  loadMoreText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  liveIndicator: {
    position: 'absolute',
    top: 110,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default FeedScreen;