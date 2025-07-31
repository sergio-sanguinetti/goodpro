-- ✅ CONFIGURACIÓN ULTRA SIMPLE (SIN TIMEOUT)
-- Ejecutar SOLO SI el minimal_test.sql funciona

-- 1. Crear tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social text NOT NULL,
  ruc text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- 2. Crear tabla de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  telefono text,
  role text NOT NULL CHECK (role IN ('admin', 'company_user')),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  can_view_all_company_projects boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Activar Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ✅ Mensaje de confirmación
SELECT '✅ CONFIGURACIÓN BÁSICA COMPLETADA - Continúa con más scripts' as resultado;