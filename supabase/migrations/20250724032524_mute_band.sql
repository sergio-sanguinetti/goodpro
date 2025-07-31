/*
  # Fix RLS policies for companies table

  1. Security Updates
    - Drop existing conflicting policies on companies table
    - Create comprehensive RLS policies for admin users
    - Ensure admins can perform all CRUD operations on companies
    - Allow company users to view their own company data

  2. Policy Details
    - Admins have full access (CREATE, READ, UPDATE, DELETE)
    - Company users can only view companies they belong to
    - All policies check user existence and roles properly
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Admin can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Company users can view own company" ON public.companies;

-- Ensure RLS is enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy for admins to insert companies
CREATE POLICY "Admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy for admins to view all companies
CREATE POLICY "Admins can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy for admins to update companies
CREATE POLICY "Admins can update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy for admins to delete companies
CREATE POLICY "Admins can delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy for company users to view their own company
CREATE POLICY "Company users can view own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.company_id = companies.id
    AND users.is_active = true
  )
);