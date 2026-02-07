// src/lib/supabase.js - Cliente Supabase configurado
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Configuración de Supabase
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Configuración del cliente
const supabaseOptions = {
  auth: {
    // Configuración de autenticación
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-my-custom-header': 'iron-assistant',
    },
  },
};

// Verificar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Error: Faltan las credenciales de Supabase.\n' +
    'Asegúrate de que EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY estén configuradas en tu archivo .env'
  );
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Helpers para manejo de errores
export const handleSupabaseError = (error, operation = 'operación') => {
  console.error(`❌ Error en ${operation}:`, error);
  
  if (error?.message) {
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
  
  return {
    success: false,
    error: 'Error desconocido en la operación',
    code: 'UNKNOWN_ERROR'
  };
};

// Helper para operaciones exitosas
export const handleSupabaseSuccess = (data, message = 'Operación exitosa') => {
  console.log(`✅ ${message}`, data);
  return {
    success: true,
    data,
    message
  };
};

// Verificar conexión con Supabase
export const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión con Supabase...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error conectando con Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión exitosa con Supabase');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

// Info del cliente para debugging
export const getSupabaseInfo = () => {
  return {
    url: supabaseUrl?.substring(0, 30) + '...',
    keyPrefix: supabaseAnonKey?.substring(0, 10) + '...',
    isConfigured: !!(supabaseUrl && supabaseAnonKey)
  };
};

console.log('🔧 Supabase Client inicializado:', getSupabaseInfo());