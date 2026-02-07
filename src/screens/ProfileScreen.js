import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ProfileScreen = ({ navigation }) => {
  const { state, actions } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: actions.logout },
      ]
    );
  };

  const profileStats = [
    { label: 'Entrenamientos', value: state.workouts.length, icon: 'fitness' },
    { label: 'Racha', value: `${state.streaks} días`, icon: 'flame' },
    { label: 'Puntos', value: state.rewards, icon: 'gift' },
    { label: 'Nivel', value: 'Intermedio', icon: 'trophy' },
  ];

  const menuOptions = [
    { title: 'Editar Perfil', icon: 'person-outline', onPress: () => Alert.alert('En desarrollo') },
    { title: 'Configuración', icon: 'settings-outline', onPress: () => Alert.alert('En desarrollo') },
    { title: 'Estadísticas', icon: 'analytics-outline', onPress: () => Alert.alert('En desarrollo') },
    { title: 'Ayuda', icon: 'help-circle-outline', onPress: () => Alert.alert('En desarrollo') },
    { title: 'Acerca de', icon: 'information-circle-outline', onPress: () => Alert.alert('GymIA v1.0') },
    { title: 'Cerrar Sesión', icon: 'log-out-outline', onPress: handleLogout, danger: true },
  ];

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B35', '#FF8E53']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {state.user?.name?.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{state.user?.name}</Text>
          <Text style={styles.userEmail}>{state.user?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#FF6B35" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={option.onPress}
            >
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={option.danger ? "#FF4444" : "#FFFFFF"} 
              />
              <Text style={[
                styles.menuText,
                option.danger && styles.menuTextDanger
              ]}>
                {option.title}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={option.danger ? "#FF4444" : "#8E8E93"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#8E8E93',
    fontSize: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  menuContainer: {
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.1)',
  },
  menuText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
  },
  menuTextDanger: {
    color: '#FF4444',
  },
});

export default ProfileScreen;