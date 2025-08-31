# Agregar Columna Ciclo de Vida a Documentos

## Problema
Al editar documentos, no aparece el campo "Ciclo de Vida" en el modal de edición.

## Solución
Se ha agregado el campo "Ciclo de Vida" al modal de edición de documentos, pero es necesario ejecutar una migración en la base de datos para que funcione correctamente.

## Pasos para Implementar

### 1. Ejecutar Migración SQL
Ejecutar el siguiente SQL en tu base de datos Supabase:

```sql
-- Agregar columna lifecycleStage a la tabla documents
ALTER TABLE documents 
ADD COLUMN lifecycle_stage VARCHAR(50) DEFAULT 'Elaboración';

-- Actualizar registros existentes con valores por defecto basados en el status
UPDATE documents 
SET lifecycle_stage = CASE 
  WHEN status = 'draft' THEN 'Elaboración'
  WHEN status = 'pending_review' THEN 'Revisión'
  WHEN status = 'approved' THEN 'Vigente'
  WHEN status = 'expired' THEN 'Obsoleto'
  WHEN status = 'rejected' THEN 'Revisión'
  ELSE 'Elaboración'
END;

-- Hacer la columna NOT NULL después de actualizar los valores
ALTER TABLE documents 
ALTER COLUMN lifecycle_stage SET NOT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN documents.lifecycle_stage IS 'Estado del ciclo de vida del documento (Elaboración, Revisión, Aprobación, Vigente, Obsoleto)';
```

### 2. Verificar Cambios
Después de ejecutar la migración:

1. **Crear Documentos**: El campo "Ciclo de Vida" ahora aparecerá al crear nuevos documentos
2. **Editar Documentos**: El campo "Ciclo de Vida" ahora aparecerá al editar documentos existentes
3. **Valores por Defecto**: Los documentos existentes tendrán valores por defecto basados en su status actual

### 3. Valores del Ciclo de Vida
Los valores disponibles son:
- **Elaboración**: Documento en proceso de creación
- **Revisión**: Documento pendiente de revisión
- **Aprobación**: Documento pendiente de aprobación
- **Vigente**: Documento aprobado y en uso
- **Obsoleto**: Documento expirado o reemplazado

## Archivos Modificados

### Frontend
- `src/components/DocumentSection.tsx`: Agregado campo ciclo de vida al modal de edición
- `src/components/DocumentUploadModal.tsx`: Agregado campo ciclo de vida al modal de creación
- `src/types/index.ts`: Agregada propiedad lifecycleStage al tipo Document

### Backend
- `src/services/database.ts`: Agregado soporte para lifecycle_stage en createDocument y updateDocument

## Notas Importantes

1. **Compatibilidad**: Los documentos existentes mantendrán su funcionalidad actual
2. **Valores por Defecto**: Se asignarán automáticamente valores apropiados basados en el status existente
3. **Validación**: El campo es obligatorio y no puede estar vacío
4. **Formato**: Los valores se almacenan como texto en la base de datos

## Verificación

Para verificar que la implementación funciona:

1. Ejecutar la migración SQL
2. Crear un nuevo documento y verificar que aparece el campo "Ciclo de Vida"
3. Editar un documento existente y verificar que aparece el campo "Ciclo de Vida"
4. Verificar que los valores se guardan correctamente en la base de datos

