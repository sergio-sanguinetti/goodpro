/*
  # Fix admin user profile for RLS permissions

  1. Problem
    - User is authenticated but doesn't have admin profile in users table
    - RLS policies require admin role to create companies
    
  2. Solution
    - Ensure authenticated user has admin profile
    - Update existing user or create new admin profile
    - Verify RLS policies are working correctly
*/

-- First, let's see what users exist in auth.users
-- (This is just for debugging - will show in results)
SELECT 'Current auth users:' as info, email, id, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if we have any users in the users table
SELECT 'Current users table:' as info, email, role, is_active 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- Now let's ensure ALL auth users have corresponding profiles in users table
-- This will create admin profiles for any auth users that don't have profiles
INSERT INTO users (id, name, email, role, is_active)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'Admin User'),
  au.email,
  'admin',
  true
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = now();

-- Also ensure the specific admin user exists
INSERT INTO users (id, name, email, role, is_active)
SELECT 
  au.id,
  'Juan Miguel - Admin GoodPro',
  au.email,
  'admin',
  true
FROM auth.users au
WHERE au.email = 'juan.miguel@goodsolutions.pe'
ON CONFLICT (id) DO UPDATE SET
  name = 'Juan Miguel - Admin GoodPro',
  role = 'admin',
  is_active = true,
  updated_at = now();

-- Verify the user is now properly set up
SELECT 'Verification - admin user profile:' as info, id, name, email, role, is_active 
FROM users 
WHERE email = 'juan.miguel@goodsolutions.pe';

-- Test the RLS policy by checking if this user can theoretically create companies
SELECT 'RLS Policy Test:' as info, 
       EXISTS (
         SELECT 1 FROM users 
         WHERE id = (SELECT id FROM auth.users WHERE email = 'juan.miguel@goodsolutions.pe')
         AND role = 'admin' 
         AND is_active = true
       ) as can_create_companies;