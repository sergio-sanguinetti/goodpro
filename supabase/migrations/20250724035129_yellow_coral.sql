-- ===============================================
-- SCRIPT 5: CONFIGURAR SEGURIDAD (RLS)
-- Tiempo estimado: 10 segundos
-- ===============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para companies (solo admin puede ver/gestionar)
CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Políticas básicas para users (admin puede ver todos, usuarios pueden ver su perfil)
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Políticas básicas para projects
CREATE POLICY "Admin can view all projects" ON projects
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ SEGURIDAD RLS CONFIGURADA CORRECTAMENTE';
END $$;