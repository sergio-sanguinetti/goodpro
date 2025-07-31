import { supabase } from '../lib/supabase'
import type { User } from '../types'

// Tipos de autenticación
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'company_user'
  company_id?: string
  is_active: boolean
  permissions?: {
    canViewAllCompanyProjects: boolean
  }
}

// Servicio de autenticación
export class AuthService {
  // Iniciar sesión
  static async login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔐 AuthService.login starting for:', email);
      
      // Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('🔍 Auth response:', { user: authData.user?.email, error: authError?.message });

      if (authError || !authData.user) {
        console.error('❌ Auth failed:', authError?.message);
        return { user: null, error: authError?.message || 'Error de autenticación' }
      }

      console.log('🔍 Getting user profile for ID:', authData.user.id);
      
      // Obtener perfil extendido del usuario
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      console.log('👤 Profile response:', { profile: userProfile, error: profileError?.message });

      if (profileError || !userProfile) {
        console.error('❌ Profile fetch failed:', profileError?.message);
        return { user: null, error: 'Error al obtener perfil de usuario' }
      }

      if (!userProfile.is_active) {
        console.error('❌ User inactive');
        await supabase.auth.signOut()
        return { user: null, error: 'Usuario inactivo' }
      }

      const user: AuthUser = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        company_id: userProfile.company_id,
        is_active: userProfile.is_active,
        permissions: {
          canViewAllCompanyProjects: userProfile.can_view_all_company_projects
        }
      }

      console.log('✅ Login successful! User:', user);
      return { user, error: null }

    } catch (error) {
      console.error('Error en login:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  // Cerrar sesión
  static async logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  // Obtener sesión actual
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        return null
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!userProfile || !userProfile.is_active) {
        return null
      }

      return {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        company_id: userProfile.company_id,
        is_active: userProfile.is_active,
        permissions: {
          canViewAllCompanyProjects: userProfile.can_view_all_company_projects
        }
      }
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error)
      return null
    }
  }

  // Registrar nuevo usuario (solo admin)
  static async registerUser(userData: {
    email: string
    password: string
    name: string
    telefono?: string
    role: 'admin' | 'company_user'
    company_id?: string
    can_view_all_company_projects?: boolean
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verificar que el usuario actual es admin
      const currentUser = await this.getCurrentUser()
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Sin permisos para crear usuarios' }
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      })

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'Error creando usuario' }
      }

      // El trigger automáticamente creará el perfil, pero lo actualizamos con datos completos
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          telefono: userData.telefono,
          role: userData.role,
          company_id: userData.company_id,
          can_view_all_company_projects: userData.can_view_all_company_projects ?? true
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Error actualizando perfil:', profileError)
        return { success: false, error: 'Error configurando perfil de usuario' }
      }

      return { success: true, error: null }

    } catch (error) {
      console.error('Error registrando usuario:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(userId: string, updates: {
    name?: string
    telefono?: string
    can_view_all_company_projects?: boolean
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  // Escuchar cambios de autenticación
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}