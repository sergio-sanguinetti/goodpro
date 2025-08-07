# Solución para Error "Object not found" en Descarga de Documentos

## Problema Identificado

El error `❌ Error generando URL: Object not found` indica que el archivo no se encuentra en la ruta especificada en Supabase Storage. Esto puede deberse a:

1. **Políticas RLS (Row Level Security) no configuradas correctamente**
2. **Ruta del archivo incorrecta en la base de datos**
3. **Archivo no existe en el bucket de storage**

## Solución Paso a Paso

### Paso 1: Aplicar Políticas RLS Corregidas

1. Ve al **Dashboard de Supabase** de tu proyecto
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `fix_storage_policies.sql`
4. Ejecuta el script

Este script:
- Elimina las políticas RLS existentes que pueden estar causando problemas
- Crea nuevas políticas simplificadas que permiten:
  - **Admins**: Ver todos los archivos
  - **Company Users**: Ver solo archivos de su empresa

### Paso 2: Verificar la Configuración

Después de ejecutar el script, verifica que las políticas se aplicaron correctamente:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
```

Deberías ver 3 políticas:
- `Users can view company documents`
- `Users can view company records` 
- `Users can view company record entries`

### Paso 3: Probar la Descarga

1. Recarga la aplicación
2. Inicia sesión como usuario de empresa
3. Intenta descargar un documento
4. Revisa la consola del navegador para ver los logs detallados

### Paso 4: Verificar Rutas de Archivos (Si persiste el error)

Si el error persiste, verifica que las rutas de archivos estén correctas:

1. Ve a **Storage** en el Dashboard de Supabase
2. Navega al bucket `documents`
3. Verifica que los archivos estén en la estructura correcta:
   ```
   companyId/projectId/documentId/version/fileName
   ```

### Paso 5: Debug Adicional (Si es necesario)

Si el problema persiste, el código actualizado incluye logs detallados que mostrarán:

- La ruta del archivo que se está intentando acceder
- Si el archivo existe en el directorio
- Errores específicos de permisos o archivo no encontrado

## Cambios Realizados en el Código

### 1. StorageService.getDownloadUrl
- Agregado logging detallado
- Verificación de existencia del archivo
- Manejo de rutas con `/` inicial
- Fallback a URL pública si la URL firmada falla

### 2. DocumentSection.handleDownloadDocument
- Agregado logging del usuario y contexto
- Información detallada sobre la ruta del archivo

## Verificación Final

Después de aplicar estos cambios:

1. ✅ Los usuarios de empresa pueden ver documentos
2. ✅ Los usuarios de empresa pueden descargar documentos
3. ✅ Los admins mantienen acceso completo
4. ✅ Las políticas RLS están configuradas correctamente

## Si el Problema Persiste

Si después de aplicar estas correcciones el problema persiste:

1. **Verifica los logs en la consola del navegador** - proporcionarán información detallada sobre el error
2. **Revisa la estructura de archivos en Storage** - asegúrate de que los archivos estén en las rutas correctas
3. **Verifica las políticas RLS** - ejecuta la consulta de verificación del Paso 2
4. **Contacta soporte** - proporciona los logs de la consola para diagnóstico adicional

## Archivos Modificados

- `src/services/storage.ts` - Mejorado el manejo de errores y logging
- `src/components/DocumentSection.tsx` - Agregado logging detallado
- `fix_storage_policies.sql` - Script para corregir políticas RLS
