# Desactivar Confirmación de Email en Supabase

## Problema
Los usuarios nuevos reciben el error "Email not confirmed" al intentar iniciar sesión porque Supabase requiere confirmación de email por defecto.

## Solución

### 1. Configurar Supabase para desactivar confirmación de email

1. Ve al dashboard de Supabase
2. Navega a **Authentication** > **Settings**
3. En la sección **Email Auth**, desactiva la opción **"Enable email confirmations"**
4. Guarda los cambios

### 2. Aplicar las migraciones SQL

#### Ejecutar en el SQL Editor de Supabase:

```sql
-- 1. Agregar columna email_confirmed a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- 2. Actualizar usuarios existentes
UPDATE public.users 
SET email_confirmed = true 
WHERE email_confirmed IS NULL OR email_confirmed = false;

-- 3. Crear función para confirmar email automáticamente
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
  
  -- También actualizar el estado de confirmación en nuestra tabla users
  UPDATE public.users 
  SET email_confirmed = true,
      updated_at = NOW()
  WHERE id = user_id;
  
END;
$$;

-- 4. Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO service_role;
```

### 3. Verificar cambios

1. Crea un nuevo usuario desde la aplicación
2. Intenta iniciar sesión inmediatamente con las credenciales
3. El usuario debería poder iniciar sesión sin confirmar email

## Alternativa: Confirmación automática por código

Si prefieres mantener la confirmación de email habilitada pero confirmar automáticamente, el código ya está actualizado para usar la función `confirm_user_email`.

## Notas importantes

- Esta configuración desactiva la confirmación de email para TODOS los usuarios
- Los usuarios podrán iniciar sesión inmediatamente después de ser creados
- Considera las implicaciones de seguridad según tus necesidades
- Para mayor seguridad, puedes mantener la confirmación habilitada y usar la función RPC para confirmar automáticamente solo usuarios creados por administradores
