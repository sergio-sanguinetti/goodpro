-- Script completo para configurar Storage en Supabase
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- ===============================================
-- 1. CREAR BUCKETS DE STORAGE
-- ===============================================

-- Bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para registros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'records',
  'records',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para entradas de registros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'record-entries',
  'record-entries',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES
-- ===============================================

DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company records" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company record entries" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload company records" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload company record entries" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company records" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company record entries" ON storage.objects;

-- ===============================================
-- 3. CREAR POLÍTICAS RLS PARA STORAGE
-- ===============================================

-- Política para bucket 'documents' - SELECT (Ver)
CREATE POLICY "Users can view company documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND (
      -- Admins pueden ver todo
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Usuarios de empresa pueden ver archivos de su empresa
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Política para bucket 'documents' - INSERT (Subir)
CREATE POLICY "Users can upload company documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND (
      -- Solo admins pueden subir
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- Política para bucket 'documents' - DELETE (Eliminar)
CREATE POLICY "Users can delete company documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND (
      -- Solo admins pueden eliminar
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- Política para bucket 'records' - SELECT (Ver)
CREATE POLICY "Users can view company records"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'records' AND (
      -- Admins pueden ver todo
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Usuarios de empresa pueden ver archivos de su empresa
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Política para bucket 'records' - INSERT (Subir)
CREATE POLICY "Users can upload company records"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'records' AND (
      -- Solo admins pueden subir
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- Política para bucket 'records' - DELETE (Eliminar)
CREATE POLICY "Users can delete company records"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'records' AND (
      -- Solo admins pueden eliminar
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- Política para bucket 'record-entries' - SELECT (Ver)
CREATE POLICY "Users can view company record entries"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'record-entries' AND (
      -- Admins pueden ver todo
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
      OR
      -- Usuarios de empresa pueden ver archivos de su empresa
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
          AND u.is_active = true 
          AND u.role = 'company_user'
          AND (storage.foldername(name))[1] = u.company_id::text
      )
    )
  );

-- Política para bucket 'record-entries' - INSERT (Subir)
CREATE POLICY "Users can upload company record entries"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'record-entries' AND (
      -- Solo admins pueden subir
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- Política para bucket 'record-entries' - DELETE (Eliminar)
CREATE POLICY "Users can delete company record entries"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'record-entries' AND (
      -- Solo admins pueden eliminar
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
      )
    )
  );

-- ===============================================
-- 4. VERIFICACIÓN
-- ===============================================

-- Verificar buckets creados
SELECT 
  'BUCKETS CREADOS' as tipo,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE id IN ('documents', 'records', 'record-entries', 'avatars')
ORDER BY id;

-- Verificar políticas creadas
SELECT 
  'POLÍTICAS CREADAS' as tipo,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- ===============================================
-- 5. MENSAJE DE CONFIRMACIÓN
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURACIÓN DE STORAGE COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📁 Buckets: documents, records, record-entries, avatars';
    RAISE NOTICE '🔒 Políticas: SELECT (ver) para todos, INSERT/DELETE solo para admins';
    RAISE NOTICE '👥 Acceso: Admins (todo), Company Users (solo ver archivos de su empresa)';
    RAISE NOTICE '📏 Límites: 50MB documentos/registros, 2MB avatars';
END $$;
