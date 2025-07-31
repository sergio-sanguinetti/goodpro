# 🚀 INSTRUCCIONES DE DEPLOY A NETLIFY

## 📋 Pasos para poner en producción:

### 1️⃣ **Configurar Supabase** (10 minutos)

#### Crear proyecto:
1. Ir a [supabase.com](https://supabase.com)
2. **New Project** → Nombre: `goodpro-sst`
3. **Región**: South America (São Paulo)
4. **Password**: [contraseña fuerte]

#### Ejecutar migraciones SQL:
En **SQL Editor** de Supabase, ejecutar en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_setup.sql`
4. `supabase/migrations/004_initial_data.sql`
5. `supabase/migrations/005_admin_functions.sql`

#### Crear usuario admin:
```sql
-- En SQL Editor, reemplazar email y password:
INSERT INTO auth.users (
  id, instance_id, email, 
  encrypted_password, email_confirmed_at, 
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@tuempresa.com',  -- ← CAMBIAR
  crypt('password123', gen_salt('bf')),  -- ← CAMBIAR
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador Principal"}'
);
```

### 2️⃣ **Deploy a Netlify** (5 minutos)

#### Opción A: Manual (carpeta dist)
1. **Subir carpeta** `dist/` directamente a Netlify
2. **Site settings** → Environment variables:
   ```
   VITE_SUPABASE_URL = https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsI...
   ```
3. **Redeploy** después de configurar variables

#### Opción B: GitHub
1. **New site from Git** → Conectar repositorio
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. **Environment variables**: (mismas que arriba)

### 3️⃣ **Obtener credentials de Supabase**

En tu proyecto Supabase:
1. **Settings** → **API**
2. **Copiar**:
   - Project URL: `https://xxx.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsI...`

### 4️⃣ **Testing final**

1. ✅ Login con usuario admin creado
2. ✅ Crear empresa de prueba
3. ✅ Subir documento de prueba
4. ✅ Verificar descarga funciona

---

## 📁 **Estructura de archivos generada:**

```
dist/
├── index.html          # Página principal
├── assets/
│   ├── index-*.js     # JavaScript bundled
│   └── index-*.css    # CSS optimizado
├── logo horizontal.png # Logo de la app
└── netlify.toml       # Configuración Netlify
```

## 🔧 **Funcionalidades que funcionarán:**

- ✅ **Autenticación** real con Supabase
- ✅ **CRUD empresas** y proyectos
- ✅ **Upload/download** de documentos
- ✅ **Gestión de usuarios** con roles
- ✅ **Dashboard** con métricas reales
- ✅ **Notificaciones** en tiempo real
- ✅ **Lista maestra** filtrable
- ✅ **Reportes** exportables

## 💰 **Costos:**

- **Netlify**: Gratis hasta 100GB/mes
- **Supabase**: Gratis hasta 500MB DB + 1GB storage
- **Total**: $0/mes para empezar

## 🆘 **Soporte:**

Si tienes problemas:
1. Verificar variables de entorno en Netlify
2. Revisar logs en Supabase → Logs
3. Verificar que migraciones se ejecutaron correctamente

---

**¡La aplicación está lista para producción!** 🎉