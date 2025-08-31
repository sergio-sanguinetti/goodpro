-- Agregar columna lifecycleStage a la tabla documents
ALTER TABLE documents 
ADD COLUMN lifecycle_stage VARCHAR(50) DEFAULT 'Elaboración';

-- Actualizar registros existentes con valores por defecto basados en el status
UPDATE documents 
SET lifecycle_stage = CASE 
  WHEN status = 'draft' THEN 'Elaboración'
  WHEN status = 'pending_review' THEN 'Revisión'
  WHEN status = 'approved' THEN 'Vigente'
  WHEN status = 'expired' THEN 'Obsoleto'
  WHEN status = 'rejected' THEN 'Revisión'
  ELSE 'Elaboración'
END;

-- Hacer la columna NOT NULL después de actualizar los valores
ALTER TABLE documents 
ALTER COLUMN lifecycle_stage SET NOT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN documents.lifecycle_stage IS 'Estado del ciclo de vida del documento (Elaboración, Revisión, Aprobación, Vigente, Obsoleto)';

