/*
  # Add RLS policies for document_categories table

  1. Security Policies
    - Enable admins to perform all operations on document_categories
    - Allow authenticated users to view categories
    - Restrict creation/modification to admin users only

  2. Changes Made
    - Add policy for admins to manage all categories (CRUD)
    - Add policy for authenticated users to view categories
    - Ensure proper access control based on user roles
*/

-- Policy for admins to manage all document categories
CREATE POLICY "Admins can manage all document categories"
  ON document_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- Policy for all authenticated users to view document categories
CREATE POLICY "Authenticated users can view document categories"
  ON document_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);