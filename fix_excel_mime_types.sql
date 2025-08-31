-- Script para corregir los tipos MIME permitidos en el bucket de documentos
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- ===============================================
-- CORREGIR TIPOS MIME DEL BUCKET DOCUMENTS
-- ===============================================

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

-- ===============================================
-- VERIFICACIÓN
-- ===============================================

-- Verificar que se actualizó correctamente
SELECT 
  'BUCKET DOCUMENTS ACTUALIZADO' as tipo,
  id,
  name,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'documents';

-- ===============================================
-- MENSAJE DE CONFIRMACIÓN
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '✅ TIPOS MIME DE EXCEL AGREGADOS AL BUCKET DOCUMENTS';
    RAISE NOTICE '📊 Ahora se pueden subir archivos: PDF, DOC, DOCX, XLS, XLSX';
    RAISE NOTICE '🔧 Tipos MIME agregados:';
    RAISE NOTICE '   - application/vnd.ms-excel (.xls)';
    RAISE NOTICE '   - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)';
END $$;
