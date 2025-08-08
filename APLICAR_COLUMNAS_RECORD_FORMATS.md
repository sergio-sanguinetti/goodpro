# Aplicar Columnas Faltantes a record_formats

## Problema
El error indica que las columnas `ciclo_vida`, `referencia_normativa`, y `fecha_vigencia` no existen en la tabla `record_formats`.

## Solución
Ejecuta el siguiente SQL en el **Supabase SQL Editor**:

```sql
-- Agregar columnas faltantes a record_formats
ALTER TABLE record_formats 
ADD COLUMN IF NOT EXISTS ciclo_vida text DEFAULT 'Elaboración',
ADD COLUMN IF NOT EXISTS referencia_normativa text,
ADD COLUMN IF NOT EXISTS fecha_vigencia date DEFAULT CURRENT_DATE;

-- Actualizar la tabla para que fecha_vigencia tenga un valor por defecto si es NULL
UPDATE record_formats 
SET fecha_vigencia = fecha_creacion 
WHERE fecha_vigencia IS NULL;

-- Hacer fecha_vigencia NOT NULL después de actualizar
ALTER TABLE record_formats 
ALTER COLUMN fecha_vigencia SET NOT NULL;
```

## Pasos:
1. Ve al **Supabase Dashboard**
2. Navega a **SQL Editor**
3. Crea una nueva consulta
4. Pega el código SQL arriba
5. Ejecuta la consulta

## Verificación
Después de ejecutar, puedes verificar que las columnas se agregaron correctamente:

```sql
-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'record_formats'
ORDER BY ordinal_position;
```

Esto debería mostrar las nuevas columnas:
- `ciclo_vida` (text)
- `referencia_normativa` (text)
- `fecha_vigencia` (date)

## Nota
Después de aplicar estos cambios, el modal de edición debería funcionar correctamente sin errores de columnas faltantes.
