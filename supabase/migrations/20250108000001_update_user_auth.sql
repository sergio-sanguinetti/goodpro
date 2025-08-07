-- Función para actualizar email de usuario de forma segura
CREATE OR REPLACE FUNCTION update_user_email(user_id uuid, new_email text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Verificar que el usuario que ejecuta la función es admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    RETURN json_build_object('error', 'No tienes permisos para realizar esta acción');
  END IF;

  -- Verificar que el usuario existe
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  -- Actualizar email en auth.users
  UPDATE auth.users 
  SET email = new_email, 
      email_confirmed_at = NULL, -- Requerir nueva confirmación
      updated_at = now()
  WHERE id = user_id;

  -- Actualizar email en nuestra tabla users
  UPDATE users 
  SET email = new_email,
      updated_at = now()
  WHERE id = user_id;

  RETURN json_build_object('success', true, 'message', 'Email actualizado correctamente');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar contraseña de usuario de forma segura
CREATE OR REPLACE FUNCTION update_user_password(user_id uuid, new_password text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Verificar que el usuario que ejecuta la función es admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    RETURN json_build_object('error', 'No tienes permisos para realizar esta acción');
  END IF;

  -- Verificar que el usuario existe
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  -- Actualizar contraseña en auth.users
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = user_id;

  RETURN json_build_object('success', true, 'message', 'Contraseña actualizada correctamente');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION update_user_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(uuid, text) TO authenticated;
