-- ===============================================
-- SCRIPT 6: CREAR USUARIO ADMINISTRADOR
-- Email: juan.miguel@goodsolutions.pe
-- Password: 0123456789juanmiguelgoodpro
-- ===============================================

DO $$
DECLARE
  admin_user_id uuid;
  admin_email text := 'juan.miguel@goodsolutions.pe';
  admin_password text := '0123456789juanmiguelgoodpro';
BEGIN
  -- Verificar si el usuario ya existe
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    -- Crear usuario en auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Juan Miguel - Admin GoodPro"}'
    ) RETURNING id INTO admin_user_id;
    
    -- Crear perfil en tabla users
    INSERT INTO users (id, name, email, role)
    VALUES (
      admin_user_id,
      'Juan Miguel - Admin GoodPro',
      admin_email,
      'admin'
    );
    
    RAISE NOTICE '✅ Usuario administrador creado exitosamente!';
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Password: %', admin_password;
  ELSE
    RAISE NOTICE '⚠️ Usuario ya existe con email: %', admin_email;
  END IF;
END $$;