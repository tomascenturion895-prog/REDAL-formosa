-- Agregar columna pedido_id a repartidores para asociar pedidos
ALTER TABLE repartidores
ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL;

-- Crear índice en repartidor_id de ubicaciones_tiempo_real
CREATE INDEX IF NOT EXISTS idx_ubicaciones_repartidor_id
ON ubicaciones_tiempo_real(repartidor_id);

-- Crear índice para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_ubicaciones_actualizado_en
ON ubicaciones_tiempo_real(actualizado_en DESC);

-- Crear función para limpiar ubicaciones antiguas (más de 7 días)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $$
BEGIN
  DELETE FROM ubicaciones_tiempo_real
  WHERE actualizado_en < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at en ubicaciones_tiempo_real
CREATE OR REPLACE FUNCTION update_ubicaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ubicaciones_updated_at_trigger ON ubicaciones_tiempo_real;
CREATE TRIGGER update_ubicaciones_updated_at_trigger
BEFORE UPDATE ON ubicaciones_tiempo_real
FOR EACH ROW
EXECUTE FUNCTION update_ubicaciones_updated_at();
