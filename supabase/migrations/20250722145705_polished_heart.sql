/*
  # Esquema inicial de base de datos para GoodPro

  1. Tablas principales
    - companies (empresas)
    - users (usuarios - extiende auth.users de Supabase)
    - projects (proyectos)
    - document_categories (categorías de documentos)
    - documents (documentos principales)
    - document_versions (versiones de documentos)
    - document_roles (elaboradores, revisores, aprobadores)
    - record_formats (formatos de registro base)
    - record_format_versions (versiones de formatos)
    - record_entries (registros llenos)
    - notifications (notificaciones del sistema)

  2. Seguridad
    - Row Level Security habilitado en todas las tablas
    - Políticas por empresa y rol de usuario
    - Triggers para notificaciones automáticas

  3. Storage
    - Buckets para documentos, registros y avatars
    - Políticas de acceso por empresa
*/

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. TABLA COMPANIES (Empresas)
-- ==============================================
CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    razon_social text NOT NULL,
    ruc text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT companies_ruc_check CHECK (length(ruc) = 11)
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. TABLA USERS (Usuarios - perfil extendido)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 3. TABLA PROJECTS (Proyectos)
-- ==============================================
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

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. TABLA PROJECT_CONTACTS (Contactos de proyecto)
-- ==============================================
CREATE TABLE IF NOT EXISTS project_contacts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. TABLA DOCUMENT_CATEGORIES (Categorías)
-- ==============================================
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

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. TABLA DOCUMENTS (Documentos principales)
-- ==============================================
CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    codigo text NOT NULL,
    version text NOT NULL DEFAULT '1.0',
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

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 7. TABLA DOCUMENT_VERSIONS (Versiones de documentos)
-- ==============================================
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

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 8. TABLA DOCUMENT_ROLES (Elaboradores, Revisores, Aprobadores)
-- ==============================================
CREATE TABLE IF NOT EXISTS document_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('elaborator', 'reviewer', 'approver')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE document_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 9. TABLA RECORD_FORMATS (Formatos de registro base)
-- ==============================================
CREATE TABLE IF NOT EXISTS record_formats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    codigo text NOT NULL,
    version text NOT NULL DEFAULT '1.0',
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

ALTER TABLE record_formats ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 10. TABLA RECORD_FORMAT_VERSIONS (Versiones de formatos)
-- ==============================================
CREATE TABLE IF NOT EXISTS record_format_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_format_id uuid NOT NULL REFERENCES record_formats(id) ON DELETE CASCADE,
    version_number text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES users(id),
    uploaded_at timestamptz DEFAULT now(),
    changes text,
    is_active boolean DEFAULT false
);

ALTER TABLE record_format_versions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 11. TABLA RECORD_FORMAT_ROLES (Roles para formatos)
-- ==============================================
CREATE TABLE IF NOT EXISTS record_format_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_format_id uuid NOT NULL REFERENCES record_formats(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('elaborator', 'reviewer', 'approver')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE record_format_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 12. TABLA RECORD_ENTRIES (Registros llenos)
-- ==============================================
CREATE TABLE IF NOT EXISTS record_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_format_id uuid NOT NULL REFERENCES record_formats(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    fecha_realizacion date NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES users(id),
    uploaded_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by uuid REFERENCES users(id),
    approved_at timestamptz,
    notes text
);

ALTER TABLE record_entries ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 13. TABLA NOTIFICATIONS (Notificaciones)
-- ==============================================
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
    record_format_id uuid REFERENCES record_formats(id) ON DELETE CASCADE,
    record_entry_id uuid REFERENCES record_entries(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('warning', 'success', 'info', 'error')),
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_companies_ruc ON companies(ruc);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);

CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_vencimiento ON documents(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_active ON document_versions(is_active);

CREATE INDEX IF NOT EXISTS idx_record_formats_project ON record_formats(project_id);
CREATE INDEX IF NOT EXISTS idx_record_formats_category ON record_formats(category_id);
CREATE INDEX IF NOT EXISTS idx_record_formats_status ON record_formats(status);

CREATE INDEX IF NOT EXISTS idx_record_entries_format ON record_entries(record_format_id);
CREATE INDEX IF NOT EXISTS idx_record_entries_status ON record_entries(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);