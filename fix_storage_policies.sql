-- Script para corregir las políticas RLS de storage
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- 1. Eliminar políticas existentes de storage
DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company records" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company record entries" ON storage.objects;

-- 2. Crear nuevas políticas simplificadas para storage

-- Política para bucket 'documents'
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

-- Política para bucket 'records'
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

-- Política para bucket 'record-entries'
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

-- 3. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ POLÍTICAS DE STORAGE CORREGIDAS EXITOSAMENTE';
    RAISE NOTICE '📁 Buckets configurados: documents, records, record-entries';
    RAISE NOTICE '👥 Roles permitidos: admin (todo), company_user (solo su empresa)';
END $$;
