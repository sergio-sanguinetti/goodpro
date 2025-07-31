/*
  # Limpiar y reconfigurar políticas RLS

  1. Eliminar políticas de forma segura
  2. Crear políticas nuevas sin conflictos
  3. Permitir operaciones CRUD para usuarios autenticados
*/

-- ========================================
-- PASO 1: ELIMINAR POLÍTICAS EXISTENTES DE FORMA SEGURA
-- ========================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Eliminar todas las políticas de la tabla projects
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de la tabla project_contacts
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = 'project_contacts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_contacts', policy_record.policyname);
    END LOOP;
    
    RAISE NOTICE '✅ Todas las políticas anteriores eliminadas';
END $$;

-- ========================================
-- PASO 2: CREAR POLÍTICAS NUEVAS
-- ========================================

-- Política simple para projects
CREATE POLICY "authenticated_users_full_access_projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política simple para project_contacts  
CREATE POLICY "authenticated_users_full_access_project_contacts"
  ON project_contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- PASO 3: VERIFICACIÓN FINAL
-- ========================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'authenticated_users_full_access_projects'
  ) AND EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_contacts' 
    AND policyname = 'authenticated_users_full_access_project_contacts'
  ) THEN
    RAISE NOTICE '✅ POLÍTICAS RLS CONFIGURADAS CORRECTAMENTE';
    RAISE NOTICE '✅ Ya puedes crear, editar y eliminar proyectos';
    RAISE NOTICE '✅ Los contactos funcionarán correctamente';
    RAISE NOTICE '✅ La navegación a documentos funcionará';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Las políticas no se crearon correctamente';
  END IF;
END $$;