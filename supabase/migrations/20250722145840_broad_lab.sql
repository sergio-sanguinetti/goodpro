/*
  # Datos iniciales para GoodPro
  
  Insertar datos base para comenzar:
  - Categorías de documentos SST estándar
  - Usuario admin inicial
  - Algunas empresas de ejemplo
*/

-- ==============================================
-- CATEGORÍAS DE DOCUMENTOS Y REGISTROS
-- ==============================================

INSERT INTO document_categories (id, name, description, normative_reference, type, is_required, renewal_period_months) VALUES
(uuid_generate_v4(), 'Política de SST', 'Política de Seguridad y Salud en el Trabajo', 'Ley 29783 - Art. 17', 'document', true, 12),
(uuid_generate_v4(), 'IPERC', 'Identificación de Peligros y Evaluación de Riesgos', 'ISO 45001 - 6.1.2', 'document', true, 12),
(uuid_generate_v4(), 'Plan de Emergencia', 'Plan de preparación y respuesta ante emergencias', 'Ley 29783 - Art. 61', 'document', true, 12),
(uuid_generate_v4(), 'Reglamento Interno SST', 'Reglamento Interno de Seguridad y Salud en el Trabajo', 'Ley 29783 - Art. 34', 'document', true, 24),
(uuid_generate_v4(), 'Manual de Procedimientos', 'Manual de procedimientos de seguridad', 'DS 005-2012-TR', 'document', false, 18),
(uuid_generate_v4(), 'Programa Anual SST', 'Programa Anual de Seguridad y Salud en el Trabajo', 'Ley 29783 - Art. 32', 'document', true, 12),

