-- Script para crear los buckets de storage necesarios
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- 1. Crear bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear bucket para registros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'records',
  'records',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear bucket para entradas de registros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'record-entries',
  'record-entries',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Crear bucket para avatares (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar que los buckets se crearon correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id IN ('documents', 'records', 'record-entries', 'avatars')
ORDER BY id;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ BUCKETS DE STORAGE CREADOS EXITOSAMENTE';
    RAISE NOTICE '📁 Buckets creados: documents, records, record-entries, avatars';
    RAISE NOTICE '🔒 Configuración: Privados (excepto avatars)';
    RAISE NOTICE '📏 Límite de tamaño: 50MB para documentos/registros, 2MB para avatars';
END $$;
