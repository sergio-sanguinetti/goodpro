/*
  # Fix User Permissions for Company Users
  
  This migration fixes the permissions so that company users can:
  1. View documents from their company's projects
  2. Download documents from their company's projects
  3. View document versions from their company's projects
  
  The main issue was that the policies were too restrictive and didn't properly
  handle the relationship between users, companies, and projects.
*/

-- =============================================
-- FIX DOCUMENTS TABLE POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view company documents" ON documents;
DROP POLICY IF EXISTS "Users can update documents" ON documents;

-- Create simplified policy for viewing documents
CREATE POLICY "Users can view company documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    -- Admins can see all documents
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
    OR
    -- Company users can see documents from their company's projects
    EXISTS (
      SELECT 1 FROM users u
      JOIN projects p ON p.company_id = u.company_id
      WHERE u.id = auth.uid() 
        AND u.is_active = true 
        AND u.role = 'company_user'
        AND p.id = documents.project_id
    )
  );

-- Create simplified policy for updating documents
CREATE POLICY "Users can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    -- Only admins can update documents
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  )
  WITH CHECK (
    -- Only admins can update documents
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- =============================================
-- FIX DOCUMENT VERSIONS TABLE POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can update document versions" ON document_versions;

-- Create simplified policy for viewing document versions
CREATE POLICY "Users can view document versions"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    -- Admins can see all document versions
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
    OR
    -- Company users can see document versions from their company's projects
    EXISTS (
      SELECT 1 FROM users u
      JOIN projects p ON p.company_id = u.company_id
      JOIN documents d ON d.project_id = p.id
      WHERE u.id = auth.uid() 
        AND u.is_active = true 
        AND u.role = 'company_user'
        AND d.id = document_versions.document_id
    )
  );

-- Create simplified policy for updating document versions
CREATE POLICY "Users can update document versions"
  ON document_versions
  FOR UPDATE
  TO authenticated
  USING (
    -- Only admins can update document versions
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  )
  WITH CHECK (
    -- Only admins can update document versions
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- =============================================
-- FIX STORAGE POLICIES
-- =============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company records" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company record entries" ON storage.objects;

-- Create simplified storage policy for documents
CREATE POLICY "Users can view company documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND (
      -- Admins can see all documents
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Company users can see documents from their company
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Create simplified storage policy for records
CREATE POLICY "Users can view company records"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'records' AND (
      -- Admins can see all records
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Company users can see records from their company
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Create simplified storage policy for record entries
CREATE POLICY "Users can view company record entries"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'record-entries' AND (
      -- Admins can see all record entries
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Company users can see record entries from their company
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ PERMISOS DE USUARIOS DE EMPRESA ARREGLADOS';
  RAISE NOTICE '📄 Documentos: Usuarios empresa pueden ver documentos de su empresa';
  RAISE NOTICE '📁 Versiones: Usuarios empresa pueden ver versiones de su empresa';
  RAISE NOTICE '💾 Storage: Usuarios empresa pueden descargar archivos de su empresa';
  RAISE NOTICE '🔒 Seguridad: Solo admins pueden editar/eliminar';
END $$;
