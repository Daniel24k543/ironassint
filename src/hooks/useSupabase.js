// src/hooks/useSupabase.js - Hook personalizado para Supabase
import { useState, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase';
import { ProfileService } from '../services/profile.service';
import { BodyScanService } from '../services/bodyScan.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeSupabase();
  }, []);

  const initializeSupabase = async () => {
    try {
      setIsLoading(true);
      console.log('🔧 Inicializando conexión con Supabase...');

      // Verificar conexión
      const connectionResult = await testConnection();
      setIsConnected(connectionResult);

      // Obtener usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (connectionResult) {
        console.log('✅ Supabase inicializado correctamente');
      } else {
        console.log('⚠️ Supabase no está disponible, trabajando offline');
      }

    } catch (err) {
      console.error('❌ Error inicializando Supabase:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado
    isConnected,
    isLoading,
    user,
    error,
    
    // Cliente directo (por si necesitas acceso completo)
    supabase,
    
    // Servicios
    ProfileService,
    BodyScanService,
    
    // Funciones de utilidad
    initialize: initializeSupabase,
  };
};

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const result = await ProfileService.getProfile();
      
      if (result.success) {
        setProfile(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const result = await ProfileService.upsertProfile(profileData);
      
      if (result.success) {
        setProfile(result.data);
        setError(null);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async (newStreak) => {
    try {
      setIsLoading(true);
      const result = await ProfileService.updateStreak(newStreak);
      
      if (result.success) {
        setProfile(result.data);
        setError(null);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    saveProfile,
    updateStreak,
  };
};

export const useBodyScans = () => {
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadScans = async (limit = 10) => {
    try {
      setIsLoading(true);
      const result = await BodyScanService.getScanHistory(limit);
      
      if (result.success) {
        setScans(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processScan = async (imageUri, aiAnalysis = {}) => {
    try {
      setIsLoading(true);
      const result = await BodyScanService.processBodyScan(imageUri, aiAnalysis);
      
      if (result.success) {
        // Recargar historial para incluir el nuevo escaneo
        await loadScans();
        setError(null);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScan = async (scanId) => {
    try {
      setIsLoading(true);
      const result = await BodyScanService.deleteScan(scanId);
      
      if (result.success) {
        // Actualizar lista local
        setScans(scans.filter(scan => scan.id !== scanId));
        setError(null);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  return {
    scans,
    isLoading,
    error,
    loadScans,
    processScan,
    deleteScan,
  };
};

export default useSupabase;