-- ===============================================
-- SCRIPT 2: CREAR TABLAS PRINCIPALES
-- Tiempo estimado: 15 segundos
-- ===============================================

-- Tabla: companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social text NOT NULL,
  ruc text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT companies_ruc_check CHECK (length(ruc) = 11)
);

-- Tabla: users (extiende auth.users)
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

-- Tabla: projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sede text NOT NULL,
  descripcion text NOT NULL,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ TABLAS PRINCIPALES CREADAS CORRECTAMENTE';
END $$;