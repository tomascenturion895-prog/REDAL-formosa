-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  repartidor_id UUID REFERENCES repartidores(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- se califica un producto o un repartidor, no ambos ni ninguno
  CONSTRAINT calificaciones_un_objetivo CHECK ((producto_id IS NOT NULL) <> (repartidor_id IS NOT NULL)),
  -- una calificación por persona y objetivo (se edita en lugar de duplicarse)
  CONSTRAINT calificaciones_unica_por_producto UNIQUE (usuario_id, producto_id),
  CONSTRAINT calificaciones_unica_por_repartidor UNIQUE (usuario_id, repartidor_id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_calificaciones_producto_id ON calificaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_repartidor_id ON calificaciones(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_usuario_id ON calificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_creado_en ON calificaciones(creado_en DESC);

-- Crear vista para promedios de calificaciones de productos
CREATE OR REPLACE VIEW producto_ratings AS
SELECT
  p.id,
  COUNT(c.id) as total_ratings,
  ROUND(AVG(c.puntuacion)::numeric, 2) as promedio_puntuacion,
  MIN(c.puntuacion) as puntuacion_minima,
  MAX(c.puntuacion) as puntuacion_maxima
FROM productos p
LEFT JOIN calificaciones c ON p.id = c.producto_id
GROUP BY p.id;

-- Crear vista para promedios de calificaciones de repartidores
CREATE OR REPLACE VIEW repartidor_ratings AS
SELECT
  r.id,
  COUNT(c.id) as total_ratings,
  ROUND(AVG(c.puntuacion)::numeric, 2) as promedio_puntuacion,
  MIN(c.puntuacion) as puntuacion_minima,
  MAX(c.puntuacion) as puntuacion_maxima
FROM repartidores r
LEFT JOIN calificaciones c ON r.id = c.repartidor_id
GROUP BY r.id;

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_calificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_calificaciones_updated_at_trigger ON calificaciones;
CREATE TRIGGER update_calificaciones_updated_at_trigger
BEFORE UPDATE ON calificaciones
FOR EACH ROW
EXECUTE FUNCTION update_calificaciones_updated_at();

-- RLS (Row Level Security)
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver todas las calificaciones
CREATE POLICY "Ver calificaciones" ON calificaciones
  FOR SELECT
  USING (true);

-- Usuarios pueden crear calificaciones para sí mismos
CREATE POLICY "Crear calificación" ON calificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden actualizar sus propias calificaciones
CREATE POLICY "Actualizar calificación propia" ON calificaciones
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden eliminar sus propias calificaciones
CREATE POLICY "Eliminar calificación propia" ON calificaciones
  FOR DELETE
  USING (auth.uid() = usuario_id);
