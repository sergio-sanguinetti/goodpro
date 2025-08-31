import { supabase } from '../lib/supabase'

// Tipos para el servicio de storage
export interface FileUploadResult {
  success: boolean
  filePath?: string
  error?: string
}

export interface FileDownloadResult {
  success: boolean
  url?: string
  error?: string
}

// Servicio para manejo de archivos en Supabase Storage
export class StorageService {
  // Subir archivo de documento
  static async uploadDocument(
    file: File,
    companyId: string,
    projectId: string,
    documentId: string,
    versionNumber: string
  ): Promise<FileUploadResult> {
    try {
      console.log('📤 StorageService.uploadDocument iniciado');
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size);
      console.log('🏢 CompanyId:', companyId);
      console.log('📂 ProjectId:', projectId);
      console.log('📄 DocumentId:', documentId);
      console.log('🔢 Version:', versionNumber);
      
      // Validar tipo de archivo
      if (!this.validateFileType(file, this.DOCUMENT_TYPES)) {
        console.error('❌ Tipo de archivo no permitido:', file.type);
        return { 
          success: false, 
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)` 
        };
      }

      // Validar tamaño de archivo
      if (!this.validateFileSize(file, this.MAX_DOCUMENT_SIZE)) {
        console.error('❌ Archivo demasiado grande:', file.size);
        return { 
          success: false, 
          error: `Archivo demasiado grande. Tamaño máximo: ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB` 
        };
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${companyId}/${projectId}/${documentId}/${versionNumber}/${fileName}`
      
      console.log('📍 FilePath generado:', filePath);
      console.log('📍 CompanyId:', companyId);
      console.log('📍 ProjectId:', projectId);
      console.log('📍 DocumentId:', documentId);
      console.log('📍 VersionNumber:', versionNumber);
      console.log('📍 FileName:', fileName);

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error subiendo a storage:', error);
        return { success: false, error: error.message }
      }

      console.log('✅ Archivo subido exitosamente al storage');
      return { success: true, filePath }
    } catch (error) {
      console.error('Error subiendo documento:', error)
      return { success: false, error: 'Error interno subiendo archivo' }
    }
  }

  // Subir archivo de registro (formato base)
  static async uploadRecord(
    file: File,
    companyId: string,
    projectId: string,
    recordId: string,
    versionNumber: string
  ): Promise<FileUploadResult> {
    try {
      console.log('📤 StorageService.uploadRecord iniciado');
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size);
      console.log('🏢 CompanyId:', companyId);
      console.log('📂 ProjectId:', projectId);
      console.log('📄 RecordId:', recordId);
      console.log('🔢 Version:', versionNumber);
      
      // Validar tipo de archivo
      if (!this.validateFileType(file, this.RECORD_TYPES)) {
        console.error('❌ Tipo de archivo no permitido:', file.type);
        return { 
          success: false, 
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), imágenes (.jpg, .png, .webp)` 
        };
      }

      // Validar tamaño de archivo
      if (!this.validateFileSize(file, this.MAX_DOCUMENT_SIZE)) {
        console.error('❌ Archivo demasiado grande:', file.size);
        return { 
          success: false, 
          error: `Archivo demasiado grande. Tamaño máximo: ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB` 
        };
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${companyId}/${projectId}/${recordId}/${versionNumber}/${fileName}`
      
      console.log('📍 FilePath generado:', filePath);

      const { error } = await supabase.storage
        .from('records')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error subiendo a storage:', error);
        return { success: false, error: error.message }
      }

      console.log('✅ Archivo subido exitosamente al storage');
      return { success: true, filePath }
    } catch (error) {
      console.error('Error subiendo registro:', error)
      return { success: false, error: 'Error interno subiendo archivo' }
    }
  }

  // Subir archivo de registro lleno
  static async uploadRecordEntry(
    file: File,
    companyId: string,
    projectId: string,
    recordFormatId: string,
    entryId: string
  ): Promise<FileUploadResult> {
    try {
      console.log('📤 StorageService.uploadRecordEntry iniciado');
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size);
      console.log('🏢 CompanyId:', companyId);
      console.log('📂 ProjectId:', projectId);
      console.log('📄 RecordFormatId:', recordFormatId);
      console.log('🆔 EntryId:', entryId);
      
      // Validar tipo de archivo
      if (!this.validateFileType(file, this.RECORD_TYPES)) {
        console.error('❌ Tipo de archivo no permitido:', file.type);
        return { 
          success: false, 
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)` 
        };
      }

      // Validar tamaño de archivo
      if (!this.validateFileSize(file, this.MAX_DOCUMENT_SIZE)) {
        console.error('❌ Archivo demasiado grande:', file.size);
        return { 
          success: false, 
          error: `Archivo demasiado grande. Tamaño máximo: ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB` 
        };
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${companyId}/${projectId}/${recordFormatId}/${entryId}/${fileName}`
      
      console.log('📍 FilePath generado:', filePath);

      const { error } = await supabase.storage
        .from('record-entries')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error subiendo a storage:', error);
        return { success: false, error: error.message }
      }

      console.log('✅ Archivo subido exitosamente al storage');
      return { success: true, filePath }
    } catch (error) {
      console.error('Error subiendo registro lleno:', error)
      return { success: false, error: 'Error interno subiendo archivo' }
    }
  }

  // Obtener URL pública para descarga
  static async getDownloadUrl(bucket: string, filePath: string): Promise<FileDownloadResult> {
    try {
      // Limpiar la ruta del archivo - remover / inicial si existe
      const cleanFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      console.log('🔍 StorageService.getDownloadUrl - Bucket:', bucket);
      console.log('🔍 StorageService.getDownloadUrl - Original filePath:', filePath);
      console.log('🔍 StorageService.getDownloadUrl - Clean filePath:', cleanFilePath);
      
      // Usar URL pública directamente (más simple y accesible)
      console.log('🔍 Generando URL pública...');
      const { data: publicData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(cleanFilePath);
      
      if (publicData?.publicUrl) {
        console.log('✅ URL pública generada:', publicData.publicUrl);
        return { success: true, url: publicData.publicUrl };
      } else {
        console.error('❌ Error generando URL pública');
        return { success: false, error: 'Error generando URL pública' };
      }
    } catch (error) {
      console.error('Error generando URL de descarga:', error)
      return { success: false, error: 'Error interno generando URL' }
    }
  }

  // Eliminar archivo
  static async deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      return { success: false, error: 'Error interno eliminando archivo' }
    }
  }

  // Subir avatar de usuario
  static async uploadAvatar(file: File, userId: string): Promise<FileUploadResult> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Permitir reemplazar avatar existente
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, filePath: fileName }
    } catch (error) {
      console.error('Error subiendo avatar:', error)
      return { success: false, error: 'Error interno subiendo avatar' }
    }
  }

  // Obtener URL pública para avatar
  static getPublicAvatarUrl(fileName: string): string {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // Validar tipo de archivo
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  // Validar tamaño de archivo (en bytes)
  static validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes
  }

  // Constantes para validación
  static readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB
  static readonly MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB
  
  static readonly DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  static readonly RECORD_TYPES = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
  
  static readonly IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
}