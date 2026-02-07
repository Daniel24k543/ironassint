// src/services/bodyScan.service.js - Servicio de escaneo corporal
import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export class BodyScanService {
  
  /**
   * Subir imagen de escaneo corporal al storage
   * @param {Object} imageUri - URI de la imagen seleccionada
   * @param {String} userId - ID del usuario (opcional)
   */
  static async uploadBodyScanImage(imageUri, userId = null) {
    try {
      console.log('🔄 Subiendo imagen de escaneo corporal...', imageUri);
      
      // Validar URI de imagen
      if (!imageUri) {
        throw new Error('URI de imagen no válida');
      }
      
      // Obtener usuario actual si no se proporciona
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || `temp_${Date.now()}`;
      }
      
      // Generar nombre único para la imagen
      const timestamp = new Date().getTime();
      const fileExtension = this.getFileExtension(imageUri);
      const fileName = `body_scan_${userId}_${timestamp}.${fileExtension}`;
      const filePath = `body-scans/${fileName}`;
      
      // Preparar datos para subida
      let imageData;
      
      if (Platform.OS === 'web') {
        // Para web, convertir a blob
        const response = await fetch(imageUri);
        imageData = await response.blob();
      } else {
        // Para móvil, leer como base64 y convertir
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Convertir base64 a ArrayBuffer
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        imageData = new Uint8Array(byteNumbers);
      }
      
      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('body-scans')
        .upload(filePath, imageData, {
          contentType: `image/${fileExtension}`,
          upsert: false
        });
      
      if (uploadError) {
        return handleSupabaseError(uploadError, 'subir imagen');
      }
      
      // Obtener URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('body-scans')
        .getPublicUrl(filePath);
      
      console.log('✅ Imagen subida exitosamente:', filePath);
      
      return handleSupabaseSuccess({
        path: uploadData.path,
        fullPath: uploadData.fullPath,
        publicUrl: urlData.publicUrl,
        fileName: fileName
      }, 'Imagen subida exitosamente');
      
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      return handleSupabaseError(error, 'subir imagen de escaneo');
    }
  }
  
  /**
   * Guardar resultados del análisis de IA
   * @param {Object} scanData - Datos del escaneo corporal
   */
  static async saveScanResults(scanData) {
    try {
      console.log('🔄 Guardando resultados del escaneo...', scanData);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || `temp_${Date.now()}`;
      
      // Preparar datos del escaneo
      const scanPayload = {
        user_id: userId,
        image_url: scanData.imageUrl,
        image_path: scanData.imagePath || null,
        scan_type: scanData.scanType || 'progress',
        ai_analysis: scanData.aiAnalysis || {},
        metrics: scanData.metrics || {},
        notes: scanData.notes || null,
        scan_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Insertar en base de datos
      const { data, error } = await supabase
        .from('body_scans')
        .insert(scanPayload)
        .select()
        .single();
      
      if (error) {
        return handleSupabaseError(error, 'guardar resultados del escaneo');
      }
      
      return handleSupabaseSuccess(data, 'Resultados del escaneo guardados exitosamente');
      
    } catch (error) {
      console.error('❌ Error guardando resultados:', error);
      return handleSupabaseError(error, 'guardar resultados del escaneo');
    }
  }
  
  /**
   * Proceso completo: subir imagen + guardar resultados
   * @param {Object} imageUri - URI de la imagen
   * @param {Object} aiAnalysis - Resultados del análisis de IA
   */
  static async processBodyScan(imageUri, aiAnalysis = {}) {
    try {
      console.log('🔄 Procesando escaneo corporal completo...');
      
      // 1. Subir imagen
      const uploadResult = await this.uploadBodyScanImage(imageUri);
      
      if (!uploadResult.success) {
        return uploadResult;
      }
      
      // 2. Simular análisis de IA (reemplazar con IA real)
      const mockAIAnalysis = {
        confidence: 0.95,
        bodyFat: Math.random() * 10 + 15, // 15-25%
        muscleMass: Math.random() * 10 + 40, // 40-50%
        recommendations: [
          'Incrementar proteína en la dieta',
          'Enfocarse en ejercicios de resistencia',
          'Mantener rutina de cardio moderado'
        ],
        progress: Math.random() > 0.5 ? 'improving' : 'stable',
        comparison: 'Primera medición registrada'
      };
      
      const finalAnalysis = { ...mockAIAnalysis, ...aiAnalysis };
      
      // 3. Guardar resultados
      const saveResult = await this.saveScanResults({
        imageUrl: uploadResult.data.publicUrl,
        imagePath: uploadResult.data.path,
        aiAnalysis: finalAnalysis,
        metrics: {
          scanDate: new Date().toISOString(),
          imageSize: 'unknown',
          processingTime: '2.3s'
        },
        scanType: 'progress'
      });
      
      if (!saveResult.success) {
        return saveResult;
      }
      
      // 4. Retornar resultado completo
      return handleSupabaseSuccess({
        scan: saveResult.data,
        image: uploadResult.data,
        analysis: finalAnalysis
      }, 'Escaneo corporal procesado exitosamente');
      
    } catch (error) {
      console.error('❌ Error en proceso completo:', error);
      return handleSupabaseError(error, 'procesar escaneo corporal');
    }
  }
  
  /**
   * Obtener historial de escaneos del usuario
   */
  static async getScanHistory(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const { data, error } = await supabase
        .from('body_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scan_date', { ascending: false })
        .limit(limit);
      
      if (error) {
        return handleSupabaseError(error, 'obtener historial de escaneos');
      }
      
      return handleSupabaseSuccess(data, 'Historial obtenido exitosamente');
      
    } catch (error) {
      return handleSupabaseError(error, 'obtener historial');
    }
  }
  
  /**
   * Eliminar escaneo por ID
   */
  static async deleteScan(scanId) {
    try {
      const { data, error } = await supabase
        .from('body_scans')
        .delete()
        .eq('id', scanId)
        .select()
        .single();
      
      if (error) {
        return handleSupabaseError(error, 'eliminar escaneo');
      }
      
      // Eliminar imagen del storage si existe
      if (data.image_path) {
        await supabase.storage
          .from('body-scans')
          .remove([data.image_path]);
      }
      
      return handleSupabaseSuccess(data, 'Escaneo eliminado exitosamente');
      
    } catch (error) {
      return handleSupabaseError(error, 'eliminar escaneo');
    }
  }
  
  /**
   * Helper: Obtener extensión del archivo
   */
  static getFileExtension(uri) {
    const extension = uri.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  }
  
  /**
   * Verificar si el bucket existe y crear si es necesario
   */
  static async ensureBucketExists() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'body-scans');
      
      if (!bucketExists) {
        console.log('🔄 Creando bucket body-scans...');
        const { error } = await supabase.storage.createBucket('body-scans', {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });
        
        if (error) {
          console.error('❌ Error creando bucket:', error);
          return false;
        }
        
        console.log('✅ Bucket body-scans creado exitosamente');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error verificando bucket:', error);
      return false;
    }
  }
}

export default BodyScanService;