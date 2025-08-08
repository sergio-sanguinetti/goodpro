-- Agregar columna email_confirmed a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- Actualizar usuarios existentes para marcar sus emails como confirmados
UPDATE public.users 
SET email_confirmed = true 
WHERE email_confirmed IS NULL OR email_confirmed = false;
