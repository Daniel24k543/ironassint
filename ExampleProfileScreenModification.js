// ExampleProfileScreenModification.js - Ejemplo de cómo modificar ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit'; // Si ya tienes gráficas

// Import del nuevo banner
import { BodyScanBanner } from '../components/BodyScanBanner';

export const ModifiedProfileScreenExample = ({ navigation }) => {
  // Datos de ejemplo - reemplaza con tus datos reales
  const userStats = {
    followers: 1234,
    following: 567,
    workouts: 89
  };

  const weightData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [{
      data: [75, 73, 72, 71, 70]
    }]
  };

  const handleBodyScanPress = () => {
    navigation.navigate('BodyScanIntro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Tu header existente */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Tu Nombre</Text>
              <Text style={styles.profileBio}>Transformando mi cuerpo con IA</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas - Tu sección existente */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.followers}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.following}</Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.workouts}</Text>
            <Text style={styles.statLabel}>Entrenamientos</Text>
          </View>
        </View>

        {/* 🔥 NUEVO: Banner de Escaneo Corporal - Insertar AQUÍ */}
        <BodyScanBanner onPress={handleBodyScanPress} />

        {/* Gráfica de peso - Tu gráfica existente */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Progreso de Peso</Text>
            <TouchableOpacity>
              <MaterialIcons name="more-vert" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          {/* Tu gráfica existente aquí */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartPlaceholder}>
              [Tu gráfica de peso existente]
            </Text>
          </View>
        </View>

        {/* Resto de contenido - Tus secciones existentes */}
        <View style={styles.otherContent}>
          <Text style={styles.sectionTitle}>Otros datos del perfil...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  
  // Header styles (mantener tus estilos existentes)
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Stats styles (mantener tus estilos existentes)
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
    marginHorizontal: 20,
  },

  // Chart section (mantener tus estilos existentes)
  chartSection: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  chartPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },

  // Other content
  otherContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

/* 
INSTRUCCIONES DE INTEGRACIÓN EN TU PROFILESCREEN.JS EXISTENTE:

1. IMPORTAR EL COMPONENTE:
   import { BodyScanBanner } from '../components/BodyScanBanner';

2. AGREGAR LA FUNCIÓN DE NAVEGACIÓN:
   const handleBodyScanPress = () => {
     navigation.navigate('BodyScanIntro');
   };

3. INSERTAR EL BANNER EXACTAMENTE DESPUÉS DE LAS ESTADÍSTICAS:
   {/* Tus estadísticas existentes */}
   <View style={yourExistingStatsStyles}>
     // Tu código de followers/following existente
   </View>

   {/* NUEVO: Insertar aquí */}
   <BodyScanBanner onPress={handleBodyScanPress} />

   {/* Tu gráfica de peso existente */}
   <View style={yourExistingChartStyles}>
     // Tu gráfica existente
   </View>

4. AGREGAR A TU NAVEGADOR:
   <Stack.Screen name="BodyScanIntro" component={BodyScanIntroScreen} />
   <Stack.Screen name="BodyScanCapture" component={BodyScanCaptureScreen} />

¡Eso es todo! El banner se integrará perfectamente con tu diseño existente.
*/