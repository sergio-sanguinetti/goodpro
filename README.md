# GoodPro - Sistema de Gestión de Documentación SST

Sistema web para la gestión de documentos de Seguridad y Salud en el Trabajo (SST) desarrollado con React, TypeScript y Supabase.

## 🚀 Características

- **Autenticación segura** con Supabase Auth
- **Gestión de empresas y proyectos**
- **Documentos SST** con versionado y control de acceso
- **Registros base y llenos** con formatos personalizables  
- **Notificaciones automáticas** de vencimientos
- **Dashboard analítico** con métricas en tiempo real
- **Lista maestra** filtrable y exportable
- **Storage seguro** para archivos PDF, DOC, XLS
- **Permisos granulares** por empresa y proyecto

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Gráficos**: Chart.js

## 📋 Requisitos

1. **Node.js** 18+ y npm
2. **Cuenta Supabase** (gratis)
3. **Variables de entorno** configuradas

## ⚙️ Configuración

### 1. Clonar e instalar

```bash
npm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el dashboard, ve a **Settings > API**
3. Copia tu **Project URL** y **anon public key**

### 3. Configurar variables de entorno

Renombra `.env.local` y configura:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Ejecutar migraciones de base de datos

1. Ve a **SQL Editor** en tu dashboard Supabase
2. Ejecuta los scripts en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql` 
   - `supabase/migrations/003_storage_setup.sql`
   - `supabase/migrations/004_initial_data.sql`

### 5. Crear usuario admin inicial

En SQL Editor de Supabase:

```sql
-- Registrar usuario admin
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@goodpro.pe',
  crypt('tu-password-seguro', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador GoodPro"}'
);
```

## 🚀 Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

## 📊 Estructura de la base de datos

### Tablas principales:
- `companies` - Empresas registradas
- `users` - Usuarios del sistema (extends auth.users)
- `projects` - Proyectos por empresa
- `document_categories` - Categorías SST
- `documents` - Documentos principales
- `document_versions` - Versionado de documentos
- `record_formats` - Formatos de registro base
- `record_entries` - Registros llenos
- `notifications` - Notificaciones del sistema

### Storage buckets:
- `documents` - PDFs/DOCs de documentos
- `records` - XLS/XLSX de registros base  
- `record-entries` - Archivos de registros llenos
- `avatars` - Fotos de perfil

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas granulares** por empresa y rol
- **JWT tokens** para autenticación
- **URLs firmadas** para descargas seguras
- **Validación de tipos** de archivo

## 👥 Roles de usuario

### **Admin**
- Ve todas las empresas y proyectos
- Puede crear/editar/eliminar todo
- Acceso completo al sistema
- Puede crear usuarios

### **Usuario empresa**
- Ve solo su empresa asignada
- **Acceso total**: Ve todos los proyectos de su empresa
- **Acceso limitado**: Solo proyectos donde es contacto
- Puede subir registros llenos
- Solo admin puede crear/editar documentos base

## 🚀 Despliegue

### Opción 1: Vercel (Recomendada)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Opción 2: Netlify

1. Build del proyecto: `npm run build`
2. Sube la carpeta `dist` a Netlify
3. Configura variables de entorno

### Opción 3: VPS

```bash
# Build
npm run build

# Servir con nginx o Apache
# La carpeta dist/ contiene los archivos estáticos
```

## 📧 Soporte

Para soporte técnico:
- **Email**: hola@goodsolutions.pe
- **WhatsApp**: +51 962 342 328

## 📄 Licencia

© 2025 Good Solutions S.A.C. Todos los derechos reservados.