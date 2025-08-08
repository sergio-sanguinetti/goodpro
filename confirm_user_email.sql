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
