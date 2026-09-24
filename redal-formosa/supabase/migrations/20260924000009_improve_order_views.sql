-- View mejorado para pedidos del usuario con estadísticas
CREATE OR REPLACE VIEW usuario_pedidos AS
SELECT
  p.id,
  p.usuario_id,
  p.estado,
  p.total,
  p.creado_en,
  p.actualizado_en,
  COUNT(di.id) as cantidad_items,
  SUM(di.cantidad) as total_unidades,
  (SELECT COUNT(*) FROM detalle_pedido WHERE pedido_id = p.id) as detalles_count
FROM pedidos p
LEFT JOIN detalle_pedido di ON p.id = di.pedido_id
GROUP BY p.id, p.usuario_id, p.estado, p.total, p.creado_en, p.actualizado_en;

-- View con detalles de cada item del pedido
CREATE OR REPLACE VIEW pedido_detalles_completos AS
SELECT
  dp.id as detalle_id,
  dp.pedido_id,
  dp.producto_id,
  dp.cantidad,
  dp.precio_unitario,
  dp.subtotal,
  pr.nombre as producto_nombre,
  pr.imagen_principal as producto_imagen,
  pr.unidad as producto_unidad,
  pe.estado as pedido_estado,
  pe.usuario_id,
  pe.total as pedido_total,
  pe.creado_en as pedido_fecha
FROM detalle_pedido dp
JOIN productos pr ON dp.producto_id = pr.id
JOIN pedidos pe ON dp.pedido_id = pe.id;

-- View estadísticas de compras del usuario
CREATE OR REPLACE VIEW usuario_compras_stats AS
SELECT
  p.usuario_id,
  COUNT(DISTINCT p.id) as total_pedidos,
  SUM(p.total) as gasto_total,
  AVG(p.total) as gasto_promedio,
  COUNT(DISTINCT dp.producto_id) as productos_diferentes,
  SUM(dp.cantidad) as total_unidades,
  MAX(p.creado_en) as ultimo_pedido
FROM pedidos p
LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
WHERE p.estado NOT IN ('cancelado')
GROUP BY p.usuario_id;

-- Índices para performance
CREATE INDEX idx_usuario_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_usuario_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_detalle_pedido_producto ON detalle_pedido(producto_id);
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);
