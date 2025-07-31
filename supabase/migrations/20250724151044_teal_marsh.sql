/*
  # Configurar políticas RLS para project_contacts

  1. Políticas de Seguridad
    - Admins pueden gestionar todas las relaciones proyecto-contacto
    - Usuarios de empresa pueden ver contactos de proyectos de su empresa
    - Usuarios con permisos limitados solo ven contactos de sus proyectos asignados

  2. Cambios
    - Enable RLS en project_contacts (ya estaba habilitado)
    - Agregar políticas para INSERT, SELECT, UPDATE, DELETE
    - Políticas basadas en company_id a través de projects
*/

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Admins can manage all project contacts" ON project_contacts;
DROP POLICY IF EXISTS "Company users can view project contacts from their company" ON project_contacts;
DROP POLICY IF EXISTS "Company users can manage contacts for accessible projects" ON project_contacts;

-- Política para que admins puedan gestionar todos los contactos de proyecto
CREATE POLICY "Admins can manage all project contacts"
  ON project_contacts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin' 
    AND users.is_active = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin' 
    AND users.is_active = true
  ));

-- Política para que usuarios de empresa puedan ver contactos de proyectos de su empresa
CREATE POLICY "Company users can view project contacts from their company"
  ON project_contacts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    JOIN projects p ON p.company_id = u.company_id
    WHERE u.id = auth.uid() 
    AND u.role = 'company_user' 
    AND u.is_active = true
    AND p.id = project_contacts.project_id
  ));

-- Política para que usuarios de empresa puedan gestionar contactos solo de proyectos donde son contacto
CREATE POLICY "Company users can manage contacts for accessible projects"
  ON project_contacts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    JOIN projects p ON p.company_id = u.company_id
    WHERE u.id = auth.uid() 
    AND u.role = 'company_user' 
    AND u.is_active = true
    AND p.id = project_contacts.project_id
    AND (
      u.can_view_all_company_projects = true
      OR EXISTS (
        SELECT 1 FROM project_contacts pc 
        WHERE pc.project_id = p.id 
        AND pc.user_id = u.id
      )
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u
    JOIN projects p ON p.company_id = u.company_id
    WHERE u.id = auth.uid() 
    AND u.role = 'company_user' 
    AND u.is_active = true
    AND p.id = project_contacts.project_id
    AND (
      u.can_view_all_company_projects = true
      OR EXISTS (
        SELECT 1 FROM project_contacts pc 
        WHERE pc.project_id = p.id 
        AND pc.user_id = u.id
      )
    )
  ));

-- Verificar que las políticas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ POLÍTICAS RLS PARA PROJECT_CONTACTS CONFIGURADAS CORRECTAMENTE';
END $$;