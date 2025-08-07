-- Función para confirmar automáticamente emails de nuevos usuarios
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmar el email automáticamente cuando se crea un nuevo usuario
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecute después de insertar un usuario
DROP TRIGGER IF EXISTS trigger_auto_confirm_email ON auth.users;
CREATE TRIGGER trigger_auto_confirm_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user_email();

-- Confirmar todos los emails existentes que no estén confirmados
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
