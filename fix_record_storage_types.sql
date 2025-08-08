-- Script para arreglar la configuración de tipos MIME en buckets de storage
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- Actualizar bucket 'records' para permitir archivos Word (.doc, .docx) e imágenes
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp'
]
WHERE id = 'records';

-- Actualizar bucket 'record-entries' para permitir archivos Word (.doc, .docx) e imágenes
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp'
]
WHERE id = 'record-entries';

-- Verificar que los cambios se aplicaron correctamente
SELECT 
  id,
  name,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('records', 'record-entries')
ORDER BY id;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Configuración de buckets actualizada correctamente';
  RAISE NOTICE '📁 Bucket "records" ahora permite: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), imágenes (.jpg, .png, .webp)';
  RAISE NOTICE '📁 Bucket "record-entries" ahora permite: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), imágenes (.jpg, .png, .webp)';
END $$;
