# Solución: Error de Tipos MIME para Archivos de Excel

## Problema Identificado

Al intentar subir archivos de Excel (.xls, .xlsx) a través del modal de subida de documentos, se presenta el siguiente error:

```
Error subiendo documento: Error subiendo archivo: mime type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet is not supported
```

## Causa del Problema

El bucket de storage `documents` en Supabase no tenía configurados los tipos MIME para archivos de Excel. Solo permitía:
- `application/pdf` (PDF)
- `application/msword` (DOC)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

## Solución Implementada

### 1. Código Frontend (Ya Corregido)

Se actualizó el servicio `StorageService` en `src/services/storage.ts`:

- ✅ Se agregó validación de tipos MIME en `uploadDocument()`
- ✅ Se actualizó `DOCUMENT_TYPES` para incluir tipos de Excel
- ✅ El modal ya acepta archivos `.xls` y `.xlsx`

### 2. Configuración de Supabase Storage (Pendiente de Ejecutar)

**IMPORTANTE**: Ejecutar el siguiente script en el SQL Editor de Supabase:

```sql
-- Actualizar el bucket 'documents' para permitir archivos de Excel
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]
WHERE id = 'documents';
```

**Archivo**: `fix_excel_mime_types.sql`

## Tipos MIME Soportados Ahora

### Documentos
- ✅ PDF: `application/pdf`
- ✅ DOC: `application/msword`
- ✅ DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- ✅ XLS: `application/vnd.ms-excel`
- ✅ XLSX: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Registros
- ✅ PDF, DOC, DOCX, XLS, XLSX
- ✅ Imágenes: JPEG, PNG, WebP

## Pasos para Resolver

1. **Ejecutar Script SQL** en Supabase Dashboard → SQL Editor
2. **Reiniciar la aplicación** (opcional, pero recomendado)
3. **Probar subida** de archivos Excel

## Verificación

Después de ejecutar el script, verificar en Supabase:

```sql
SELECT id, name, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'documents';
```

Debería mostrar los 5 tipos MIME permitidos.

## Notas Adicionales

- El límite de tamaño sigue siendo 10MB por archivo
- La validación se realiza tanto en frontend como en backend
- Los archivos se almacenan en la estructura: `companyId/projectId/documentId/version/`

## Estado

- ✅ **Frontend**: Corregido y probado
- ⏳ **Backend**: Pendiente de ejecutar script SQL
- 🔄 **Próximo**: Probar subida de archivos Excel
