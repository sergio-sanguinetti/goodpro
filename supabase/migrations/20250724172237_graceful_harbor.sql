/*
  # Add RLS policies for documents table

  1. Security
    - Enable policies for authenticated users to manage documents
    - Users can only access documents from projects they have access to
    - Admins have full access to all documents
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "authenticated_users_can_insert_documents" ON documents;
DROP POLICY IF EXISTS "users_can_view_company_documents" ON documents;
DROP POLICY IF EXISTS "users_can_update_own_documents" ON documents;
DROP POLICY IF EXISTS "admins_can_manage_all_documents" ON documents;

-- Policy for inserting documents (authenticated users)
CREATE POLICY "authenticated_users_can_insert_documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for viewing documents (users can see documents from their company's projects)
CREATE POLICY "users_can_view_company_documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN users u ON u.company_id = p.company_id
      WHERE p.id = documents.project_id 
      AND u.id = auth.uid()
      AND u.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.is_active = true
    )
  );

-- Policy for updating documents (creators and admins)
CREATE POLICY "users_can_update_own_documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.is_active = true
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.is_active = true
    )
  );

-- Policy for deleting documents (admins only)
CREATE POLICY "admins_can_delete_documents"
  ON documents
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