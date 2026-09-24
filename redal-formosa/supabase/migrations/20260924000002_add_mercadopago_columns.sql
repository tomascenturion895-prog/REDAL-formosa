-- Agregar columnas para MercadoPago en tabla pagos
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS referencia_externa TEXT,
ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Crear índice en referencia_externa para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pagos_referencia_externa ON pagos(referencia_externa);

-- Agregar columna resultado en validacion_biometrica para guardar resultado
ALTER TABLE validacion_biometrica
ADD COLUMN IF NOT EXISTS resultado JSONB;

-- Crear trigger para actualizar updated_at en pagos
CREATE OR REPLACE FUNCTION update_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pagos_updated_at_trigger ON pagos;
CREATE TRIGGER update_pagos_updated_at_trigger
BEFORE UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION update_pagos_updated_at();
