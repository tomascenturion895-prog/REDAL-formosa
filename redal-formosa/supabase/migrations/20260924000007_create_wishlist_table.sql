-- Crear tabla de wishlist/favoritos
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Índices
CREATE INDEX idx_wishlist_usuario ON wishlist(usuario_id);
CREATE INDEX idx_wishlist_producto ON wishlist(producto_id);

-- RLS Policies
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven solo sus propios favoritos
CREATE POLICY "Usuarios ven sus favoritos"
  ON wishlist FOR SELECT
  USING (auth.uid() = usuario_id);

-- Los usuarios pueden agregar a favoritos
CREATE POLICY "Usuarios agregan favoritos"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden remover de favoritos
CREATE POLICY "Usuarios removen favoritos"
  ON wishlist FOR DELETE
  USING (auth.uid() = usuario_id);

-- View para contar favoritos por producto
CREATE OR REPLACE VIEW producto_favoritos_count AS
SELECT
  p.id,
  COUNT(w.id) as total_favoritos
FROM productos p
LEFT JOIN wishlist w ON p.id = w.producto_id
GROUP BY p.id;
