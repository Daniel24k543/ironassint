import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ShopScreen = ({ navigation }) => {
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const { state, actions } = useApp();

  const shopItems = [
    {
      id: '1',
      name: 'Proteína Whey Premium',
      brand: 'FitNutrition',
      price: '$45.99',
      originalPrice: '$59.99',
      discount: 25,
      category: 'Suplementos',
      image: '💪',
      rating: 4.8,
      inStock: true,
    },
    {
      id: '2',
      name: 'Camiseta Deportiva Pro',
      brand: 'SportWear',
      price: '$24.99',
      originalPrice: '$34.99',
      discount: 30,
      category: 'Ropa',
      image: '👕',
      rating: 4.6,
      inStock: true,
    },
    {
      id: '3',
      name: 'Zapatillas Running Max',
      brand: 'RunFast',
      price: '$89.99',
      originalPrice: '$129.99',
      discount: 30,
      category: 'Calzado',
      image: '👟',
      rating: 4.9,
      inStock: false,
    },
    {
      id: '4',
      name: 'Creatina Monohidrato',
      brand: 'MuscleTech',
      price: '$19.99',
      originalPrice: '$24.99',
      discount: 20,
      category: 'Suplementos',
      image: '⚡',
      rating: 4.7,
      inStock: true,
    },
    {
      id: '5',
      name: 'Shorts de Entrenamiento',
      brand: 'ActiveFit',
      price: '$18.99',
      originalPrice: '$24.99',
      discount: 25,
      category: 'Ropa',
      image: '🩳',
      rating: 4.5,
      inStock: true,
    },
    {
      id: '6',
      name: 'Pre-entreno Energy',
      brand: 'PowerBoost',
      price: '$29.99',
      originalPrice: '$39.99',
      discount: 25,
      category: 'Suplementos',
      image: '🔥',
      rating: 4.4,
      inStock: true,
    },
  ];

  const categories = ['Todos', 'Suplementos', 'Ropa', 'Calzado', 'Accesorios'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const roulettePrizes = [
    { name: '10% OFF', color: '#FF6B35', value: 10 },
    { name: '15% OFF', color: '#4ECDC4', value: 15 },
    { name: '5% OFF', color: '#FFD700', value: 5 },
    { name: '20% OFF', color: '#FF69B4', value: 20 },
    { name: '25% OFF', color: '#90EE90', value: 25 },
    { name: '30% OFF', color: '#FFA500', value: 30 },
  ];

  const spinRoulette = () => {
    setRouletteSpinning(true);
    
    // Simular giro de ruleta
    setTimeout(() => {
      const prize = roulettePrizes[Math.floor(Math.random() * roulettePrizes.length)];
      setRouletteSpinning(false);
      setShowRoulette(false);
      
      Alert.alert(
        '🎉 ¡Felicidades!',
        `Has ganado un cupón de ${prize.name} para tu próxima compra!`,
        [{ text: '¡Genial!' }]
      );
      
      actions.addRewards(prize.value);
    }, 3000);
  };

  const buyItem = (item) => {
    Alert.alert(
      'Comprar Producto',
      `¿Confirmar compra de ${item.name} por ${item.price}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => confirmPurchase(item) },
      ]
    );
  };

  const confirmPurchase = (item) => {
    Alert.alert(
      '✅ Compra Exitosa',
      `Has comprado ${item.name}. ¡Gracias por tu compra!`,
      [{ text: 'OK' }]
    );
  };

  const filteredItems = selectedCategory === 'Todos' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tienda</Text>
          <View style={styles.rewardsContainer}>
            <Ionicons name="gift" size={20} color="#FFD700" />
            <Text style={styles.rewardsText}>{state.rewards} puntos</Text>
          </View>
        </View>

        {/* Roulette Banner */}
        <TouchableOpacity 
          style={styles.rouletteBanner}
          onPress={() => setShowRoulette(true)}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8E53', '#FFA570']}
            style={styles.rouletteGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <View style={styles.rouletteContent}>
              <View>
                <Text style={styles.rouletteTitle}>🎰 Ruleta de Descuentos</Text>
                <Text style={styles.rouletteSubtitle}>¡Gira y gana cupones!</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categories}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive
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

        {/* Featured Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Ofertas Destacadas</Text>
          <View style={styles.productsGrid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.productCard}>
                {/* Discount Badge */}
                {item.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                  </View>
                )}
                
                {/* Product Image */}
                <View style={styles.productImage}>
                  <Text style={styles.productEmoji}>{item.image}</Text>
                </View>
                
                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.brandText}>{item.brand}</Text>
                  <Text style={styles.productName}>{item.name}</Text>
                  
                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  
                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{item.price}</Text>
                    {item.originalPrice && (
                      <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                    )}
                  </View>
                  
                  {/* Buy Button */}
                  <TouchableOpacity 
                    style={[styles.buyButton, !item.inStock && styles.buyButtonDisabled]}
                    onPress={() => item.inStock && buyItem(item)}
                    disabled={!item.inStock}
                  >
                    <Text style={styles.buyButtonText}>
                      {item.inStock ? 'Comprar' : 'Agotado'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sponsors Banner */}
        <View style={styles.sponsorsSection}>
          <Text style={styles.sectionTitle}>🤝 Nuestros Patrocinadores</Text>
          <View style={styles.sponsorsContainer}>
            {[
              { name: 'FitNutrition', logo: '💊' },
              { name: 'SportWear', logo: '👕' },
              { name: 'RunFast', logo: '👟' },
              { name: 'MuscleTech', logo: '💪' },
            ].map((sponsor, index) => (
              <View key={index} style={styles.sponsorCard}>
                <Text style={styles.sponsorLogo}>{sponsor.logo}</Text>
                <Text style={styles.sponsorName}>{sponsor.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Roulette Modal */}
      <Modal
        visible={showRoulette}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rouletteModal}>
            <View style={styles.rouletteWheel}>
              <Text style={styles.rouletteWheelText}>
                {rouletteSpinning ? '🎰 Girando...' : '🎰 Ruleta de Premios'}
              </Text>
              
              <View style={styles.wheelContainer}>
                {roulettePrizes.map((prize, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.wheelSlice,
                      { backgroundColor: prize.color }
                    ]}
                  >
                    <Text style={styles.wheelSliceText}>{prize.name}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.rouletteActions}>
              <TouchableOpacity 
                style={styles.spinButton}
                onPress={spinRoulette}
                disabled={rouletteSpinning}
              >
                <Text style={styles.spinButtonText}>
                  {rouletteSpinning ? 'Girando...' : '¡Girar!'}
                </Text>
              </TouchableOpacity>
              
              {!rouletteSpinning && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowRoulette(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rewardsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  rouletteBanner: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  rouletteGradient: {
    padding: 20,
  },
  rouletteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rouletteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rouletteSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF8E53',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImage: {
    alignItems: 'center',
    marginBottom: 10,
  },
  productEmoji: {
    fontSize: 40,
  },
  productInfo: {
    alignItems: 'flex-start',
  },
  brandText: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 12,
    marginLeft: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#8E8E93',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  buyButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '100%',
  },
  buyButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sponsorsSection: {
    marginBottom: 40,
  },
  sponsorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  sponsorCard: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  sponsorLogo: {
    fontSize: 24,
    marginBottom: 5,
  },
  sponsorName: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rouletteModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  rouletteWheel: {
    alignItems: 'center',
    marginBottom: 30,
  },
  rouletteWheelText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wheelContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  wheelSlice: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelSliceText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rouletteActions: {
    alignItems: 'center',
    gap: 15,
  },
  spinButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E8E93',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});

export default ShopScreen;