/*
  # Fix RLS policies for document_versions table

  1. Security Updates
    - Drop existing policies on document_versions table
    - Add new INSERT policy for authenticated users
    - Add SELECT policy for users who can view the parent document
    - Add UPDATE policy for document creators and admins
    - Add DELETE policy for admins only

  2. Key Changes
    - Allow any authenticated user to insert document versions
    - Align with document access permissions for SELECT operations
    - Maintain security while allowing proper functionality
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can update document versions" ON document_versions;
DROP POLICY IF EXISTS "Admins can delete document versions" ON document_versions;

-- Allow authenticated users to insert document versions
CREATE POLICY "Users can insert document versions"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view document versions if they can view the parent document
CREATE POLICY "Users can view document versions"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND (
        -- User can view documents from their company projects
        EXISTS (
          SELECT 1 FROM projects p
          JOIN users u ON u.company_id = p.company_id
          WHERE p.id = d.project_id 
          AND u.id = auth.uid() 
          AND u.is_active = true
        )
        OR
        -- Admins can view all documents
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() 
          AND u.role = 'admin' 
          AND u.is_active = true
        )
      )
    )
  );

-- Allow document creators and admins to update versions
CREATE POLICY "Users can update document versions"
  ON document_versions
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin' 
      AND u.is_active = true
    )
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin' 
      AND u.is_active = true
    )
  );

-- Only admins can delete document versions
CREATE POLICY "Admins can delete document versions"
  ON document_versions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin' 
      AND u.is_active = true
    )
  );