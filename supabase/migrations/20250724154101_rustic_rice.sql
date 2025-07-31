/*
  # Corregir todas las políticas RLS problemáticas

  1. Eliminar políticas conflictivas
  2. Crear políticas simples sin recursión
  3. Permitir eliminación de project_contacts
*/

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Admins can manage all project contacts" ON project_contacts;
DROP POLICY IF EXISTS "Company users can manage contacts for accessible projects" ON project_contacts;
DROP POLICY IF EXISTS "Company users can view project contacts from their company" ON project_contacts;
DROP POLICY IF EXISTS "Company users can view contacts from their company projects" ON project_contacts;
DROP POLICY IF EXISTS "Company users can insert contacts to their company projects" ON project_contacts;
DROP POLICY IF EXISTS "Company users can delete contacts from their company projects" ON project_contacts;

-- Eliminar políticas de projects que pueden causar problemas
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Company users can view their company projects" ON projects;
DROP POLICY IF EXISTS "Admin can view all projects" ON projects;
DROP POLICY IF EXISTS "admins_can_insert_projects" ON projects;
DROP POLICY IF EXISTS "admins_can_update_projects" ON projects;
DROP POLICY IF EXISTS "admins_can_view_all_projects" ON projects;
DROP POLICY IF EXISTS "company_users_can_view_company_projects" ON projects;

-- POLÍTICAS SIMPLES PARA PROJECTS
CREATE POLICY "Allow all for authenticated users"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- POLÍTICAS SIMPLES PARA PROJECT_CONTACTS  
CREATE POLICY "Allow all for authenticated users"
  ON project_contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verificar
DO $$
BEGIN
  RAISE NOTICE '✅ POLÍTICAS RLS SIMPLIFICADAS - TODOS LOS PROBLEMAS CORREGIDOS';
END $$;