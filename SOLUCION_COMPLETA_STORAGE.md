# Solución Completa para Error "Bucket not found" y Acceso a Documentos

## 🚨 Problema Identificado

El error `"Bucket not found"` indica que **los buckets de storage no existen** en Supabase. Esto causa que:
- ❌ Los administradores no puedan acceder a documentos
- ❌ Los usuarios de empresa no puedan ver ni descargar documentos
- ❌ Las rutas de archivos no funcionen para ningún rol

## 🛠️ Solución Paso a Paso

### Paso 1: Crear Buckets de Storage

1. Ve al **Dashboard de Supabase** de tu proyecto
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `setup_storage_complete.sql`
4. Ejecuta el script completo

Este script creará:
- ✅ Bucket `documents` (para documentos)
- ✅ Bucket `records` (para registros)
- ✅ Bucket `record-entries` (para entradas de registros)
- ✅ Bucket `avatars` (para avatares de usuario)

### Paso 2: Verificar Configuración

Después de ejecutar el script, verifica que todo se configuró correctamente:

```sql
-- Verificar buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('documents', 'records', 'record-entries', 'avatars');

-- Verificar políticas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Paso 3: Probar la Aplicación

1. Recarga la aplicación
2. Inicia sesión como **administrador**
3. Verifica que puedes ver y descargar documentos
4. Inicia sesión como **usuario de empresa**
5. Verifica que puedes ver y descargar documentos de tu empresa

## 📋 Configuración de Políticas RLS

### Para Administradores:
- ✅ **Ver**: Todos los archivos en todos los buckets
- ✅ **Subir**: Archivos en todos los buckets
- ✅ **Eliminar**: Archivos en todos los buckets

### Para Usuarios de Empresa:
- ✅ **Ver**: Solo archivos de su empresa (primer folder = company_id)
- ❌ **Subir**: No permitido
- ❌ **Eliminar**: No permitido

## 🔍 Estructura de Rutas

Las rutas se generan de forma idéntica para ambos roles:

```
📁 Documents: companyId/projectId/documentId/version/fileName
📁 Records: companyId/projectId/recordId/version/fileName
📁 Record Entries: companyId/projectId/recordFormatId/entryId/fileName
```

**Ejemplo:**
```
9e081dce-f695-4fe7-9624-1b09c4fa5971/812d3017-df4a-472d-a848-4439520951c1/1.0/1754451490516.pdf
```

## 🐛 Debug Mejorado

El código actualizado incluye logs detallados que mostrarán:

### En la Consola del Navegador:
```
🔍 StorageService.getDownloadUrl - Bucket: documents
🔍 StorageService.getDownloadUrl - Original filePath: /9e081dce-f695-4fe7-9624-1b09c4fa5971/...
🔍 StorageService.getDownloadUrl - Clean filePath: 9e081dce-f695-4fe7-9624-1b09c4fa5971/...
📦 ¿Bucket "documents" existe?: true
📁 Directorio a verificar: 9e081dce-f695-4fe7-9624-1b09c4fa5971/812d3017-df4a-472d-a848-4439520951c1/1.0
📄 Nombre del archivo: 1754451490516.pdf
📄 ¿Archivo "1754451490516.pdf" existe?: true
✅ URL generada exitosamente: https://...
```

## ✅ Verificación Final

Después de aplicar la solución:

### Para Administradores:
- ✅ Pueden ver todos los documentos y registros
- ✅ Pueden descargar todos los archivos
- ✅ Pueden subir nuevos archivos
- ✅ Pueden eliminar archivos

### Para Usuarios de Empresa:
- ✅ Pueden ver documentos de su empresa
- ✅ Pueden descargar documentos de su empresa
- ✅ No pueden ver documentos de otras empresas
- ✅ No pueden subir ni eliminar archivos

## 🚨 Si el Problema Persiste

### 1. Verificar Buckets en Supabase Dashboard:
1. Ve a **Storage** en el Dashboard de Supabase
2. Verifica que aparezcan los buckets: `documents`, `records`, `record-entries`, `avatars`

### 2. Verificar Políticas RLS:
```sql
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. Verificar Archivos en Storage:
1. Ve a **Storage** → **documents**
2. Verifica que los archivos estén en la estructura correcta
3. Verifica que las rutas coincidan con las de la base de datos

### 4. Revisar Logs de la Consola:
- Abre las **Herramientas de Desarrollador** (F12)
- Ve a la pestaña **Console**
- Busca mensajes que empiecen con 🔍, ❌, o ✅
- Proporciona estos logs para diagnóstico adicional

## 📁 Archivos Modificados

- `setup_storage_complete.sql` - Script completo para configurar storage
- `src/services/storage.ts` - Mejorado con verificación de buckets y logging detallado
- `src/components/DocumentSection.tsx` - Logging mejorado para diagnóstico

## 🎯 Resultado Esperado

Después de aplicar esta solución:
- ✅ **Misma funcionalidad** para administradores y usuarios de empresa
- ✅ **Rutas idénticas** para ambos roles
- ✅ **Acceso correcto** a documentos y registros
- ✅ **Políticas RLS** configuradas correctamente
- ✅ **Buckets de storage** creados y funcionando
