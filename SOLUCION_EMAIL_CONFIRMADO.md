# Solución Completa para "Email not confirmed"

## Problema
Los usuarios nuevos reciben el error "Email not confirmed" al intentar iniciar sesión.

## Solución Paso a Paso

### 1. Desactivar Confirmación de Email en Supabase Dashboard (MÁS FÁCIL)

1. Ve al dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Settings**
4. En la sección **Email Auth**, **DESACTIVA** la opción **"Enable email confirmations"**
5. Guarda los cambios

### 2. Si prefieres mantener la confirmación pero confirmar automáticamente

Ejecuta estos scripts en el **SQL Editor** de Supabase:

#### Script 1: Crear función para confirmar email
```sql
-- Función para confirmar automáticamente el email de un usuario
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar el estado de confirmación del email en auth.users
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = user_id;
  
  -- También actualizar el estado de confirmación en nuestra tabla users si existe
  UPDATE public.users 
  SET email_confirmed = true,
      updated_at = NOW()
  WHERE id = user_id;
  
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO service_role;
```

#### Script 2: Agregar columna email_confirmed
```sql
-- Agregar columna email_confirmed a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- Actualizar usuarios existentes para marcar sus emails como confirmados
UPDATE public.users 
SET email_confirmed = true 
WHERE email_confirmed IS NULL OR email_confirmed = false;
```

### 3. Verificar que funciona

1. Crea un nuevo usuario desde el panel de configuración
2. Intenta iniciar sesión con ese usuario
3. Debería funcionar sin el error "Email not confirmed"

## Recomendación

**Usa la opción 1** (desactivar confirmación en dashboard) porque es más simple y efectiva para un entorno de desarrollo o interno.

La opción 2 es más compleja pero mantiene la confirmación habilitada para mayor seguridad.