(uuid_generate_v4(), 'Registro de Capacitaciones', 'Registro de capacitaciones realizadas', 'Ley 29783 - Art. 27', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Inspecciones', 'Registro de inspecciones de seguridad', 'DS 005-2012-TR - Art. 88', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Incidentes', 'Registro de incidentes y accidentes', 'Ley 29783 - Art. 42', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Auditorías', 'Registro de auditorías internas', 'ISO 45001 - 9.2', 'record', false, 0),
(uuid_generate_v4(), 'Registro de EPP', 'Registro de entrega y control de EPP', 'DS 005-2012-TR - Art. 60', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Reuniones SST', 'Registro de reuniones del comité SST', 'Ley 29783 - Art. 29', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Exámenes Médicos', 'Registro de exámenes médicos ocupacionales', 'DS 005-2012-TR - Art. 101', 'record', true, 0),
(uuid_generate_v4(), 'Registro de Monitoreo', 'Registro de monitoreo de agentes físicos/químicos', 'DS 005-2012-TR - Art. 104', 'record', false, 0)
ON CONFLICT DO NOTHING;

-- ==============================================
-- FUNCIÓN PARA CREAR USUARIO ADMIN AUTOMÁTICAMENTE
-- ==============================================

-- Esta función se ejecutará cuando se cree un usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar perfil extendido para el nuevo usuario
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        CASE 
            WHEN NEW.email = 'admin@goodpro.pe' THEN 'admin'
            ELSE 'company_user'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta cuando se registra un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- FUNCIÓN PARA NOTIFICACIONES AUTOMÁTICAS
-- ==============================================

-- Función para crear notificaciones cuando se crean/actualizan documentos
CREATE OR REPLACE FUNCTION create_document_notification()
RETURNS TRIGGER AS $$
DECLARE
    company_users RECORD;
    notification_type text;
    notification_title text;
    notification_message text;
BEGIN
    -- Determinar tipo de notificación basado en el cambio
    IF TG_OP = 'INSERT' THEN
        notification_type := 'info';
        notification_title := 'Nuevo documento creado';
        notification_message := 'Se ha creado el documento: ' || NEW.nombre;
    ELSIF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                notification_type := 'success';
                notification_title := 'Documento aprobado';
                notification_message := 'El documento "' || NEW.nombre || '" ha sido aprobado';
            WHEN 'rejected' THEN
                notification_type := 'error';
                notification_title := 'Documento rechazado';
                notification_message := 'El documento "' || NEW.nombre || '" ha sido rechazado';
            WHEN 'expired' THEN
                notification_type := 'warning';
                notification_title := 'Documento vencido';
                notification_message := 'El documento "' || NEW.nombre || '" ha vencido';
            ELSE
                notification_type := 'info';
                notification_title := 'Estado de documento actualizado';
                notification_message := 'El documento "' || NEW.nombre || '" cambió a: ' || NEW.status;
        END CASE;
    ELSE
        -- No crear notificación para otros cambios
        RETURN NEW;
    END IF;

    -- Crear notificaciones para usuarios de la empresa del proyecto
    FOR company_users IN
        SELECT u.id, u.company_id
        FROM users u
        JOIN projects p ON p.company_id = u.company_id
        WHERE p.id = NEW.project_id 
        AND u.is_active = true
    LOOP
        INSERT INTO notifications (
            user_id, 
            company_id, 
            project_id, 
            document_id, 
            type, 
            title, 
            message
        ) VALUES (
            company_users.id,
            company_users.company_id,
            NEW.project_id,
            NEW.id,
            notification_type,
            notification_title,
            notification_message
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para documentos
CREATE OR REPLACE TRIGGER document_notification_trigger
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION create_document_notification();

-- Función similar para record_formats
CREATE OR REPLACE FUNCTION create_record_notification()
RETURNS TRIGGER AS $$
DECLARE
    company_users RECORD;
    notification_type text;
    notification_title text;
    notification_message text;
BEGIN
    IF TG_OP = 'INSERT' THEN
        notification_type := 'info';
        notification_title := 'Nuevo formato de registro';
        notification_message := 'Se ha creado el formato: ' || NEW.nombre;
    ELSIF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                notification_type := 'success';
                notification_title := 'Formato aprobado';
                notification_message := 'El formato "' || NEW.nombre || '" ha sido aprobado';
            ELSE
                notification_type := 'info';
                notification_title := 'Estado de formato actualizado';
                notification_message := 'El formato "' || NEW.nombre || '" cambió a: ' || NEW.status;
        END CASE;
    ELSE
        RETURN NEW;
    END IF;

    FOR company_users IN
        SELECT u.id, u.company_id
        FROM users u
        JOIN projects p ON p.company_id = u.company_id
        WHERE p.id = NEW.project_id 
        AND u.is_active = true
    LOOP
        INSERT INTO notifications (
            user_id, 
            company_id, 
            project_id, 
            record_format_id, 
            type, 
            title, 
            message
        ) VALUES (
            company_users.id,
            company_users.company_id,
            NEW.project_id,
            NEW.id,
            notification_type,
            notification_title,
            notification_message
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para record_formats
CREATE OR REPLACE TRIGGER record_notification_trigger
    AFTER INSERT OR UPDATE ON record_formats
    FOR EACH ROW EXECUTE FUNCTION create_record_notification();

-- ==============================================
-- FUNCIÓN PARA DETECTAR DOCUMENTOS PRÓXIMOS A VENCER
-- ==============================================

-- Esta función se puede llamar diariamente para crear notificaciones de vencimiento
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS void AS $$
DECLARE
    expiring_doc RECORD;
    days_until_expiry integer;
    notification_exists boolean;
BEGIN
    -- Revisar documentos que vencen en 30, 15, 7 o 1 días
    FOR expiring_doc IN
        SELECT d.*, p.company_id
        FROM documents d
        JOIN projects p ON p.id = d.project_id
        WHERE d.status = 'approved' 
        AND d.fecha_vencimiento > CURRENT_DATE
        AND d.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
    LOOP
        days_until_expiry := d.fecha_vencimiento - CURRENT_DATE;
        
        -- Solo crear notificaciones en hitos específicos
        IF days_until_expiry IN (30, 15, 7, 1) THEN
            -- Verificar que no existe ya una notificación reciente para este documento
            SELECT EXISTS(
                SELECT 1 FROM notifications 
                WHERE document_id = expiring_doc.id 
                AND type = 'warning'
                AND title LIKE '%próximo a vencer%'
                AND created_at > CURRENT_DATE - INTERVAL '1 day'
            ) INTO notification_exists;
            
            IF NOT notification_exists THEN
                -- Crear notificaciones para usuarios de la empresa
                INSERT INTO notifications (
                    user_id, 
                    company_id, 
                    project_id, 
                    document_id, 
                    type, 
                    title, 
                    message
                )
                SELECT 
                    u.id,
                    u.company_id,
                    expiring_doc.project_id,
                    expiring_doc.id,
                    'warning',
                    'Documento próximo a vencer',
                    'El documento "' || expiring_doc.nombre || '" vence en ' || days_until_expiry || ' días'
                FROM users u
                WHERE u.company_id = expiring_doc.company_id
                AND u.is_active = true;
            END IF;
        END IF;
    END LOOP;
    
    -- Lo mismo para record_formats
    FOR expiring_doc IN
        SELECT rf.*, p.company_id
        FROM record_formats rf
        JOIN projects p ON p.id = rf.project_id
        WHERE rf.status = 'approved' 
        AND rf.fecha_vencimiento > CURRENT_DATE
        AND rf.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
    LOOP
        days_until_expiry := expiring_doc.fecha_vencimiento - CURRENT_DATE;
        
        IF days_until_expiry IN (30, 15, 7, 1) THEN
            SELECT EXISTS(
                SELECT 1 FROM notifications 
                WHERE record_format_id = expiring_doc.id 
                AND type = 'warning'
                AND title LIKE '%próximo a vencer%'
                AND created_at > CURRENT_DATE - INTERVAL '1 day'
            ) INTO notification_exists;
            
            IF NOT notification_exists THEN
                INSERT INTO notifications (
                    user_id, 
                    company_id, 
                    project_id, 
                    record_format_id, 
                    type, 
                    title, 
                    message
                )
                SELECT 
                    u.id,
                    u.company_id,
                    expiring_doc.project_id,
                    expiring_doc.id,
                    'warning',
                    'Formato próximo a vencer',
                    'El formato "' || expiring_doc.nombre || '" vence en ' || days_until_expiry || ' días'
                FROM users u
                WHERE u.company_id = expiring_doc.company_id
                AND u.is_active = true;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;