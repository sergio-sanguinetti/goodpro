import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

// Función helper para manejar errores de red
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, error)
  
  if (error.message?.includes('Failed to fetch')) {
    throw new Error(`Error de conexión: No se puede conectar a la base de datos. Verifica tu conexión a internet y la configuración de Supabase.`)
  }
  
  if (error.message?.includes('JWT')) {
    throw new Error(`Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.`)
  }
  
  throw new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`)
}

// Tipos de la base de datos
type Company = Database['public']['Tables']['companies']['Row']
type User = Database['public']['Tables']['users']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type DocumentCategory = Database['public']['Tables']['document_categories']['Row']
type Document = Database['public']['Tables']['documents']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

// Servicios de base de datos
export class DatabaseService {
  // =============================
  // COMPANIES
  // =============================
  
  static async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('razon_social')

      if (error) throw error
      return data || []
    } catch (error) {
      handleDatabaseError(error, 'obtener empresas')
    }
  }

  static async createCompany(company: {
    razon_social: string
    ruc: string
  }): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCompany(id: string, updates: {
    razon_social?: string
    ruc?: string
    is_active?: boolean
  }): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================
  // USERS
  // =============================
  
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getUsersByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async updateUser(id: string, updates: {
    name?: string
    telefono?: string
    role?: 'admin' | 'company_user'
    company_id?: string
    is_active?: boolean
    can_view_all_company_projects?: boolean
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================
  // PROJECTS
  // =============================
  
  static async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sede')

    if (error) throw error
    return data || []
  }

  static async getProjectsByCompany(companyId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('sede')

    if (error) throw error
    return data || []
  }

  static async createProject(project: {
    sede: string
    descripcion: string
    company_id: string
    fecha_inicio: string
    fecha_fin?: string
  }): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateProject(id: string, updates: {
    sede?: string
    descripcion?: string
    fecha_inicio?: string
    fecha_fin?: string
    status?: 'active' | 'completed' | 'suspended'
    is_active?: boolean
  }): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Agregar contacto a proyecto
  static async addProjectContact(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_contacts')
      .insert({ project_id: projectId, user_id: userId })

    if (error) throw error
  }

  // Remover contacto de proyecto
  static async removeProjectContact(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_contacts')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // =============================
  // DOCUMENT CATEGORIES
  // =============================
  
  static async getDocumentCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async createDocumentCategory(category: {
    name: string
    description?: string
    normative_reference?: string
    type: 'document' | 'record'
    is_required?: boolean
    renewal_period_months?: number
  }): Promise<DocumentCategory> {
    const { data, error } = await supabase
      .from('document_categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================
  // DOCUMENTS
  // =============================
  
  static async getDocumentsByProject(projectId: string): Promise<(Document & {
    category: DocumentCategory
    versions: any[]
    roles: any[]
  })[]> {
    console.log('🔍 DatabaseService.getDocumentsByProject - Loading documents for project:', projectId);
    
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(*),
        versions:document_versions(
          id,
          version_number,
          file_name, 
          file_path,
          file_size,
          uploaded_by,
          uploaded_at,
          changes,
          is_active
        ),
        roles:document_roles(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    console.log('📊 Query result:', { data: data?.length || 0, error: error?.message });
    
    if (data) {
      data.forEach(doc => {
        console.log(`📄 Document: ${doc.nombre}`);
        console.log(`📁 Versions: ${doc.versions?.length || 0}`);
        doc.versions?.forEach(version => {
          console.log(`  📋 Version ${version.version_number}: ${version.file_name} (Active: ${version.is_active})`);
        });
      });
    }
    
    if (error) throw error
    return data || []
  }

  static async createDocument(document: {
    nombre: string
    codigo: string
    version?: string
    category_id: string
    project_id: string
    fecha_creacion?: string
    fecha_vencimiento: string
    status?: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'
    notes?: string
    created_by?: string
  }): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDocument(id: string, updates: {
    nombre?: string
    codigo?: string
    version?: string
    fecha_vencimiento?: string
    status?: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'
    notes?: string
    approved_by?: string
    approved_at?: string
  }): Promise<Document> {
    console.log('🔄 DatabaseService.updateDocument - ID:', id);
    console.log('📝 Updates:', updates);
    
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
    if (!data) {
      throw new Error('No document was updated');
    }
    
    console.log('✅ Document updated successfully:', data);
    return data;
  }

  // Eliminar documento (cambiar a inactivo)
  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Crear versión de documento
  static async createDocumentVersion(version: {
    document_id: string
    version_number: string
    file_name: string
    file_path: string
    file_size: number
    uploaded_by: string
    changes?: string
    is_active?: boolean
  }): Promise<any> {
    console.log('📝 DatabaseService.createDocumentVersion llamado con:', version);
    
    // Desactivar versiones anteriores si esta es activa
    if (version.is_active) {
      console.log('🔄 Desactivando versiones anteriores del documento:', version.document_id);
      await supabase
        .from('document_versions')
        .update({ is_active: false })
        .eq('document_id', version.document_id)
    }

    const { data, error } = await supabase
      .from('document_versions')
      .insert(version)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando versión:', error);
      throw error;
    }
    
    console.log('✅ Versión creada exitosamente:', data);
    return data
  }

  // Crear roles de documento
  static async createDocumentRoles(documentId: string, roles: {
    nombres: string
    apellidos: string
    email: string
    role: 'elaborator' | 'reviewer' | 'approver'
    user_id?: string
  }[]): Promise<void> {
    const rolesWithDocumentId = roles.map(role => ({
      ...role,
      document_id: documentId
    }))

    const { error } = await supabase
      .from('document_roles')
      .insert(rolesWithDocumentId)

    if (error) throw error
  }

  // =============================
  // NOTIFICATIONS
  // =============================
  
  static async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  }

  static async createNotification(notification: {
    user_id: string
    company_id?: string
    project_id?: string
    document_id?: string
    record_format_id?: string
    record_entry_id?: string
    type: 'warning' | 'success' | 'info' | 'error'
    title: string
    message: string
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================
  // DASHBOARD STATS
  // =============================
  
  // =============================
  // RECORD FORMATS
  // =============================
  
  static async getRecordFormatsByProject(projectId: string): Promise<any[]> {
    console.log('🔍 DatabaseService.getRecordFormatsByProject - Loading record formats for project:', projectId);
    
    const { data, error } = await supabase
      .from('record_formats')
      .select(`
        *,
        category:document_categories(*),
        versions:record_format_versions(
          id,
          version_number,
          file_name, 
          file_path,
          file_size,
          uploaded_by,
          uploaded_at,
          changes,
          is_active
        ),
        roles:record_format_roles(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    console.log('📊 Record formats query result:', { data: data?.length || 0, error: error?.message });
    
    if (data) {
      data.forEach(record => {
        console.log(`📄 Record format: ${record.nombre}`);
        console.log(`📁 Versions: ${record.versions?.length || 0}`);
        record.versions?.forEach(version => {
          console.log(`  📋 Version ${version.version_number}: ${version.file_name} (Active: ${version.is_active})`);
        });
      });
    }
    
    if (error) throw error
    return data || []
  }

  static async createRecordFormat(recordFormat: {
    nombre: string
    codigo: string
    version?: string
    category_id: string
    project_id: string
    fecha_creacion?: string
    fecha_vencimiento: string
    status?: 'draft' | 'pending_review' | 'approved' | 'expired'
    notes?: string
    created_by?: string
  }): Promise<any> {
    console.log('📝 DatabaseService.createRecordFormat llamado con:', recordFormat);
    
    const { data, error } = await supabase
      .from('record_formats')
      .insert(recordFormat)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando record format:', error);
      throw error;
    }
    
    console.log('✅ Record format creado exitosamente:', data);
    return data
  }

  static async updateRecordFormat(id: string, updates: {
    nombre?: string
    codigo?: string
    version?: string
    fecha_vencimiento?: string
    status?: 'draft' | 'pending_review' | 'approved' | 'expired'
    notes?: string
    approved_by?: string
    approved_at?: string
  }): Promise<any> {
    console.log('🔄 DatabaseService.updateRecordFormat - ID:', id);
    console.log('📝 Updates:', updates);
    
    const { data, error } = await supabase
      .from('record_formats')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating record format:', error);
      throw error;
    }
    if (!data) {
      throw new Error('No record format was updated');
    }
    
    console.log('✅ Record format updated successfully:', data);
    return data;
  }

  // Crear versión de record format
  static async createRecordFormatVersion(version: {
    record_format_id: string
    version_number: string
    file_name: string
    file_path: string
    file_size: number
    uploaded_by: string
    changes?: string
    is_active?: boolean
  }): Promise<any> {
    console.log('📝 DatabaseService.createRecordFormatVersion llamado con:', version);
    
    // Desactivar versiones anteriores si esta es activa
    if (version.is_active) {
      console.log('🔄 Desactivando versiones anteriores del record format:', version.record_format_id);
      await supabase
        .from('record_format_versions')
        .update({ is_active: false })
        .eq('record_format_id', version.record_format_id)
    }

    const { data, error } = await supabase
      .from('record_format_versions')
      .insert(version)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando versión de record format:', error);
      throw error;
    }
    
    console.log('✅ Versión de record format creada exitosamente:', data);
    return data
  }

  // Crear roles de record format
  static async createRecordFormatRoles(recordFormatId: string, roles: {
    nombres: string
    apellidos: string
    email: string
    role: 'elaborator' | 'reviewer' | 'approver'
    user_id?: string
  }[]): Promise<void> {
    const rolesWithRecordFormatId = roles.map(role => ({
      ...role,
      record_format_id: recordFormatId
    }))

    const { error } = await supabase
      .from('record_format_roles')
      .insert(rolesWithRecordFormatId)

    if (error) throw error
  }

  // Eliminar record format
  static async deleteRecordFormat(id: string): Promise<void> {
    const { error } = await supabase
      .from('record_formats')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record format:', error);
      throw error;
    }
  }

  // =============================
  // RECORD ENTRIES (REGISTROS LLENOS)
  // =============================
  
  static async getRecordEntriesByProject(projectId: string): Promise<any[]> {
    console.log('🔍 DatabaseService.getRecordEntriesByProject - Loading record entries for project:', projectId);
    console.log('🕐 Timestamp consulta:', new Date().toISOString());
    
    // Primero obtener todos los record formats del proyecto
    const { data: recordFormats, error: formatsError } = await supabase
      .from('record_formats')
      .select('id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (formatsError) {
      console.error('❌ Error obteniendo record formats:', formatsError);
      throw formatsError;
    }

    if (!recordFormats || recordFormats.length === 0) {
      console.log('⚠️ No hay record formats para este proyecto');
      return [];
    }

    const formatIds = recordFormats.map(rf => rf.id);
    console.log('📋 Format IDs encontrados:', formatIds);

    // Obtener record entries para estos formatos
    console.log('🔍 Buscando record entries para formatIds:', formatIds);
    const { data, error } = await supabase
      .from('record_entries')
      .select(`
        *,
        record_format:record_formats(
          id,
          nombre,
          codigo,
          project_id
        )
      `)
      .in('record_format_id', formatIds)
      .order('uploaded_at', { ascending: false })

    console.log('📊 Query SQL equivalente:');
    console.log(`SELECT * FROM record_entries WHERE record_format_id IN (${formatIds.map(id => `'${id}'`).join(', ')}) ORDER BY uploaded_at DESC`);
    
    console.log('📊 Record entries query result:', { 
      data: data?.length || 0, 
      error: error?.message,
      formatIds: formatIds,
      projectId: projectId,
      rawData: data?.slice(0, 3) // Mostrar primeros 3 para debug
    });
    
    if (data && data.length > 0) {
      console.log('📄 Record entries encontrados:');
      data.forEach((entry, index) => {
        console.log(`  ${index + 1}. ID: ${entry.id.substring(0, 8)} | ${entry.nombre} | Format: ${entry.record_format?.nombre} | Status: ${entry.status}`);
      });
    } else {
      console.log('⚠️ No se encontraron record entries para los formatos:', formatIds);
      console.log('💡 Verificando si hay entries en la tabla...');
      
      // Debug adicional: verificar si hay entries en general
      const { data: allEntries } = await supabase
        .from('record_entries')
        .select('id, nombre, record_format_id')
        .limit(5);
      
      console.log('🔍 Primeros 5 record entries en la tabla:', allEntries);
    }
    
    if (error) throw error
    return data || []
  }

  static async getRecordEntriesByFormat(recordFormatId: string): Promise<any[]> {
    console.log('🔍 DatabaseService.getRecordEntriesByFormat - Loading entries for format:', recordFormatId);
    
    const { data, error } = await supabase
      .from('record_entries')
      .select('*')
      .eq('record_format_id', recordFormatId)
      .order('uploaded_at', { ascending: false })

    console.log('📊 Record entries for format result:', { data: data?.length || 0, error: error?.message });
    
    if (error) throw error
    return data || []
  }

  static async createRecordEntry(recordEntry: {
    record_format_id: string
    nombre: string
    fecha_realizacion: string
    file_name: string
    file_path: string
    file_size: number
    uploaded_by: string
    status?: 'pending' | 'approved' | 'rejected'
    notes?: string
  }): Promise<any> {
    console.log('📝 DatabaseService.createRecordEntry llamado con:', recordEntry);
    
    const { data, error } = await supabase
      .from('record_entries')
      .insert(recordEntry)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando record entry:', error);
      throw error;
    }
    
    console.log('✅ Record entry creado exitosamente:', data);
    return data
  }

  static async updateRecordEntry(id: string, updates: {
    nombre?: string
    fecha_realizacion?: string
    status?: 'pending' | 'approved' | 'rejected'
    approved_by?: string
    approved_at?: string
    notes?: string
  }): Promise<any> {
    console.log('🔄 DatabaseService.updateRecordEntry - ID:', id);
    console.log('📝 Updates:', updates);
    
    const { data, error } = await supabase
      .from('record_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating record entry:', error);
      throw error;
    }
    
    console.log('✅ Record entry updated successfully:', data);
    return data;
  }

  static async deleteRecordEntry(id: string): Promise<void> {
    console.log('🗑️ DatabaseService.deleteRecordEntry - ID:', id);
    
    const { error } = await supabase
      .from('record_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting record entry:', error);
      throw error;
    }
    
    console.log('✅ Record entry deleted successfully');
  }

  static async getDashboardStats(companyId?: string): Promise<{
    totalCompanies: number
    totalProjects: number
    totalActiveProjects: number
    totalDocuments: number
    totalUsers: number
    documentsThisMonth: number
    projectsThisMonth: number
  }> {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      let companiesQuery = supabase.from('companies').select('count', { count: 'exact' })
      let projectsQuery = supabase.from('projects').select('count', { count: 'exact' })
      let activeProjectsQuery = supabase.from('projects').select('count', { count: 'exact' }).eq('is_active', true)
      let documentsQuery = supabase.from('documents').select('count', { count: 'exact' })
      let usersQuery = supabase.from('users').select('count', { count: 'exact' })
      let documentsThisMonthQuery = supabase.from('documents').select('count', { count: 'exact' }).gte('created_at', firstDayOfMonth)
      let projectsThisMonthQuery = supabase.from('projects').select('count', { count: 'exact' }).gte('created_at', firstDayOfMonth)

      // Si hay companyId, filtrar por empresa
      if (companyId) {
        projectsQuery = projectsQuery.eq('company_id', companyId)
        activeProjectsQuery = activeProjectsQuery.eq('company_id', companyId)
        usersQuery = usersQuery.eq('company_id', companyId)
        projectsThisMonthQuery = projectsThisMonthQuery.eq('company_id', companyId)

        // Para documentos, necesitamos hacer join con projects
        const { data: projectIds } = await supabase
          .from('projects')
          .select('id')
          .eq('company_id', companyId)

        if (projectIds) {
          const ids = projectIds.map(p => p.id)
          documentsQuery = documentsQuery.in('project_id', ids)
          documentsThisMonthQuery = documentsThisMonthQuery.in('project_id', ids)
        }
      }

      const [
        companies,
        projects,
        activeProjects,
        documents,
        users,
        documentsThisMonth,
        projectsThisMonth
      ] = await Promise.all([
        companiesQuery,
        projectsQuery,
        activeProjectsQuery,
        documentsQuery,
        usersQuery,
        documentsThisMonthQuery,
        projectsThisMonthQuery
      ])

      return {
        totalCompanies: companies.count || 0,
        totalProjects: projects.count || 0,
        totalActiveProjects: activeProjects.count || 0,
        totalDocuments: documents.count || 0,
        totalUsers: users.count || 0,
        documentsThisMonth: documentsThisMonth.count || 0,
        projectsThisMonth: projectsThisMonth.count || 0
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw error
    }
  }

  // Ejecutar función de verificación de vencimientos
  static async checkExpiringDocuments(): Promise<void> {
    const { error } = await supabase.rpc('check_expiring_documents')
    if (error) throw error
  }

  // Desactivar todas las versiones de un registro
  static async deactivateAllRecordVersions(recordFormatId: string): Promise<void> {
    console.log('🔄 DatabaseService.deactivateAllRecordVersions - Record format ID:', recordFormatId);
    
    const { error } = await supabase
      .from('record_format_versions')
      .update({ is_active: false })
      .eq('record_format_id', recordFormatId);

    if (error) {
      console.error('❌ Error desactivando versiones:', error);
      throw error;
    }
    
    console.log('✅ Todas las versiones desactivadas correctamente');
  }

  // Activar una versión específica de un registro
  static async activateRecordVersion(versionId: string): Promise<void> {
    console.log('🔄 DatabaseService.activateRecordVersion - Version ID:', versionId);
    
    const { error } = await supabase
      .from('record_format_versions')
      .update({ is_active: true })
      .eq('id', versionId);

    if (error) {
      console.error('❌ Error activando versión:', error);
      throw error;
    }
    
    console.log('✅ Versión activada correctamente');
  }
}