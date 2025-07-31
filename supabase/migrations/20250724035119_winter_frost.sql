-- ===============================================
-- SCRIPT 3: CREAR TABLAS DE DOCUMENTOS
-- Tiempo estimado: 15 segundos
-- ===============================================

-- Tabla: document_categories
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  normative_reference text,
  type text NOT NULL CHECK (type IN ('document', 'record')),
  is_required boolean DEFAULT false,
  renewal_period_months integer DEFAULT 12,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Tabla: documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  codigo text NOT NULL,
  version text DEFAULT '1.0',
  category_id uuid NOT NULL REFERENCES document_categories(id),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  fecha_creacion date DEFAULT CURRENT_DATE,
  fecha_vencimiento date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'expired', 'rejected')),
  created_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: document_versions
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  changes text,
  is_active boolean DEFAULT false
);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ TABLAS DE DOCUMENTOS CREADAS CORRECTAMENTE';
END $$;