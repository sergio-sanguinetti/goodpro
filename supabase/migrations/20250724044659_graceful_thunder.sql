-- ✅ CREAR USUARIO ADMIN - VERSIÓN SIMPLE
-- Sin ON CONFLICT, paso a paso

-- 1. Primero eliminar si existe
DELETE FROM users WHERE email = 'admin@goodpro.pe';
DELETE FROM auth.users WHERE email = 'admin@goodpro.pe';

-- 2. Crear nuevo usuario en auth.users
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Crear en sistema de autenticación
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
    'admin@goodpro.pe',
    crypt('admin123', gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin GoodPro"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Crear perfil en tabla users
  INSERT INTO users (
    id,
    name,
    email,
    role,
    is_active,
    can_view_all_company_projects
  ) VALUES (
    new_user_id,
    'Admin GoodPro',
    'admin@goodpro.pe',
    'admin',
    true,
    true
  );

  RAISE NOTICE '✅ Usuario admin creado exitosamente!';
  RAISE NOTICE '📧 Email: admin@goodpro.pe';
  RAISE NOTICE '🔑 Password: admin123';
END $$;