-- Script para crear usuario administrador desde cero
-- Ejecutar en SQL Editor de Supabase

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  admin_email text := 'admin@goodpro.pe';
  admin_password text := 'admin123';
BEGIN
  -- 1. Eliminar usuario existente si existe
  DELETE FROM users WHERE email = admin_email;
  DELETE FROM auth.users WHERE email = admin_email;

  -- 2. Crear en auth.users (sistema de autenticación)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrador GoodPro"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 3. Crear en tabla users (permisos de la app)
  INSERT INTO users (
    id,
    name,
    email,
    role,
    is_active,
    can_view_all_company_projects,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Administrador GoodPro',
    admin_email,
    'admin',
    true,
    true,
    now(),
    now()
  );

  RAISE NOTICE '✅ Usuario admin creado exitosamente!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'ID: %', new_user_id;
END $$;