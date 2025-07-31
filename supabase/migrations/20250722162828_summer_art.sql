-- 🔍 VERIFICAR USUARIO ADMIN EN SUPABASE
-- Ejecutar paso a paso en SQL Editor

-- ========================================
-- 1️⃣ VERIFICAR SI USUARIO EXISTE EN AUTH
-- ========================================

SELECT 
  id, 
  email, 
  email_confirmed_at,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe';

-- 📋 Resultado esperado: 
-- ✅ Una fila con tu email
-- ❌ Sin filas = usuario no se creó

-- ========================================
-- 2️⃣ VERIFICAR SI PERFIL EXISTE EN USERS
-- ========================================

SELECT 
  id, 
  name, 
  email, 
  role, 
  is_active
FROM users 
WHERE email = 'juan.miguel@goodsolutions.pe';

-- 📋 Resultado esperado: 
-- ✅ Una fila con role = 'admin'
-- ❌ Sin filas = perfil no se creó

-- ========================================
-- 3️⃣ CREAR/ACTUALIZAR PERFIL SI FALTA
-- ========================================

-- Solo ejecutar si la consulta anterior está vacía
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
  is_active = true;

-- ========================================
-- 4️⃣ VERIFICACIÓN FINAL
-- ========================================

-- Verificar que todo esté correcto
SELECT 
  au.email as auth_email,
  au.email_confirmed_at,
  u.name as profile_name,
  u.role as profile_role,
  u.is_active
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'juan.miguel@goodsolutions.pe';

-- 📋 Resultado esperado:
-- ✅ auth_email: juan.miguel@goodsolutions.pe
-- ✅ email_confirmed_at: [fecha]
-- ✅ profile_name: Juan Miguel - Admin GoodPro
-- ✅ profile_role: admin
-- ✅ is_active: true

-- ========================================
-- ✅ SI TODO ESTÁ BIEN ARRIBA
-- ========================================
-- 
-- El problema puede estar en:
-- 1. Variables de entorno en Netlify
-- 2. Falta redeploy después de configurar variables
-- 3. App no subida a Netlify
-- 
-- ========================================