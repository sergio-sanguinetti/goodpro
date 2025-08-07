-- Confirmar todos los emails existentes que no estén confirmados
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Verificar que todos los usuarios tengan email confirmado
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
        ELSE 'No confirmado'
    END as estado
FROM auth.users 
ORDER BY created_at DESC;
