-- Agregar campo temp_password a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Agregar comentario al campo
COMMENT ON COLUMN users.temp_password IS 'Contraseña temporal generada automáticamente para nuevos usuarios';
