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
