-- ========================================
-- 👤 CREAR USUARIO ADMINISTRADOR INICIAL
-- ========================================
-- 
-- ⚠️ IMPORTANTE: Cambiar email y password antes de ejecutar
-- 
-- ========================================

-- 🔑 REEMPLAZAR CON TUS DATOS:
-- admin@tuempresa.com    ← TU EMAIL
-- password123            ← TU PASSWORD
-- Admin Principal        ← TU NOMBRE

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@tuempresa.com',  -- ← CAMBIAR POR TU EMAIL
  crypt('password123', gen_salt('bf')),  -- ← CAMBIAR POR TU PASSWORD
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin Principal"}',  -- ← CAMBIAR POR TU NOMBRE
  'authenticated',
  'authenticated'
);

-- ========================================
-- ✅ USUARIO ADMIN CREADO
-- ========================================
-- 
-- Ya puedes hacer login con:
-- Email: admin@tuempresa.com
-- Password: password123
-- 
-- ⚠️ Recuerda cambiar la contraseña después del primer login
-- 
-- ========================================