-- Agregar columna tsvector para búsqueda full-text
ALTER TABLE productos ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', COALESCE(nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(unidad, '')), 'C')
  ) STORED;

-- Crear índice GIN para búsqueda eficiente
CREATE INDEX idx_productos_search_vector ON productos USING gin(search_vector);

-- Función de búsqueda con filtros
CREATE OR REPLACE FUNCTION search_productos(
  search_query TEXT,
  price_min NUMERIC DEFAULT 0,
  price_max NUMERIC DEFAULT 999999,
  disponible_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  descripcion TEXT,
  precio NUMERIC,
  unidad TEXT,
  disponible BOOLEAN,
  imagen_principal TEXT,
  creado_en TIMESTAMP WITH TIME ZONE,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.unidad,
    p.disponible,
    p.imagen_principal,
    p.creado_en,
    ts_rank(p.search_vector, plainto_tsquery('spanish', search_query))::REAL as relevance
  FROM productos p
  WHERE
    (search_query = '' OR p.search_vector @@ plainto_tsquery('spanish', search_query))
    AND p.precio BETWEEN price_min AND price_max
    AND (NOT disponible_only OR p.disponible = TRUE)
    AND p.validado = TRUE
  ORDER BY relevance DESC, p.creado_en DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- View con categorías y estadísticas por categoría
CREATE OR REPLACE VIEW categoria_stats AS
SELECT
  COALESCE(categoria, 'Sin categoría') as categoria,
  COUNT(*) as total_productos,
  AVG(precio) as precio_promedio,
  MIN(precio) as precio_minimo,
  MAX(precio) as precio_maximo,
  COUNT(*) FILTER (WHERE disponible = TRUE) as disponibles
FROM productos
WHERE validado = TRUE
GROUP BY categoria;
