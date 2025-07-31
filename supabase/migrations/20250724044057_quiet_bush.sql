/*
# 🆕 CREAR USUARIO ADMIN COMPLETAMENTE NUEVO

## 🎯 **ELIMINAR EL ACTUAL Y CREAR UNO FRESCO**

### **🔧 Ejecutar en SQL Editor de Supabase:**
*/

-- 🗑️ PASO 1: Limpiar usuario actual (por si tiene problemas)
DELETE FROM users WHERE email = 'juan.miguel@goodsolutions.pe';
DELETE FROM auth.users WHERE email = 'juan.miguel@goodsolutions.pe';

-- ✅ PASO 2: Crear usuario completamente nuevo
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Crear en auth.users (sistema de autenticación)
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
    '{"name": "Administrador GoodPro"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Crear en users (tabla de perfiles)
  INSERT INTO users (
    id,
    name,
    email,
    role,
    is_active
  ) VALUES (
    new_user_id,
    'Administrador GoodPro',
    'admin@goodpro.pe',
    'admin',
    true
  );

  RAISE NOTICE '✅ Usuario admin creado exitosamente:';
  RAISE NOTICE 'Email: admin@goodpro.pe';
  RAISE NOTICE 'Password: admin123';
  RAISE NOTICE 'ID: %', new_user_id;
END $$;