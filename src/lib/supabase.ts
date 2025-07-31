import { createClient } from '@supabase/supabase-js'

// Variables de entorno requeridas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug de variables de entorno
console.log('🔍 DEBUG - Variables de entorno:')
console.log('- NODE_ENV:', import.meta.env.MODE)
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing')

// Validación de variables de entorno
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CONFIGURACIÓN INCOMPLETA:')
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante')
  console.error('')
  console.error('🔧 SOLUCIÓN:')
  console.error('1. En desarrollo: Crear archivo .env.local con las variables')
  console.error('2. En producción: Configurar variables en Netlify y redeploy')
  throw new Error('Variables de entorno de Supabase no configuradas')
}

// Validar formato de URL
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ URL de Supabase inválida:', supabaseUrl)
  throw new Error('URL de Supabase tiene formato inválido')
}

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'goodpro-sst-app'
    }
  }
})

// Función para probar conectividad
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Probando conexión a Supabase...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Error de conexión:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error de red:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Probar conexión al inicializar (solo en desarrollo)
if (import.meta.env.DEV) {
  testSupabaseConnection()
}

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          razon_social: string
          ruc: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          razon_social: string
          ruc: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          razon_social?: string
          ruc?: string
          created_at?: string
          is_active?: boolean
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          telefono: string | null
          role: 'admin' | 'company_user'
          company_id: string | null
          is_active: boolean
          can_view_all_company_projects: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          telefono?: string | null
          role: 'admin' | 'company_user'
          company_id?: string | null
          is_active?: boolean
          can_view_all_company_projects?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          telefono?: string | null
          role?: 'admin' | 'company_user'
          company_id?: string | null
          is_active?: boolean
          can_view_all_company_projects?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          sede: string
          descripcion: string
          company_id: string
          fecha_inicio: string
          fecha_fin: string | null
          status: 'active' | 'completed' | 'suspended'
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          sede: string
          descripcion: string
          company_id: string
          fecha_inicio: string
          fecha_fin?: string | null
          status?: 'active' | 'completed' | 'suspended'
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          sede?: string
          descripcion?: string
          company_id?: string
          fecha_inicio?: string
          fecha_fin?: string | null
          status?: 'active' | 'completed' | 'suspended'
          created_at?: string
          is_active?: boolean
        }
      }
      document_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          normative_reference: string | null
          type: 'document' | 'record'
          is_required: boolean
          renewal_period_months: number
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          normative_reference?: string | null
          type: 'document' | 'record'
          is_required?: boolean
          renewal_period_months?: number
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          normative_reference?: string | null
          type?: 'document' | 'record'
          is_required?: boolean
          renewal_period_months?: number
          created_at?: string
          is_active?: boolean
        }
      }
      documents: {
        Row: {
          id: string
          nombre: string
          codigo: string
          version: string
          category_id: string
          project_id: string
          fecha_creacion: string
          fecha_vencimiento: string
          status: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          codigo: string
          version?: string
          category_id: string
          project_id: string
          fecha_creacion?: string
          fecha_vencimiento: string
          status?: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          codigo?: string
          version?: string
          category_id?: string
          project_id?: string
          fecha_creacion?: string
          fecha_vencimiento?: string
          status?: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected'
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          project_id: string | null
          document_id: string | null
          record_format_id: string | null
          record_entry_id: string | null
          type: 'warning' | 'success' | 'info' | 'error'
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          project_id?: string | null
          document_id?: string | null
          record_format_id?: string | null
          record_entry_id?: string | null
          type: 'warning' | 'success' | 'info' | 'error'
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          project_id?: string | null
          document_id?: string | null
          record_format_id?: string | null
          record_entry_id?: string | null
          type?: 'warning' | 'success' | 'info' | 'error'
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}