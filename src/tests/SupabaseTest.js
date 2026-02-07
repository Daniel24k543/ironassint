// src/tests/SupabaseTest.js - Archivo de prueba para verificar integración
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { useSupabase, useProfile, useBodyScans } from '../hooks/useSupabase';
import { supabase, getSupabaseInfo } from '../lib/supabase';

const SupabaseTestScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { isConnected, isLoading, error, initialize } = useSupabase();
  const { profile, loadProfile } = useProfile();
  const { scans, loadScans } = useBodyScans();

  const addTestResult = (test, status, details) => {
    const result = {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'info'
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [result, ...prev]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addTestResult('Inicio de pruebas', 'info', 'Comenzando verificación de Supabase...');
    
    try {
      // Test 1: Información de configuración
      const info = getSupabaseInfo();
      addTestResult(
        '✅ Configuración',
        'success',
        `URL: ${info.url}, Key: ${info.keyPrefix}, Configurado: ${info.isConfigured}`
      );
      
      // Test 2: Conexión básica
      const { data: healthData, error: healthError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (healthError) {
        addTestResult('❌ Conexión', 'error', `Error: ${healthError.message}`);
      } else {
        addTestResult('✅ Conexión', 'success', 'Conectado exitosamente a Supabase');
      }
      
      // Test 3: Verificar tabla profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        addTestResult('❌ Tabla profiles', 'error', `Error: ${profilesError.message}`);
      } else {
        addTestResult('✅ Tabla profiles', 'success', `Tabla accesible. Registros encontrados: ${profilesData?.length || 0}`);
      }
      
      // Test 4: Verificar tabla body_scans
      const { data: scansData, error: scansError } = await supabase
        .from('body_scans')
        .select('*')
        .limit(1);
      
      if (scansError) {
        addTestResult('❌ Tabla body_scans', 'error', `Error: ${scansError.message}`);
      } else {
        addTestResult('✅ Tabla body_scans', 'success', `Tabla accesible. Registros encontrados: ${scansData?.length || 0}`);
      }
      
      // Test 5: Verificar storage bucket
      const { data: bucketsData, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        addTestResult('❌ Storage', 'error', `Error: ${bucketError.message}`);
      } else {
        const bodyScansExists = bucketsData?.some(bucket => bucket.name === 'body-scans');
        if (bodyScansExists) {
          addTestResult('✅ Storage body-scans', 'success', 'Bucket body-scans existe');
        } else {
          addTestResult('⚠️ Storage body-scans', 'error', 'Bucket body-scans no existe');
        }
      }
      
      // Test 6: Test de autenticación (obtener usuario actual)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addTestResult('ℹ️ Autenticación', 'info', `Sin usuario autenticado: ${userError.message}`);
      } else if (user) {
        addTestResult('✅ Autenticación', 'success', `Usuario: ${user.email || 'Sin email'}`);
      } else {
        addTestResult('ℹ️ Autenticación', 'info', 'Sin usuario autenticado (normal en desarrollo)');
      }
      
      addTestResult('🎉 Pruebas completadas', 'success', 'Todas las pruebas han finalizado');
      
    } catch (error) {
      addTestResult('💥 Error general', 'error', error.message);
    }
    
    setIsRunning(false);
  };

  const testProfileService = async () => {
    setIsRunning(true);
    addTestResult('Prueba ProfileService', 'info', 'Probando guardado de perfil...');
    
    try {
      const testProfile = {
        name: 'Usuario Test',
        email: 'test@gymia.app',
        weight: 75,
        height: 180,
        goal: 'muscle_gain',
        streak: 5,
        age: 25,
        gender: 'male',
        activityLevel: 'moderate',
        experienceLevel: 'beginner'
      };
      
      const result = await ProfileService.upsertProfile(testProfile);
      
      if (result.success) {
        addTestResult('✅ ProfileService', 'success', `Perfil guardado: ID ${result.data.id}`);
      } else {
        addTestResult('❌ ProfileService', 'error', result.error);
      }
    } catch (error) {
      addTestResult('❌ ProfileService', 'error', error.message);
    }
    
    setIsRunning(false);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Supabase Test Center</Text>
        <Text style={styles.subtitle}>Iron Assistant - Verificación de integración</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusItem, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>
            {isLoading ? 'Verificando...' : isConnected ? '✅ Conectado' : '❌ Desconectado'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '⏳ Ejecutando...' : '🚀 Ejecutar todas las pruebas'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testProfileService}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>🧑 Probar ProfileService</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearTests}
        >
          <Text style={styles.buttonText}>🧹 Limpiar resultados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.length === 0 ? (
          <Text style={styles.emptyText}>
            👋 ¡Hola! Ejecuta las pruebas para verificar tu integración con Supabase.
          </Text>
        ) : (
          testResults.map((result) => (
            <View 
              key={result.id} 
              style={[
                styles.resultItem, 
                { borderLeftColor: result.status === 'success' ? '#10B981' : result.status === 'error' ? '#EF4444' : '#3B82F6' }
              ]}
            >
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultDetails}>{result.details}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  statusContainer: {
    padding: 20,
  },
  statusItem: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonsContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  resultItem: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  resultTest: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  resultDetails: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  resultTime: {
    color: '#6B7280',
    fontSize: 12,
  },
});

export default SupabaseTestScreen;