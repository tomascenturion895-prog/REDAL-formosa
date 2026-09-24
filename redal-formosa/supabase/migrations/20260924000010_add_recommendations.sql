-- Tabla de historial de vistas/interacciones (para futuro)
CREATE TABLE IF NOT EXISTS product_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  tipo VARCHAR(50), -- 'vista', 'favorito', 'compra'
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id, tipo)
);

CREATE INDEX idx_product_interactions_usuario ON product_interactions(usuario_id);
CREATE INDEX idx_product_interactions_tipo ON product_interactions(tipo);

-- View: Productos similares (misma categoría)
CREATE OR REPLACE VIEW productos_similares AS
SELECT
  p1.id as producto_id,
  p2.id as similar_id,
  p2.nombre,
  p2.precio,
  p2.imagen_principal,
  CASE
    WHEN p1.productor_id = p2.productor_id THEN 10
    WHEN p1.categoria = p2.categoria THEN 5
    ELSE 1
  END as relevancia
FROM productos p1
JOIN productos p2 ON (
  (p1.productor_id = p2.productor_id OR p1.categoria = p2.categoria)
  AND p1.id != p2.id
  AND p1.validado = TRUE
  AND p2.validado = TRUE
)
ORDER BY relevancia DESC;

-- View: Productos más vendidos
CREATE OR REPLACE VIEW top_products AS
SELECT
  dp.producto_id,
  pr.nombre,
  pr.precio,
  pr.imagen_principal,
  COUNT(DISTINCT dp.pedido_id) as veces_comprado,
  SUM(dp.cantidad) as total_vendido,
  AVG(dp.cantidad) as promedio_cantidad
FROM detalle_pedido dp
JOIN productos pr ON dp.producto_id = pr.id
WHERE pr.validado = TRUE
GROUP BY dp.producto_id, pr.nombre, pr.precio, pr.imagen_principal
ORDER BY veces_comprado DESC
LIMIT 100;

-- View: Productos nuevos
CREATE OR REPLACE VIEW nuevos_productos AS
SELECT
  id,
  nombre,
  precio,
  imagen_principal,
  categoria,
  creado_en
FROM productos
WHERE validado = TRUE
ORDER BY creado_en DESC
LIMIT 50;

-- View: Para usuario, productos basados en favoritos
CREATE OR REPLACE VIEW usuario_recomendaciones_favoritos AS
SELECT
  w.usuario_id,
  ps.similar_id as producto_id,
  ps.nombre,
  ps.precio,
  ps.imagen_principal,
  ps.relevancia,
  'basado_en_favoritos' as razon
FROM wishlist w
JOIN productos_similares ps ON w.producto_id = ps.producto_id
WHERE w.usuario_id IS NOT NULL
ORDER BY w.usuario_id, ps.relevancia DESC;

-- View: Para usuario, productos basados en compras
CREATE OR REPLACE VIEW usuario_recomendaciones_compras AS
SELECT
  p.usuario_id,
  ps.similar_id as producto_id,
  ps.nombre,
  ps.precio,
  ps.imagen_principal,
  ps.relevancia,
  'basado_en_compras' as razon
FROM pedidos p
JOIN detalle_pedido dp ON p.id = dp.pedido_id
JOIN productos_similares ps ON dp.producto_id = ps.producto_id
WHERE p.usuario_id IS NOT NULL
GROUP BY p.usuario_id, ps.similar_id, ps.nombre, ps.precio, ps.imagen_principal, ps.relevancia
ORDER BY p.usuario_id, COUNT(DISTINCT p.id) DESC;
