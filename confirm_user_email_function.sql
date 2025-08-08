-- Función para confirmar automáticamente el email de un usuario
-- Ejecuta este script en el SQL Editor de Supabase

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

-- Agregar columna email_confirmed a la tabla users si no existe
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- Actualizar usuarios existentes para marcar sus emails como confirmados
UPDATE public.users 
SET email_confirmed = true 
WHERE email_confirmed IS NULL OR email_confirmed = false;
