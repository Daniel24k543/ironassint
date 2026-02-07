// screens/SmartWatchScreen.js - Pantalla de conexión de smartwatch
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useBluetooth } from '../hooks/useBluetooth';

export const SmartWatchScreen = ({ navigation }) => {
  const {
    isScanning,
    isConnected,
    connectedDevice,
    scannedDevices,
    batteryLevel,
    connectionStatus,
    hasBluetoothPermission,
    error,
    startDeviceScan,
    stopDeviceScan,
    connectToDevice,
    disconnectDevice,
    requestPermissions,
    getBatteryLevel
  } = useBluetooth();

  const [autoReconnect, setAutoReconnect] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showAllDevices, setShowAllDevices] = useState(false);

  useEffect(() => {
    if (isConnected && connectedDevice) {
      getBatteryLevel(connectedDevice);
      // Configurar auto-reconexión
      setupAutoReconnect();
    }
  }, [isConnected, connectedDevice]);

  const setupAutoReconnect = () => {
    if (autoReconnect && connectedDevice) {
      // Implementar lógica de auto-reconexión
      console.log('Auto-reconexión configurada para:', connectedDevice.name);
    }
  };

  const handleDevicePress = async (device) => {
    if (isScanning) {
      stopDeviceScan();
    }
    
    Alert.alert(
      'Conectar Dispositivo',
      `¿Deseas conectarte a ${device.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Conectar',
          onPress: () => connectToDevice(device)
        }
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar',
      '¿Estás seguro de que quieres desconectar tu smartwatch?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          onPress: disconnectDevice,
          style: 'destructive'
        }
      ]
    );
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#757575';
      default: return '#757575';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'disconnected': return 'Desconectado';
      default: return 'No disponible';
    }
  };

  const renderDeviceIcon = (deviceName) => {
    const name = deviceName.toLowerCase();
    if (name.includes('apple watch') || name.includes('watch')) {
      return <Ionicons name="watch" size={24} color="#007AFF" />;
    } else if (name.includes('samsung') || name.includes('galaxy')) {
      return <MaterialIcons name="watch" size={24} color="#1976D2" />;
    } else if (name.includes('fitbit')) {
      return <MaterialIcons name="fitness-center" size={24} color="#00B0B9" />;
    } else if (name.includes('garmin')) {
      return <MaterialIcons name="directions-run" size={24} color="#007CC3" />;
    }
    return <MaterialIcons name="bluetooth" size={24} color="#2196F3" />;
  };

  const filteredDevices = showAllDevices 
    ? scannedDevices 
    : scannedDevices.filter(device => 
        device.name && 
        (device.name.toLowerCase().includes('watch') ||
         device.name.toLowerCase().includes('fit') ||
         device.name.toLowerCase().includes('samsung') ||
         device.name.toLowerCase().includes('apple') ||
         device.name.toLowerCase().includes('garmin') ||
         device.name.toLowerCase().includes('polar'))
      );

  if (!hasBluetoothPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="bluetooth-disabled" size={64} color="#757575" />
          <Text style={styles.permissionTitle}>
            Permisos de Bluetooth Requeridos
          </Text>
          <Text style={styles.permissionText}>
            Para conectar tu smartwatch, necesitamos acceso a Bluetooth.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>
              Otorgar Permisos
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SmartWatch</Text>
          <Text style={styles.subtitle}>Conecta tu dispositivo</Text>
        </View>

        {/* Connection Status */}
        {connectedDevice && (
          <View style={styles.connectedCard}>
            <View style={styles.deviceInfo}>
              {renderDeviceIcon(connectedDevice.name)}
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{connectedDevice.name}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]} />
                  <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
                    {getConnectionStatusText()}
                  </Text>
                </View>
              </View>
            </View>
            
            {batteryLevel !== null && (
              <View style={styles.batteryContainer}>
                <MaterialIcons name="battery-std" size={20} color="#4CAF50" />
                <Text style={styles.batteryText}>{batteryLevel}%</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <MaterialIcons name="bluetooth-disabled" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}

        {/* Scan Controls */}
        <View style={styles.scanContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={isScanning ? stopDeviceScan : startDeviceScan}
            disabled={connectionStatus === 'connecting'}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <MaterialIcons name="bluetooth-searching" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Escaneando...' : 'Buscar Dispositivos'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAllDevices(!showAllDevices)}
          >
            <MaterialIcons 
              name={showAllDevices ? "filter-list-off" : "filter-list"} 
              size={20} 
              color="#2196F3" 
            />
            <Text style={styles.filterButtonText}>
              {showAllDevices ? 'Solo Fitness' : 'Todos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Device List */}
        <View style={styles.deviceListContainer}>
          <Text style={styles.sectionTitle}>Dispositivos Encontrados</Text>
          
          {filteredDevices.length === 0 && !isScanning ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>
                No se encontraron dispositivos
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Asegúrate de que tu smartwatch esté en modo de emparejamiento
              </Text>
            </View>
          ) : (
            filteredDevices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceCard,
                  connectedDevice?.id === device.id && styles.connectedDeviceCard
                ]}
                onPress={() => handleDevicePress(device)}
              >
                <View style={styles.deviceCardContent}>
                  {renderDeviceIcon(device.name || 'Unknown')}
                  <View style={styles.deviceCardInfo}>
                    <Text style={styles.deviceCardName}>
                      {device.name || 'Dispositivo Desconocido'}
                    </Text>
                    <Text style={styles.deviceCardId}>
                      {device.id.substring(0, 8)}...
                    </Text>
                    {device.rssi && (
                      <Text style={styles.deviceCardRssi}>
                        Señal: {Math.abs(device.rssi)} dBm
                      </Text>
                    )}
                  </View>
                </View>
                
                {connectedDevice?.id === device.id ? (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                ) : (
                  <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="refresh" size={24} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto-reconexión</Text>
                <Text style={styles.settingDescription}>
                  Reconectar automáticamente cuando esté disponible
                </Text>
              </View>
            </View>
            <Switch
              value={autoReconnect}
              onValueChange={setAutoReconnect}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={autoReconnect ? '#2196F3' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="notifications" size={24} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notificaciones</Text>
                <Text style={styles.settingDescription}>
                  Mostrar alertas de conexión
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notifications ? '#2196F3' : '#9CA3AF'}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={24} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  connectedCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 16,
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  batteryText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  disconnectButton: {
    padding: 8,
  },
  scanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#1976D2',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deviceListContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  deviceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  connectedDeviceCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#0F4229',
  },
  deviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceCardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  deviceCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceCardId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  deviceCardRssi: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});