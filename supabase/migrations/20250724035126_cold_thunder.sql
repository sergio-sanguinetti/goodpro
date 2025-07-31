-- ===============================================
-- SCRIPT 4: CREAR ÍNDICES PARA RENDIMIENTO
-- Tiempo estimado: 10 segundos
-- ===============================================

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_ruc ON companies(ruc);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);

-- Índices para documents
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_vencimiento ON documents(fecha_vencimiento);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ ÍNDICES CREADOS CORRECTAMENTE';
END $$;