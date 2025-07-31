/*
  # Configuración de Supabase Storage
  
  Buckets y políticas de seguridad para archivos:
  - documents: PDFs, DOC, DOCX de documentos
  - records: XLS, XLSX de formatos de registro
  - record-entries: Archivos de registros llenos
  - avatars: Fotos de perfil de usuarios
*/

-- ==============================================
-- CREAR BUCKETS DE STORAGE
-- ==============================================

-- Bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para formatos de registro
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'records',
    'records',
    false,
    10485760, -- 10MB
    ARRAY['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para registros llenos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'record-entries',
    'record-entries',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- POLÍTICAS DE STORAGE PARA DOCUMENTS
-- ==============================================

-- Admin puede ver todos los documentos
CREATE POLICY "Admin can view all documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Usuario empresa puede ver documentos de su empresa
CREATE POLICY "Company users can view company documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND name ~ '^[^/]+/[^/]+/'  -- formato: company_id/project_id/...
        AND split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Usuario con acceso limitado solo ve documentos de sus proyectos
CREATE POLICY "Limited users can view assigned project documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND split_part(name, '/', 2)::uuid IN (
            SELECT pc.project_id 
            FROM project_contacts pc
            JOIN users u ON u.id = pc.user_id
            WHERE u.id = auth.uid() 
            AND u.can_view_all_company_projects = false
        )
    );

-- Usuarios pueden subir documentos a proyectos de su empresa
CREATE POLICY "Authorized users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Usuarios pueden actualizar documentos de su empresa
CREATE POLICY "Authorized users can update documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'documents'
        AND (split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        ))
    );

-- Admin puede eliminar documentos
CREATE POLICY "Admin can delete documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ==============================================
-- POLÍTICAS DE STORAGE PARA RECORDS
-- ==============================================

-- Aplicar las mismas políticas que documents pero para bucket 'records'
CREATE POLICY "Admin can view all records"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'records' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Company users can view company records"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'records'
        AND split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Authorized users can upload records"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'records'
        AND split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admin can delete records"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'records'
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ==============================================
-- POLÍTICAS DE STORAGE PARA RECORD-ENTRIES
-- ==============================================

CREATE POLICY "Users can view record entries"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'record-entries'
        AND (split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        ))
    );

CREATE POLICY "Users can upload record entries"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'record-entries'
        AND split_part(name, '/', 1)::uuid IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- ==============================================
-- POLÍTICAS DE STORAGE PARA AVATARS
-- ==============================================

-- Avatars son públicos pero solo el usuario puede subir/actualizar el suyo
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND name = auth.uid()::text
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND name = auth.uid()::text
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND name = auth.uid()::text
    );