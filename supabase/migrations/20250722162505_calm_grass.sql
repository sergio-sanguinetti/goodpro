-- ========================================
-- 🔍 VERIFICAR CREACIÓN DE USUARIO
-- ========================================

-- 1️⃣ Verificar usuario en auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe';

-- 2️⃣ Verificar perfil en tabla users
SELECT 
  id, 
  name, 
  email, 
  role, 
  is_active
FROM users 
WHERE email = 'juan.miguel@goodsolutions.pe';

-- ========================================
-- 🔧 CORREGIR SI HAY PROBLEMAS
-- ========================================

-- 3️⃣ Si el usuario NO aparece en tabla users, ejecutar:
INSERT INTO users (id, name, email, role, is_active) 
SELECT 
  id, 
  'Juan Miguel - Admin GoodPro', 
  email, 
  'admin', 
  true
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe'
ON CONFLICT (id) DO UPDATE SET 
  name = 'Juan Miguel - Admin GoodPro',
  role = 'admin',
  is_active = true;

-- 4️⃣ Verificar que quedó correcto
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.is_active,
  au.email_confirmed_at
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.email = 'juan.miguel@goodsolutions.pe';