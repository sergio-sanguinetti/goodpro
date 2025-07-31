/*
# 🔍 DIAGNOSTICAR PROBLEMA DE LOGIN

## 📊 **PASO 1: Verificar vinculación entre tablas**

### **🔧 En SQL Editor de Supabase:**
```sql
-- Verificar que el usuario esté bien vinculado
SELECT 
  au.id as auth_id,
  au.email,
  au.email_confirmed_at,
  au.created_at as auth_created,
  u.id as user_id,
  u.name,
  u.role,
  u.is_active
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'juan.miguel@goodsolutions.pe';
```

### **✅ Resultado esperado:**
- **auth_id** y **user_id** deben ser IGUALES
- **email_confirmed_at** debe tener una fecha
- **role** = 'admin'
- **is_active** = true

---

## 🔧 **PASO 2: Si los IDs no coinciden**

Si **auth_id** ≠ **user_id**, ejecutar:
```sql
-- Vincular correctamente
UPDATE users 
SET id = (
  SELECT id FROM auth.users 
  WHERE email = 'juan.miguel@goodsolutions.pe'
)
WHERE email = 'juan.miguel@goodsolutions.pe';
```

---

## 🔧 **PASO 3: Si email no está confirmado**

Si **email_confirmed_at** está vacío:
```sql
-- Confirmar email
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'juan.miguel@goodsolutions.pe';
```

---

## 🆘 **PASO 4: Crear usuario nuevo desde cero**

Si todo lo anterior falla, **eliminar y crear nuevo**:

```sql
-- 1. Eliminar usuario actual
DELETE FROM users WHERE email = 'juan.miguel@goodsolutions.pe';
DELETE FROM auth.users WHERE email = 'juan.miguel@goodsolutions.pe';

-- 2. Crear nuevo usuario completo
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Crear en auth.users
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
    'juan.miguel@goodsolutions.pe',
    crypt('goodpro2025', gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Juan Miguel - Admin GoodPro"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Crear en users
  INSERT INTO users (
    id,
    name,
    email,
    role,
    is_active
  ) VALUES (
    new_user_id,
    'Juan Miguel - Admin GoodPro',
    'juan.miguel@goodsolutions.pe',
    'admin',
    true
  );

  RAISE NOTICE '✅ Nuevo usuario admin creado exitosamente con contraseña: goodpro2025';
END $$;
```

---

## 🎯 **RECOMENDACIÓN:**

**Ejecuta PASO 1 primero** para ver qué está mal. Luego seguimos según el resultado.
*/