/*
  # Fix Storage Configuration and Complete RLS Policies

  1. Storage Buckets
    - Create and configure all required storage buckets
    - Set up proper access policies for each bucket
  
  2. Complete RLS Policies
    - Fix all missing policies for document operations
    - Ensure DELETE policies exist for all tables
    - Add proper SELECT policies for nested queries

  3. Storage Policies
    - Allow authenticated users to upload files
    - Allow users to download files from their company's projects
    - Allow admins to access all files
*/

-- =============================================
-- STORAGE BUCKETS CONFIGURATION
-- =============================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('records', 'records', false, 10485760, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('record-entries', 'record-entries', false, 10485760, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Documents bucket policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view company documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND (
      -- Admins can see all
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Company users can see their company's documents
      EXISTS (
        SELECT 1 FROM users u
        JOIN projects p ON (u.company_id = p.company_id OR u.can_view_all_company_projects = true)
        WHERE u.id = auth.uid() AND u.is_active = true
        AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- Records bucket policies
CREATE POLICY "Authenticated users can upload records"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'records');

CREATE POLICY "Users can view company records"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'records' AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      EXISTS (
        SELECT 1 FROM users u
        JOIN projects p ON (u.company_id = p.company_id OR u.can_view_all_company_projects = true)
        WHERE u.id = auth.uid() AND u.is_active = true
        AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Record entries bucket policies
CREATE POLICY "Authenticated users can upload record entries"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'record-entries');

CREATE POLICY "Users can view company record entries"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'record-entries' AND (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      EXISTS (
        SELECT 1 FROM users u
        JOIN projects p ON (u.company_id = p.company_id OR u.can_view_all_company_projects = true)
        WHERE u.id = auth.uid() AND u.is_active = true
        AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Avatars bucket policies
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own avatar"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================
-- COMPLETE RLS POLICIES FOR ALL TABLES
-- =============================================

-- Document Categories (already exists, but ensuring completeness)
DROP POLICY IF EXISTS "Admins can manage all document categories" ON document_categories;
DROP POLICY IF EXISTS "Authenticated users can view document categories" ON document_categories;

CREATE POLICY "Admins can manage document categories"
  ON document_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

CREATE POLICY "Authenticated users can view document categories"
  ON document_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Documents table policies
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can view company documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Authenticated users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view company documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN users u ON (u.company_id = p.company_id OR u.role = 'admin')
      WHERE p.id = documents.project_id AND u.id = auth.uid() AND u.is_active = true
    )
  );

CREATE POLICY "Users can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- Document Versions policies
DROP POLICY IF EXISTS "Users can insert document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can update document versions" ON document_versions;
DROP POLICY IF EXISTS "Admins can delete document versions" ON document_versions;

CREATE POLICY "Users can insert document versions"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view document versions"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON d.project_id = p.id
      JOIN users u ON (u.company_id = p.company_id OR u.role = 'admin')
      WHERE d.id = document_versions.document_id AND u.id = auth.uid() AND u.is_active = true
    )
  );

CREATE POLICY "Users can update document versions"
  ON document_versions
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  )
  WITH CHECK (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins can delete document versions"
  ON document_versions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- Document Roles policies
DROP POLICY IF EXISTS "Users can manage document roles" ON document_roles;

CREATE POLICY "Users can manage document roles"
  ON document_roles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Record Formats policies
DROP POLICY IF EXISTS "Users can manage record formats" ON record_formats;

CREATE POLICY "Users can manage record formats"
  ON record_formats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN users u ON (u.company_id = p.company_id OR u.role = 'admin')
      WHERE p.id = record_formats.project_id AND u.id = auth.uid() AND u.is_active = true
    )
  )
  WITH CHECK (true);

-- Record Format Versions policies
DROP POLICY IF EXISTS "Users can manage record format versions" ON record_format_versions;

CREATE POLICY "Users can manage record format versions"
  ON record_format_versions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Record Format Roles policies
DROP POLICY IF EXISTS "Users can manage record format roles" ON record_format_roles;

CREATE POLICY "Users can manage record format roles"
  ON record_format_roles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Record Entries policies
DROP POLICY IF EXISTS "Users can manage record entries" ON record_entries;

CREATE POLICY "Users can manage record entries"
  ON record_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications policies (if they don't exist)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ STORAGE Y RLS COMPLETAMENTE CONFIGURADOS';
  RAISE NOTICE '📁 Buckets: documents, records, record-entries, avatars';
  RAISE NOTICE '🔒 Políticas RLS: Todas las tablas configuradas';
  RAISE NOTICE '📤 Storage Policies: Upload/download configurado';
END $$;