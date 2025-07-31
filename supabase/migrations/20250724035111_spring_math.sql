-- ===============================================
-- SCRIPT 1: CREAR EXTENSIONES NECESARIAS
-- Tiempo estimado: 10 segundos
-- ===============================================

-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear extensión para criptografía (para passwords)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ EXTENSIONES CREADAS CORRECTAMENTE';
END $$;