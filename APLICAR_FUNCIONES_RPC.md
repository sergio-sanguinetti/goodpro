# 🔧 APLICAR FUNCIONES RPC PARA ACTUALIZACIÓN DE USUARIOS

## 📋 Instrucciones para aplicar las funciones RPC

Para que la actualización de emails y contraseñas funcione correctamente, necesitas aplicar las funciones RPC en tu proyecto de Supabase.

### 🚀 Paso 1: Ir al SQL Editor de Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral izquierdo

### 🚀 Paso 2: Ejecutar el SQL

Copia y pega el siguiente código SQL en el editor y ejecútalo:

```sql
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
```

### ✅ Paso 3: Verificar que se aplicó correctamente

Después de ejecutar el SQL, deberías ver un mensaje de éxito. Las funciones estarán disponibles para ser llamadas desde tu aplicación.

### 🔍 Paso 4: Probar la funcionalidad

1. Ve a tu aplicación
2. Inicia sesión como administrador
3. Ve al panel de configuración
4. Edita un usuario
5. Cambia el email y/o la contraseña
6. Guarda los cambios

## 🎯 Funcionalidades implementadas

### ✅ Actualización de datos básicos
- Nombre y apellidos
- Teléfono
- Rol
- Empresa
- Estado activo/inactivo
- Permisos de acceso

### ✅ Actualización de email
- Se actualiza tanto en `auth.users` como en `users`
- El usuario necesitará confirmar el nuevo email
- Solo administradores pueden hacer este cambio

### ✅ Actualización de contraseña
- Se actualiza la contraseña en `auth.users`
- Solo administradores pueden hacer este cambio
- La contraseña se encripta de forma segura

## 🔒 Seguridad

- Solo usuarios con rol `admin` pueden ejecutar estas funciones
- Las funciones verifican permisos antes de realizar cambios
- Los cambios se registran en los logs de Supabase
- Las contraseñas se encriptan usando bcrypt

## 🚨 Notas importantes

1. **Confirmación de email**: Cuando cambies el email de un usuario, necesitará confirmar el nuevo email para poder iniciar sesión.

2. **Contraseñas**: Las contraseñas se actualizan inmediatamente y el usuario podrá usar la nueva contraseña para iniciar sesión.

3. **Permisos**: Solo los administradores pueden realizar estos cambios.

4. **Logs**: Todos los cambios se registran en los logs de Supabase para auditoría.

---

¡Una vez que hayas aplicado estas funciones RPC, la actualización completa de usuarios funcionará correctamente!
