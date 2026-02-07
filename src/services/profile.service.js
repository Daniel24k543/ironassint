// src/services/profile.service.js - Servicio de gestión de perfiles
import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ProfileService {
  
  /**
   * Crear o actualizar perfil de usuario después del onboarding
   * @param {Object} profileData - Datos del perfil del usuario
   */
  static async upsertProfile(profileData) {
    try {
      console.log('🔄 Guardando perfil de usuario...', profileData);
      
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Usuario no autenticado:', userError);
        // Si no hay usuario autenticado, crear un perfil temporal
        return this.saveTemporaryProfile(profileData);
      }
      
      // Preparar datos del perfil
      const profilePayload = {
        id: user.id,
        email: user.email,
        display_name: profileData.name || 'Usuario Iron Assistant',
        weight: parseFloat(profileData.weight) || null,
        height: parseFloat(profileData.height) || null,
        goal: profileData.goal || 'muscle_gain',
        streak: parseInt(profileData.streak) || 0,
        age: parseInt(profileData.age) || null,
        gender: profileData.gender || null,
        activity_level: profileData.activityLevel || 'moderate',
        experience_level: profileData.experienceLevel || 'beginner',
        target_weight: parseFloat(profileData.targetWeight) || null,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insertar o actualizar perfil
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) {
        return handleSupabaseError(error, 'crear perfil');
      }
      
      // Guardar datos localmente
      await this.saveProfileLocally(data);
      
      return handleSupabaseSuccess(data, 'Perfil guardado exitosamente');
      
    } catch (error) {
      console.error('❌ Error inesperado al guardar perfil:', error);
      return handleSupabaseError(error, 'guardar perfil');
    }
  }
  
  /**
   * Obtener perfil de usuario actual
   */
  static async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Intentar obtener perfil temporal
        return this.getTemporaryProfile();
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.log('🔄 Perfil no encontrado, obteniendo desde cache local...');
        return this.getProfileLocally();
      }
      
      await this.saveProfileLocally(data);
      return handleSupabaseSuccess(data, 'Perfil obtenido exitosamente');
      
    } catch (error) {
      return handleSupabaseError(error, 'obtener perfil');
    }
  }
  
  /**
   * Actualizar streak del usuario
   */
  static async updateStreak(newStreak) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          streak: newStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        return handleSupabaseError(error, 'actualizar streak');
      }
      
      await this.saveProfileLocally(data);
      return handleSupabaseSuccess(data, `Streak actualizado a ${newStreak} días`);
      
    } catch (error) {
      return handleSupabaseError(error, 'actualizar streak');
    }
  }
  
  /**
   * Guardar perfil temporal cuando no hay autenticación
   */
  static async saveTemporaryProfile(profileData) {
    try {
      const tempProfile = {
        id: `temp_${Date.now()}`,
        ...profileData,
        isTemporary: true,
        created_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('temp_profile', JSON.stringify(tempProfile));
      
      return handleSupabaseSuccess(tempProfile, 'Perfil temporal guardado');
    } catch (error) {
      return handleSupabaseError(error, 'guardar perfil temporal');
    }
  }
  
  /**
   * Obtener perfil temporal
   */
  static async getTemporaryProfile() {
    try {
      const tempProfile = await AsyncStorage.getItem('temp_profile');
      
      if (tempProfile) {
        const profile = JSON.parse(tempProfile);
        return handleSupabaseSuccess(profile, 'Perfil temporal obtenido');
      }
      
      return { success: false, error: 'No hay perfil temporal guardado' };
    } catch (error) {
      return handleSupabaseError(error, 'obtener perfil temporal');
    }
  }
  
  /**
   * Guardar perfil en storage local
   */
  static async saveProfileLocally(profile) {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('❌ Error guardando perfil localmente:', error);
    }
  }
  
  /**
   * Obtener perfil desde storage local
   */
  static async getProfileLocally() {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      
      if (profile) {
        const profileData = JSON.parse(profile);
        return handleSupabaseSuccess(profileData, 'Perfil obtenido desde cache local');
      }
      
      return { success: false, error: 'No hay perfil en cache local' };
    } catch (error) {
      return handleSupabaseError(error, 'obtener perfil local');
    }
  }
  
  /**
   * Limpiar datos temporales
   */
  static async clearTemporaryData() {
    try {
      await AsyncStorage.removeItem('temp_profile');
      await AsyncStorage.removeItem('user_profile');
    } catch (error) {
      console.error('❌ Error limpiando datos temporales:', error);
    }
  }
}

export default ProfileService;